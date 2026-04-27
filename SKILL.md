---
name: wallet-onchain-html-report
description: Generate a self-contained HTML report that analyzes a target wallet’s on-chain activity (DEX/protocol/perp participation, long-short position details, seed-capital allocation ratios, and KST-normalized timelines). Use when a user asks for wallet behavior analysis, position reconstruction, or downloadable/report-style HTML output from blockchain transaction history.
---

# Wallet On-Chain HTML Report Skill

## Overview
입력된 지갑 주소의 온체인 활동을 수집·정규화·분석하고, 참여 시장/포지션 상세/시드 대비 비중/KST 타임라인을 포함한 **자체 완결형(single-file) HTML 보고서**를 생성한다. 결과물은 `file://` 프로토콜로 직접 열어도 렌더링되어야 하며, 모든 금액은 USD 기준으로 표기한다.

## Trigger Conditions
이 스킬을 사용해야 하는 조건:
- 사용자가 특정 지갑 주소의 트레이딩 활동, DEX/프로토콜 사용 이력, 선물 포지션(롱/숏, 레버리지, PnL) 분석을 요청한 경우.
- 사용자가 “HTML 리포트”, “다운로드 가능한 보고서”, “self-contained report”, “파일로 보는 리포트”를 요청한 경우.
- 사용자가 거래 시간을 KST(UTC+9)로 통일해 달라고 요청한 경우.
- 사용자가 시드 대비 포지션 비중(%) 계산을 요구한 경우.

## Step-by-step Execution Plan
1. **입력 검증**
   - 지갑 주소 형식(EVM 0x...)과 체인 지원 여부를 검증한다.
   - 분석 기간(`from`, `to`)과 체인 목록(예: Ethereum, Arbitrum, Base)을 확정한다.
2. **원천 데이터 수집**
   - 트랜잭션, 토큰 전송, 내부 트랜잭션, 프로토콜 이벤트, 파생상품 포지션/체결 데이터를 API로 수집한다.
3. **데이터 정규화**
   - 이벤트를 공통 스키마로 통합한다.
   - 금액을 USD로 환산하고 시장명/프로토콜명/포지션 단위를 표준화한다.
4. **포지션 재구성**
   - 시장별로 진입/증액/부분청산/전량청산을 묶어 포지션 라이프사이클을 복원한다.
   - 방향(롱/숏), 평균 진입가, 총 규모, 레버리지, 실현/미실현 PnL을 계산한다.
5. **시드 자본 추정 및 비중 계산**
   - 정의된 규칙으로 추정 시드 자본을 계산한다.
   - 각 포지션 규모를 시드 대비 비중(%)으로 산출한다.
6. **KST 변환 및 타임라인 생성**
   - 모든 이벤트 타임스탬프를 KST(UTC+9)로 변환한다.
   - KST 기준 오름차순 정렬 타임라인을 만든다.
7. **HTML 보고서 렌더링**
   - 지정 템플릿에 데이터 바인딩한다.
   - Chart.js CDN을 이용해 비중 파이 차트를 렌더링한다.
   - 단일 HTML 파일로 저장한다.
8. **검증 및 출력**
   - `file://`로 열어 표/차트/타임라인 렌더링 여부를 확인한다.
   - 최종 파일 경로를 사용자에게 제공한다.

## Data Fetching Strategy
아래 순서로 호출하고, 각 단계 실패 시 fallback을 적용한다.

1. **지갑 기본 트랜잭션/토큰 전송 (Primary Indexer API)**
   - 예: Covalent / Alchemy / Moralis / Etherscan 계열 중 프로젝트 표준 우선.
   - 수집: tx hash, block time, method, token transfers, native transfer.
   - **Fallback:** 다른 인덱서 API로 동일 기간 재시도.
2. **프로토콜/DEX 라벨링 데이터**
   - 예: DeBank/Nansen 라벨, 자체 매핑 테이블.
   - 수집: 컨트랙트 주소→시장/프로토콜 이름.
   - **Fallback:** 온체인 주소 북(whitelist json) + method signature 추정.
3. **Perp/파생 포지션 이벤트**
   - 예: Hyperliquid, dYdX, GMX, Vertex, Aevo 등 지원 커넥터.
   - 수집: open/increase/decrease/close, size, collateral, entry/exit, leverage, funding, fee.
   - **Fallback:** 체결 이벤트 집계로 포지션 역산(정확도 플래그 부여).
4. **가격/환율(USD 환산)**
   - 예: CoinGecko/DefiLlama price API.
   - 수집: 시점별 token USD price.
   - **Fallback:** 최근접 시점 가격(허용 오차 창) 사용 + `price_source=approx` 표기.

**재시도 정책**
- HTTP 429/5xx: 지수 백오프(1s, 2s, 4s, 최대 4회).
- 부분 실패 허용: 소스별 `data_quality`를 기록하고 보고서에 노출.
- API 키는 환경변수에서만 로딩 (`${INDEXER_API_KEY}`, `${PRICE_API_KEY}` 등).

## KST 변환 로직
- 기준 시간대: `Asia/Seoul` (UTC+9, DST 없음).
- 입력이 epoch seconds/ms든 ISO8601 UTC든 내부적으로 UTC `datetime`으로 정규화 후 KST로 변환한다.
- 출력 포맷은 **반드시** `YYYY-MM-DD HH:mm:ss KST`.
- 구현 예시(의사코드):
  1. `dt_utc = parse_to_utc(raw_ts)`
  2. `dt_kst = dt_utc + 9 hours` 또는 timezone convert
  3. `format(dt_kst, "%Y-%m-%d %H:%M:%S KST")`

## 시드 비중 계산 방식
**추정 시드 자본(Estimated Seed Capital, USD)** 정의:
- 분석 기간 내 최초 외부 순유입(브리지+입금+CEX 추정 입금) 누적을 기반으로 시작 자본을 추정.
- 기간 중 추가 외부 순유입이 있으면 시드에 가산.
- 실현 손익은 재투자 가능 자본으로 간주하여 시드 조정치에 반영 가능(옵션 플래그).

권장 기본식:
- `estimated_seed_usd = max( cumulative_net_external_inflow_usd, peak_deployed_capital_usd )`

포지션 비중:
- `position_weight_pct = (position_notional_usd / estimated_seed_usd) * 100`
- `estimated_seed_usd == 0`이면 비중은 `N/A` 처리하고 오류 섹션에 사유 기록.

## HTML 템플릿 Scaffold
아래 구조를 반드시 유지한다.

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Wallet On-Chain Report</title>
  <style>
    /* 단일 파일 내 CSS 포함 (외부 CSS 금지) */
    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
    .muted { color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; }
    th, td { border: 1px solid #ddd; padding: 8px; font-size: 14px; }
    th { background: #f5f5f5; text-align: left; }
    .section { margin-top: 28px; }
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <h1>Wallet On-Chain Activity Report</h1>
    <p>Wallet: {{wallet_short}}</p>
    <p class="muted">Generated at: {{generated_at_kst}}</p>
  </header>

  <!-- Section 1: Summary -->
  <section class="section" id="summary">
    <h2>요약</h2>
    <table>
      <thead>
        <tr>
          <th>총 참여 시장 수</th>
          <th>총 거래 수</th>
          <th>추정 시드 (USD)</th>
          <th>실현 PnL (USD)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{summary.market_count}}</td>
          <td>{{summary.trade_count}}</td>
          <td>{{summary.estimated_seed_usd}}</td>
          <td>{{summary.realized_pnl_usd}}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- Section 2: Market Detail -->
  <section class="section" id="market-details">
    <h2>시장별 상세</h2>
    <table>
      <thead>
        <tr>
          <th>시장</th>
          <th>방향</th>
          <th>진입가 (USD)</th>
          <th>규모 (USD)</th>
          <th>비중 (%)</th>
          <th>진입 시각 (KST)</th>
          <th>청산 시각 (KST)</th>
          <th>PnL (USD)</th>
        </tr>
      </thead>
      <tbody>
        {{market_rows_html}}
      </tbody>
    </table>
  </section>

  <!-- Section 3: Pie Chart -->
  <section class="section" id="allocation-chart">
    <h2>비중 파이 차트</h2>
    <canvas id="allocationPie" height="120"></canvas>
  </section>

  <!-- Section 4: Timeline -->
  <section class="section" id="timeline">
    <h2>KST 기준 거래 타임라인</h2>
    <table>
      <thead>
        <tr>
          <th>시각 (KST)</th>
          <th>체인</th>
          <th>시장/프로토콜</th>
          <th>이벤트</th>
          <th>금액 (USD)</th>
          <th>Tx Hash</th>
        </tr>
      </thead>
      <tbody>
        {{timeline_rows_html}}
      </tbody>
    </table>
  </section>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    const labels = {{allocation_labels_json}};
    const values = {{allocation_values_json}};

    new Chart(document.getElementById('allocationPie'), {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data: values }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  </script>
</body>
</html>
```

## Error Handling
1. **지갑 히스토리 없음**
   - 조건: 거래/이벤트 0건.
   - 처리: 빈 보고서를 생성하되, Summary에 0값과 `No on-chain history found for selected range` 표시.
2. **API 한도 초과 (429) / 일시 장애 (5xx)**
   - 처리: 재시도 + fallback provider로 전환.
   - 최종 실패 시: 어떤 데이터 소스가 누락됐는지 `Data Quality` 섹션에 명시.
3. **지원하지 않는 체인**
   - 처리: 즉시 중단하지 말고 지원 체인만 부분 분석.
   - 보고서에 `Unsupported chain skipped: <chain_name>` 경고 노출.
4. **가격 데이터 누락**
   - 처리: 최근접 가격으로 대체하고 `approx` 태그 표시.
5. **필수 API 키 누락**
   - 처리: 런타임 에러 메시지에 주입 위치를 안내.
   - 예: `Set INDEXER_API_KEY in environment before running the skill.`

## API Key Injection Points (No Hardcoding)
- 환경변수 예시:
  - `INDEXER_API_KEY`
  - `PERP_API_KEY`
  - `PRICE_API_KEY`
- 로딩 위치:
  - 실행 초기에 환경변수 검증 함수에서 주입 여부 확인.
  - 보고서 생성 함수로는 키를 직접 전달하지 말고 API 클라이언트 초기화 단계에서만 사용.
