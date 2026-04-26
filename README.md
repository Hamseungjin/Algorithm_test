# Polymarket True ROI Calculator

Polymarket 지갑의 **진짜 ROI**를 계산하는 프로덕션급 Next.js 14 웹 애플리케이션입니다.
Polymarket 자체 PnL은 외부 입출금을 무시해서 왜곡되기 때문에, CLOB 거래 내역과 Polygon
온체인 USDC 입출금 기록을 결합하여 실제 현금 흐름 기반의 ROI를 계산합니다.

```
trueProfit = currentBalance + totalWithdraw − totalDeposit
trueROI    = (trueProfit / totalDeposit) × 100
```

---

## 목차

1. [기술 스택](#기술-스택)
2. [프로젝트 구조](#프로젝트-구조)
3. [실행 방법](#실행-방법)
4. [환경 변수](#환경-변수)
5. [npm 스크립트](#npm-스크립트)
6. [API 명세서](#api-명세서)
7. [주요 기능](#주요-기능)
8. [배포](#배포-vercel)
9. [트러블슈팅](#트러블슈팅)

---

## 기술 스택

| 분류 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript (strict mode + `noUncheckedIndexedAccess`) |
| 스타일링 | Tailwind CSS (다크모드 기본) |
| 전역 상태 | Zustand |
| 차트 | Recharts (ComposedChart + Scatter) |
| 데이터 소스 | Polymarket CLOB · Gamma · Polygonscan · Polygon RPC |
| 배포 | Vercel |

---

## 프로젝트 구조

```
app/
  api/
    trades/route.ts        # CLOB /trades 프록시 (CORS 우회)
    transfers/route.ts     # Polygonscan / RPC 프록시
    profile/route.ts       # Gamma /profiles 프록시
  layout.tsx               # 글로벌 레이아웃 (다크모드)
  page.tsx                 # 메인 페이지 (대시보드)
  globals.css              # Tailwind + 커스텀 스타일
components/
  WalletInput.tsx          # 지갑 주소 입력 + 검증
  LoadingProgress.tsx      # 5단계 진행 상태 + 에러 재시도
  SummaryCards.tsx         # 6개 요약 카드
  AssetChart.tsx           # 자산 흐름 차트 (1D/1W/1M/ALL)
  PnLComparison.tsx        # Polymarket vs True PnL 비교
  TradeLogTable.tsx        # 거래 로그 + 정렬 + CSV 다운로드
  SkeletonCard.tsx         # 로딩 스켈레톤
lib/
  constants.ts             # Polymarket 주소 셋, USDC 컨트랙트, RPC URL
  fetcher.ts               # 타임아웃 포함 fetch 래퍼
  cache.ts                 # 서버 사이드 Map 캐시 (TTL 5분)
  polymarket.ts            # CLOB 거래 페이지네이션 + Gamma 프로필
  polygon.ts               # USDC Transfer 조회 + 입출금 분류
  calculations.ts          # 메트릭 계산 + 차트 데이터 + 포맷터
store/
  walletStore.ts           # Zustand 스토어 (5단계 분석 파이프라인)
types/
  index.ts                 # 모든 도메인 타입
```

---

## 실행 방법

### 1. 사전 요구사항

- **Node.js 18.17 이상** (Next.js 14 권장)
- npm 9 이상

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

생성된 `.env.local`을 열어 본인의 키를 입력합니다 (자세한 내용은 [환경 변수](#환경-변수) 섹션 참고).

```env
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_BASE_PATH=/next
```

> `POLYGONSCAN_API_KEY`가 없거나 한도를 초과하면 자동으로 RPC `eth_getLogs` 폴백으로 전환됩니다.
>
> `NEXT_PUBLIC_BASE_PATH`는 nginx 등 리버스 프록시 뒤에서 서브 경로(예: `/next/`)로
> 서비스할 때 사용합니다. 도메인 루트에서 서비스하면 비워 두세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3001` 으로 접속합니다.
basePath가 `/next`로 설정돼 있다면 `http://localhost:3001/next` 로 접속해야 합니다.

### 5. 사용 방법

1. 메인 페이지에서 분석할 **Polymarket 지갑 주소** (Polygon 네트워크의 `0x` 주소) 입력
2. **Analyze** 버튼 클릭
3. 5단계 로딩이 진행되면서 거래/입출금 데이터를 수집·분석
4. 요약 카드, 자산 흐름 차트, PnL 비교, 거래 로그 결과 확인
5. 필요 시 거래 로그를 **CSV로 다운로드**

---

## 환경 변수

| 변수 | 필수 여부 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `POLYGONSCAN_API_KEY` | 권장 | (없음) | Polygonscan 무료 키. 미입력 시 RPC 폴백 사용. 무료 키는 5 req/sec 제한이 있어 코드 내에서 250ms delay를 둠. |
| `NEXT_PUBLIC_RPC_URL` | 선택 | `https://polygon-rpc.com` | 1차 Polygon RPC. 실패 시 `https://rpc.ankr.com/polygon`으로 자동 폴백. |
| `NEXT_PUBLIC_BASE_PATH` | 선택 | `""` | 리버스 프록시 서브 경로(예: `/next`). 설정 시 모든 페이지/자산/API가 해당 prefix 아래에서 서비스됩니다. |

`.env.local` 파일은 `.gitignore`로 커밋되지 않습니다.

---

## npm 스크립트

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 (포트 3000, HMR) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 빌드 실행 |
| `npm run lint` | Next.js + ESLint 검사 |
| `npm run typecheck` | TypeScript strict 타입 체크 |

---

## API 명세서

모든 외부 API 호출은 CORS 우회를 위해 `/app/api/*` 라우트를 통해 프록시됩니다.
응답은 5분 동안 메모리에 캐시되어 동일 지갑 주소에 대한 중복 호출을 방지합니다.

### 공통 사항

- **Base URL**: `/api`
- **메서드**: 모든 엔드포인트 `GET`
- **인증**: 없음 (서버에서 외부 API 키만 사용)
- **응답 형식**: `application/json`
- **타임아웃**: 10초
- **공통 에러 응답**:
  ```json
  { "error": "에러 메시지" }
  ```
  | 상태 코드 | 의미 |
  | --- | --- |
  | 400 | 잘못된 지갑 주소 형식 (`0x[a-fA-F0-9]{40}` 정규식 미일치) |
  | 502 | 외부 API(CLOB/Gamma/Polygonscan/RPC) 호출 실패 |

---

### 1. `GET /api/trades`

특정 지갑 주소의 모든 Polymarket CLOB 거래 내역을 가져옵니다. 페이지네이션이 자동
처리되어 `next_cursor`가 `LTE=` 또는 빈 값이 될 때까지 반복 호출합니다.

#### 요청

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `address` | string | ✅ | 분석 대상 지갑 주소 (0x40hex) |

```bash
curl "http://localhost:3000/api/trades?address=0xabc...123"
```

#### 응답 (200 OK)

```jsonc
{
  "trades": [
    {
      "id": "string",
      "takerOrderId": "string",
      "market": "string",          // market conditionId
      "assetId": "string",
      "side": "BUY" | "SELL",
      "size": 1234.56,             // number로 변환됨
      "feeRateBps": 0,
      "price": 0.42,               // 0~1 사이 확률 가격
      "status": "MATCHED",
      "matchTime": 1714000000,     // Unix timestamp (초)
      "outcome": "Yes" | "No",
      "makerAddress": "0x...",
      "transactionHash": "0x...",
      "bucketIndex": 0,
      "type": "string"
    }
  ]
}
```

#### 내부 동작

- 업스트림: `https://clob.polymarket.com/trades?maker_address={address}&limit=500`
- `next_cursor`로 페이지네이션 (최대 200페이지 안전 가드)
- 응답을 `Trade` 타입으로 정규화 (string → number 변환)

---

### 2. `GET /api/transfers`

지갑의 USDC 입출금 내역을 가져와 **외부 입금 / 외부 출금 / 내부 거래**로 분류합니다.

#### 요청

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `address` | string | ✅ | 분석 대상 지갑 주소 |

```bash
curl "http://localhost:3000/api/transfers?address=0xabc...123"
```

#### 응답 (200 OK)

```jsonc
{
  "transfers": [
    {
      "hash": "0x...",
      "blockNumber": 55000000,
      "timestamp": 1714000000,                     // Unix seconds
      "from": "0x...",
      "to": "0x...",
      "amount": 100.0,                             // USDC (6 decimals 정규화)
      "direction": "deposit" | "withdrawal" | "internal",
      "counterparty": "0x..."
    }
  ]
}
```

#### 분류 규칙

`POLYMARKET_ADDRESSES` 셋(Exchange, NegRisk Exchange, NegRisk Adapter, Proxy
Wallet Factory, Burn/Mint)을 기준으로 다음과 같이 분류합니다:

| 조건 | 분류 |
| --- | --- |
| `to == wallet` 그리고 `from`이 Polymarket 주소가 **아님** | `deposit` (외부 입금) |
| `from == wallet` 그리고 `to`가 Polymarket 주소가 **아님** | `withdrawal` (외부 출금) |
| 그 외 (Polymarket 컨트랙트와의 상호작용) | `internal` (제외 대상) |

#### 데이터 소스 우선순위

1. **Polygonscan API** (`POLYGONSCAN_API_KEY` 존재 시)
   - `https://api.polygonscan.com/api?module=account&action=tokentx&contractaddress=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174&address={wallet}&sort=asc&apikey={key}`
   - 5 req/sec 제한 대응을 위해 호출 전 250ms delay
2. **Polygon RPC `eth_getLogs` 폴백** (Polygonscan 실패 또는 키 없음)
   - 1차: `NEXT_PUBLIC_RPC_URL` (기본값 `https://polygon-rpc.com`)
   - 2차: `https://rpc.ankr.com/polygon`
   - Transfer topic: `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`
   - 블록 범위 9,000개씩 분할 조회 (RPC 한도 회피)
   - 발신/수신 로그를 모두 수집한 후 dedupe

---

### 3. `GET /api/profile`

Polymarket Gamma API에서 프로필 정보 및 자체 PnL/현재 포지션 평가액을 가져옵니다.

#### 요청

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `address` | string | ✅ | 분석 대상 지갑 주소 |

```bash
curl "http://localhost:3000/api/profile?address=0xabc...123"
```

#### 응답 (200 OK)

```jsonc
{
  "profile": {
    "name": "string",
    "bio": "string",
    "profit": 1234.56,           // Polymarket 자체 PnL ($)
    "volume": 50000.00,          // 누적 거래액 ($)
    "positionsValue": 789.01,    // 현재 포지션 평가액 ($)
    "tradesCount": 42
  }
}
```

#### 내부 동작

- 업스트림: `https://gamma-api.polymarket.com/profiles/{address}`
- Gamma 응답 키 변형(`positions_value` vs `positionsValue`)을 양쪽 다 지원

---

### 캐싱

세 엔드포인트 모두 서버 사이드에서 `Map<string, {data, timestamp}>` 기반의 5분
TTL 캐시를 사용합니다(`lib/cache.ts`). 동일 지갑 주소를 5분 이내에 다시 조회하면
업스트림 호출 없이 즉시 응답합니다.

---

## 주요 기능

### 1. 지갑 주소 입력 (`WalletInput`)
- `0x` 접두 + 40자리 16진수 정규식으로 인라인 검증
- 잘못된 형식이면 입력창 하단에 즉시 에러 메시지
- 분석 중에는 입력 비활성화, **Reset** 버튼으로 초기화

### 2. 5단계 로딩 진행 (`LoadingProgress`)
순서대로 시각화되는 진행 상태:

1. ✅ 거래 내역 수집 중… (CLOB API)
2. ✅ 온체인 전송 기록 조회 중… (Polygon)
3. ✅ 입출금 분류 중…
4. ✅ 수익 계산 중…
5. ✅ 차트 데이터 생성 중…

에러 발생 시 메시지 표시 + **Retry** 버튼 제공.

### 3. 6개 요약 카드 (`SummaryCards`)

| # | 카드 | 색상 강조 |
| --- | --- | --- |
| 1 | 총 입금액 | 초록 |
| 2 | 총 출금액 | 빨강 |
| 3 | 총 거래 수 | 중립 |
| 4 | 현재 잔고 | 파랑 |
| 5 | 진짜 손익 (True Profit) | + 초록 / − 빨강 (강조) |
| 6 | 진짜 ROI % (True ROI) | + 초록 / − 빨강 (강조) |

### 4. 자산 흐름 차트 (`AssetChart`)
- Recharts `ComposedChart` 기반
- **파란 영역선**: 시간대별 자산 총액 추이
- **초록 원형 마커**: 외부 입금 (호버 시 금액·해시 표시)
- **빨간 원형 마커**: 외부 출금 (호버 시 금액·해시 표시)
- 기간 필터: **1D / 1W / 1M / ALL**
- 커스텀 Tooltip: 날짜, 자산가치, tx hash 앞 8자리

### 5. PnL 비교 (`PnLComparison`)

| 구분 | 폴리마켓 표시 | 실제 계산 | 차이 |
| --- | --- | --- | --- |
| 손익 | $X | $Y | $Z |

차이가 발생한 이유를 자연어로 설명 (예: "Polymarket이 출금된 수익을 무시하여 진짜
이익을 과소 표시 중").

### 6. 거래 로그 테이블 (`TradeLogTable`)
- 컬럼: **날짜 / 마켓 / 포지션(Yes/No + BUY/SELL) / 가격 / 수량 / 금액**
- 컬럼 헤더 클릭 시 오름·내림차순 정렬 토글
- 페이지당 20개 + Prev/Next 페이지네이션
- **Download CSV** 버튼으로 정렬 상태가 반영된 거래 내역을 CSV로 내보내기

### 7. 빈 상태 / 에러 처리
- 거래·전송 모두 0건이면 "No activity found" 카드
- API 타임아웃(10초) → 에러 카드 + Retry
- Polygonscan 한도 초과 → 자동으로 RPC 폴백
- 모든 fetch는 try/catch + 의미 있는 에러 메시지

### 8. 데이터 정확성 보장
- USDC 6 decimals 정규화 (`/ 1_000_000`)
- Polymarket 컨트랙트 5종 셋으로 내부 거래 필터링 → 입출금 통계 왜곡 방지
- CLOB 페이지네이션 안전 가드 (최대 200페이지)
- 동일 트랜잭션 해시 + 토픽 조합으로 RPC 로그 dedupe

---

## 배포 (Vercel)

1. Vercel 프로젝트에 이 저장소 연결
2. 프로젝트 Settings → Environment Variables에 다음을 추가
   - `POLYGONSCAN_API_KEY`
   - `NEXT_PUBLIC_RPC_URL` (선택)
3. Deploy 클릭. 별도 빌드 설정 불필요.

---

## 자체 서버 배포 (nginx 리버스 프록시 / 서브 경로)

도메인 루트가 다른 앱에 점유돼 있고 이 앱을 **`/next/` 서브 경로**로 서비스하고
싶을 때 사용하는 패턴입니다.

### 1) Next.js 측 설정

`.env.local`에 다음을 추가하면 모든 페이지·자산·API가 `/next/` 아래로 서비스됩니다.

```env
NEXT_PUBLIC_BASE_PATH=/next
```

`package.json`의 dev/start 스크립트가 포트 **3001**을 사용하도록 이미 고정돼 있습니다.

```bash
NEXT_PUBLIC_BASE_PATH=/next npm run build
NEXT_PUBLIC_BASE_PATH=/next npm run start   # 0.0.0.0:3001
```

> **중요**: `basePath`는 빌드 타임에 정적으로 결정됩니다. 환경 변수가 빌드와
> 런타임 모두에 같은 값으로 들어가야 합니다. PM2/systemd로 띄울 때는 서비스
> 정의에 `Environment=NEXT_PUBLIC_BASE_PATH=/next`를 같이 넣어주세요.

### 2) nginx 설정 예시

```nginx
location /next/ {
    proxy_pass http://127.0.0.1:3001;     # 끝에 슬래시(/) 없음 — 그대로 전달
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;   # HMR 웹소켓
    proxy_set_header Connection "upgrade";
}
```

`proxy_pass`에 trailing slash가 없어야 nginx가 `/next/...` 경로를 그대로
포워딩합니다. 그래야 Next.js의 `basePath: "/next"`와 정확히 매칭됩니다.

### 3) trailing slash 일치

`next.config.mjs`는 `trailingSlash: true`로 설정돼 있습니다. 사용자의 nginx
location은 `/next/` (trailing slash 있음)이므로, Next.js가 모든 응답·redirect를
trailing slash 형태로 만들어야 nginx와 일관됩니다.

이 설정 없이는 다음과 같이 무한 redirect가 납니다:

1. 브라우저: `GET /next/`
2. nginx: `location /next/` 매칭 → `127.0.0.1:3001/next/` 로 전달
3. Next.js (default `trailingSlash: false`): `/next/` → **308 redirect → `/next`** (slash 제거)
4. 브라우저: `GET /next` (slash 없음)
5. nginx: `location /next/` 안 맞음 → fallback location (예: code-server)
6. fallback이 어떤 경로로든 redirect → 다시 `/next/` 로 → **루프**

`trailingSlash: true`로 두면 Next.js가 항상 trailing slash 버전으로 redirect하므로
nginx의 `location /next/`와 항상 일치합니다.

### 4) 동작 검증

| URL | 응답 |
| --- | --- |
| `https://your-domain/next/` | 200 (메인 페이지) |
| `https://your-domain/next` | 308 → `/next/` |
| `https://your-domain/next/api/profile/?address=0x...` | 200 (JSON) |
| `https://your-domain/next/_next/static/...` | 200 (정적 자산) |

### 5) 정리

세 조건이 모두 맞아야 합니다:

- **빌드/런타임 환경변수**: `NEXT_PUBLIC_BASE_PATH=/next` (빌드와 start 모두)
- **`trailingSlash: true`** (이미 `next.config.mjs`에 설정됨)
- **nginx `proxy_pass` 끝에 슬래시 없음** (`http://127.0.0.1:3001;` 그대로)

---

## 트러블슈팅

| 증상 | 원인 / 해결 |
| --- | --- |
| `Polygonscan: NOTOK` 에러 | 무료 API 한도 초과. 잠시 기다리거나 키를 비우면 RPC 폴백 사용. |
| `Request timed out after 10000ms` | RPC 응답 지연. `NEXT_PUBLIC_RPC_URL`을 다른 엔드포인트로 변경하거나 재시도. |
| 거래는 있는데 입출금이 0 | 해당 지갑이 Polymarket 컨트랙트하고만 USDC를 주고받았을 가능성. 모두 `internal`로 분류된 결과. |
| `Invalid wallet address` | 0x로 시작하는 정확히 40자리 16진수만 허용. 체크섬 형식 OK. |
| Gamma API가 빈 객체 반환 | Polymarket에 등록되지 않은 지갑. 이 경우 자체 PnL/포지션은 0으로 처리되며, True ROI는 입출금만으로 계산. |

---

## 라이선스 / 면책

본 도구가 표시하는 데이터는 정보 제공 목적이며 투자·재무 조언이 아닙니다. 데이터
출처: Polymarket CLOB · Gamma · Polygon (Polygonscan / RPC).
