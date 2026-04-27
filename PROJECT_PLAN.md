# Wallet On-Chain HTML Report 프로젝트 계획서

## 1) 코드베이스 구조 제안

```text
wallet-onchain-report/
├─ SKILL.md                          # Claude용 실행 지침(트리거/절차/에러정책)
├─ PROJECT_PLAN.md                   # 본 계획서
├─ src/
│  ├─ main.py                        # CLI 엔트리포인트 (주소 입력→분석 실행→HTML 저장)
│  ├─ config.py                      # 환경변수/API 키/체인 설정 로딩
│  ├─ fetchers/
│  │  ├─ indexer_client.py           # tx/token transfer 수집
│  │  ├─ protocol_label_client.py    # 주소 라벨링/프로토콜 매핑
│  │  ├─ perp_client.py              # perp 포지션/체결 이벤트 수집
│  │  └─ price_client.py             # 시점별 USD 가격 수집
│  ├─ parsers/
│  │  ├─ event_normalizer.py         # 소스별 응답을 공통 이벤트 스키마로 정규화
│  │  └─ position_reconstructor.py   # 포지션 라이프사이클 재구성
│  ├─ analyzers/
│  │  ├─ seed_estimator.py           # 추정 시드 계산
│  │  ├─ allocation_calculator.py    # 포지션 비중(%) 계산
│  │  ├─ pnl_calculator.py           # 실현/미실현 PnL 계산
│  │  └─ market_participation.py     # 참여 시장 집계
│  ├─ utils/
│  │  ├─ time_kst.py                 # UTC→KST 변환 유틸
│  │  ├─ money.py                    # USD 포맷팅/정밀도 처리
│  │  └─ retry.py                    # 지수 백오프 재시도
│  ├─ render/
│  │  ├─ template.html               # 기본 HTML 템플릿(Chart.js 포함)
│  │  └─ html_renderer.py            # 템플릿 바인딩 및 단일 HTML 출력
│  └─ models/
│     ├─ events.py                   # 공통 이벤트 모델
│     ├─ positions.py                # 포지션 모델
│     └─ report.py                   # 리포트 뷰모델
├─ tests/
│  ├─ test_kst.py                    # KST 변환 테스트
│  ├─ test_seed_estimator.py         # 시드 계산 테스트
│  ├─ test_position_reconstruction.py# 포지션 재구성 테스트
│  └─ test_html_render.py            # file:// 렌더링 관점 최소 검증
└─ outputs/
   └─ report_<wallet>_<timestamp>.html
```

### 각 모듈 책임 범위
- `fetchers`: 외부 API 호출, 인증, pagination, retry, fallback.
- `parsers`: raw 응답을 내부 표준 이벤트 모델로 변환.
- `analyzers`: 포지션/PnL/시드/비중 등 도메인 계산 담당.
- `render`: 분석 결과를 보고서 HTML로 직렬화.
- `utils`: 시간/금액/재시도 같은 공통 유틸.
- `models`: 타입 안정성을 위한 데이터 계약 계층.

---

## 2) 개발 단계별 로드맵

### Phase 1: 데이터 수집 레이어
- 목표
  - 인덱서/가격/프로토콜 라벨/perp 소스 API 연동.
  - 동일 인터페이스의 provider abstraction 구현.
- 작업
  - API 클라이언트 + pagination + retry + rate-limit 제어.
  - fallback provider 체인 구성.
  - 샘플 지갑 2~3개로 수집 검증.
- 완료 기준
  - 지갑 주소 입력 시 표준화 전 raw 데이터셋 생성 성공.

### Phase 2: 분석 로직
- 목표
  - 포지션 재구성, 시드 추정, 비중 계산, KST 변환 완료.
- 작업
  - 이벤트 정규화 스키마 고정.
  - 포지션 상태머신(open/increase/reduce/close) 구현.
  - `estimated_seed_usd` 및 `position_weight_pct` 계산.
  - UTC→KST 포맷(`YYYY-MM-DD HH:mm:ss KST`) 강제.
- 완료 기준
  - 단위 테스트로 계산 결과 재현 가능.

### Phase 3: HTML 보고서 렌더링
- 목표
  - 단일 HTML 파일 생성 및 file:// 렌더링 호환.
- 작업
  - 헤더/요약/상세 테이블/파이차트/타임라인 섹션 구현.
  - Chart.js CDN 연결 및 데이터 직렬화.
  - 에러/품질 경고 노출 영역 추가.
- 완료 기준
  - 브라우저에서 파일 직접 열어 표/차트가 정상 동작.

### Phase 4: SKILL.md 통합 및 Claude 연동 테스트
- 목표
  - Claude가 SKILL.md만으로 주소 입력→리포트 생성까지 수행 가능.
- 작업
  - 트리거 문구 테스트(한국어/영어).
  - 실패 시나리오(히스토리 없음, 429, unsupported chain) 점검.
  - 프롬프트 예시/출력 검증 체크리스트 확정.
- 완료 기준
  - E2E dry-run 3회 연속 성공.

---

## 3) 기술 스택 추천
- **언어: Python 3.11+**
  - 데이터 파이프라인/ETL/수치 계산 생태계가 안정적이고 구현 속도가 빠름.
- **HTTP 클라이언트: httpx**
  - async/sync 모두 지원, timeout/retry 래핑 용이.
- **데이터 처리: pandas (선택), pydantic**
  - pandas: 집계/정렬/타임라인 처리 단순화.
  - pydantic: API 응답 및 내부 모델 검증.
- **템플릿 엔진: Jinja2**
  - 단일 HTML 템플릿 바인딩에 적합.
- **시간대 처리: zoneinfo (표준 라이브러리)**
  - `Asia/Seoul` 안정 처리, 외부 의존성 최소화.
- **차트: Chart.js (CDN)**
  - file:// 환경에서도 JS 로딩만 가능하면 즉시 렌더링.
- **테스트: pytest**
  - 계산 로직 회귀 테스트 구축이 쉬움.

---

## 4) 예상 난이도 및 리스크 항목

### 예상 소요 시간
- Phase 1: 2~4일
- Phase 2: 3~5일
- Phase 3: 1~2일
- Phase 4: 1~2일
- **총합:** 약 7~13일 (1인 개발 기준)

### 기술적 병목/리스크
1. **이벤트 스키마 불일치**
   - 리스크: 체인/프로토콜별 필드 차이로 파서 복잡도 증가.
   - 완화: 공통 스키마 + adapter 계층 분리.
2. **Perp 포지션 재구성 난이도**
   - 리스크: 부분청산/수수료/펀딩 반영 누락 시 PnL 오차.
   - 완화: 거래소별 상태머신 템플릿 + 정확도 플래그.
3. **가격 시계열 결측**
   - 리스크: 과거 시점 USD 환산 부정확.
   - 완화: 최근접 가격 + 오차 범위/소스 신뢰도 표시.
4. **API Rate Limit**
   - 리스크: 대형 지갑 분석 시 호출 폭증.
   - 완화: 캐시, 배치 호출, 백오프, provider failover.
5. **시드 추정의 본질적 불확실성**
   - 리스크: 외부 지갑 간 내부 이동을 입금으로 오판 가능.
   - 완화: 추정 규칙 투명화 + 가정 항목 보고서 명시.

---

## 5) MVP 기준 정의

다음 조건을 충족하면 MVP로 간주한다.
1. 단일 EVM 지갑 주소 입력 시 보고서 HTML 1개를 생성한다.
2. 최소 1개 이상의 DEX 또는 perp 시장 참여 내역을 테이블에 표시한다.
3. 포지션별 필수 필드(방향/진입가/규모/PnL/비중%)를 출력한다.
4. 모든 시각을 `YYYY-MM-DD HH:mm:ss KST` 형식으로 출력한다.
5. 요약 섹션(시장 수/거래 수/추정 시드/실현 PnL)이 채워진다.
6. 비중 파이 차트가 렌더링된다(Chart.js CDN).
7. 히스토리 없음/429/지원하지 않는 체인 중 최소 2개 이상 에러 시나리오를 보고서에 표시한다.
