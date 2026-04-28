# 관리자 계정 생성 + IP 매핑 구조 제안 (Vue → API → DB)

## 1) 화면 요구사항 반영

- `계정 생성` 버튼 라벨: **관리자 계정 생성**
- 기존 `허용 IP관리` 기능(별도 IP 등록 버튼/플로우): **제거**
- 계정 생성 입력 필드:
  - 아이디 (`userId`)
  - 비밀번호 (`password`)
  - 비밀번호 확인 (`passwordCheck`)
  - 이름 (`name`) ※ 실질적으로 IP 입력
  - 권한 (`authority`)

---

## 2) 전체 처리 시퀀스

1. 프론트(Vue)에서 `name` 필드에 입력된 값을 IP로 간주하여 API로 전송
2. 백엔드 서비스에서 트랜잭션 시작
3. `AZQ30_CLIENT`에서 `IP_ADDRESS = :ip` 조회
4. 없으면 `AZQ30_CLIENT` 신규 생성, 있으면 기존 레코드 재사용
5. 매니저 생성 시:
   - `AZQ30_MANAGER.CLIENT_IDX = client.idx`
   - `AZQ30_MANAGER.NAME = encrypt(ip)`
6. 커밋 (중간 실패 시 롤백)

---

## 3) 권장 암호화 방식

### 결론
- **권장: 양방향 암호화(AES/GCM)**

### 이유
- 목록/감사/운영 과정에서 IP 원문 확인이 필요한 경우가 많음
- 단방향 해시(SHA-256, BCrypt)는 복호화 불가하므로 운영 가시성 저하
- 단, 검색 키 용도로는 `ip_hash`를 별도 저장해 인덱싱 가능

### 보안 가이드
- 암호화 키는 KMS/환경변수로 분리
- AES/GCM nonce(IV) 랜덤 생성
- 애플리케이션 로그에 IP 원문 출력 금지

---

## 4) Vue 예시

```vue
<script setup>
import { ref } from 'vue'
import axios from 'axios'

const form = ref({
  userId: '',
  password: '',
  passwordCheck: '',
  name: '', // IP 입력
  authority: 'ROLE_ADMIN'
})

const submitCreateManager = async () => {
  if (form.value.password !== form.value.passwordCheck) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }

  await axios.post('/api/admin/managers', {
    userId: form.value.userId,
    password: form.value.password,
    passwordCheck: form.value.passwordCheck,
    name: form.value.name,
    authority: form.value.authority
  })

  alert('관리자 계정이 생성되었습니다.')
}
</script>
```

---

## 5) API DTO 예시

```java
public record ManagerCreateRequest(
    String userId,
    String password,
    String passwordCheck,
    String name,      // IP 문자열
    String authority
) {}
```

---

## 6) Service 트랜잭션 예시 (Spring)

```java
@Service
@RequiredArgsConstructor
public class ManagerService {

  private final ClientRepository clientRepository;
  private final ManagerRepository managerRepository;
  private final PasswordEncoder passwordEncoder;
  private final IpCryptoService ipCryptoService;

  @Transactional
  public void createManager(ManagerCreateRequest req) {
    validate(req);

    String ip = req.name();

    Client client = clientRepository.findByIpAddress(ip)
        .orElseGet(() -> clientRepository.save(new Client(ip)));

    Manager manager = new Manager();
    manager.setMgrId(req.userId());
    manager.setPassword(passwordEncoder.encode(req.password()));
    manager.setAuthority(req.authority());
    manager.setClientIdx(client.getIdx());

    // NAME 컬럼에 원본 IP 암호화 저장
    manager.setName(ipCryptoService.encrypt(ip));

    managerRepository.save(manager);
  }

  private void validate(ManagerCreateRequest req) {
    if (!req.password().equals(req.passwordCheck())) {
      throw new IllegalArgumentException("비밀번호 확인이 일치하지 않습니다.");
    }
    // IPv4/IPv6 검증 로직 추가
  }
}
```

---

## 7) Repository 예시

```java
public interface ClientRepository extends JpaRepository<Client, Long> {
  Optional<Client> findByIpAddress(String ipAddress);
}
```

- DB에서 중복을 강하게 막으려면 `AZQ30_CLIENT.IP_ADDRESS`에 유니크 인덱스 추가 권장:

```sql
ALTER TABLE AZQ30_CLIENT
ADD CONSTRAINT UK_AZQ30_CLIENT_IP UNIQUE (IP_ADDRESS);
```

> 경쟁 상태(동시 요청) 대비를 위해 유니크 인덱스 + 예외 처리 재조회 패턴을 함께 사용하세요.

---

## 8) Controller 예시

```java
@RestController
@RequestMapping("/api/admin/managers")
@RequiredArgsConstructor
public class ManagerController {

  private final ManagerService managerService;

  @PostMapping
  public ResponseEntity<?> create(@RequestBody ManagerCreateRequest request) {
    managerService.createManager(request);
    return ResponseEntity.ok(Map.of("message", "관리자 계정 생성 완료"));
  }
}
```

---

## 9) DB 저장 결과 예시

- 입력: `name = "192.168.0.10"`
- `AZQ30_CLIENT`:
  - `IDX = 7`
  - `IP_ADDRESS = 192.168.0.10` (중복 시 기존 row 사용)
- `AZQ30_MANAGER`:
  - `CLIENT_IDX = 7`
  - `NAME = <암호문>`

---

## 10) 체크리스트

- [ ] 기존 `허용 IP관리` 버튼/화면 제거
- [ ] 계정 생성 폼에 `name`, `authority` 포함
- [ ] API 입력에서 `name`을 IP로 사용
- [ ] CLIENT upsert(재사용) + MANAGER 생성을 단일 트랜잭션 처리
- [ ] NAME 컬럼에는 IP 암호문 저장
- [ ] 동시성 대비 DB 유니크 인덱스 적용
