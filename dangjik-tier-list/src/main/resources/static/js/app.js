/* ════════════════════════════════════════
   당직사관 티어리스트 - Main App JS
   ════════════════════════════════════════ */

const API = '/api';

// ── 로컬 userId (평점 중복 방지) ──
function getUserId() {
  let id = localStorage.getItem('dangjik_uid');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('dangjik_uid', id);
  }
  return id;
}

// ── Toast ──
function toast(msg, duration = 2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

// ── Tier 레이블 ──
const TIER_LABELS = {
  CHALLENGER: '챌린저',
  DIAMOND:    '다이아',
  PLATINUM:   '플래티넘',
  GOLD:       '골드',
  SILVER:     '실버',
  BRONZE:     '브론즈',
};

function tierBadge(tier) {
  const label = TIER_LABELS[tier] || tier;
  return `<span class="tier-badge tier-${tier}">${label}</span>`;
}

// ── 별점 렌더 (읽기 전용) ──
function starsReadonly(avg) {
  let html = '<div class="stars">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= Math.round(avg) ? 'on' : ''}">★</span>`;
  }
  html += '</div>';
  return html;
}

// ── 점수 칩 ──
function scoreChip(n) {
  if (n > 0)  return `<span class="score-chip score-pos">+${n}</span>`;
  if (n < 0)  return `<span class="score-chip score-neg">${n}</span>`;
  return `<span class="score-chip score-zero">0</span>`;
}

// ── 분 → HH:MM ──
function minutesToTime(mins) {
  if (!mins) return '--:--';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

// ════════════════════════════════════════
//  INDEX PAGE
// ════════════════════════════════════════

async function initIndexPage() {
  await loadOfficerList();
}

async function loadOfficerList() {
  const res = await fetch(`${API}/officers`);
  const officers = await res.json();

  const grid = document.getElementById('officerGrid');
  if (!officers.length) {
    grid.innerHTML = `<div class="empty"><div class="icon">🎖️</div>등록된 당직사관이 없습니다.</div>`;
    return;
  }

  grid.innerHTML = officers.map(o => {
    const avg = o.averageRating?.toFixed(1) ?? '0.0';
    return `
    <div class="officer-card" onclick="location.href='/officer.html?id=${o.id}'">
      <div class="meta-row" style="margin-bottom:10px;">
        ${tierBadge(o.tier)}
        <span class="score" style="font-weight:700;font-size:1rem;">${o.totalScore}점</span>
      </div>
      <div class="name">${escHtml(o.name)}</div>
      <div class="rank">${escHtml(o.rank)}</div>
      <div class="meta-row" style="margin-top:14px;">
        ${starsReadonly(o.averageRating)}
        <span style="color:var(--text-sub);font-size:.85rem;">${avg} / 5.0</span>
      </div>
      <div style="margin-top:10px;font-size:.8rem;color:var(--text-sub);">
        당직 ${o.dutyRecords?.length ?? 0}회
      </div>
    </div>`;
  }).join('');
}

// ════════════════════════════════════════
//  OFFICER DETAIL PAGE
// ════════════════════════════════════════

async function initDetailPage() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.href = '/'; return; }
  await loadOfficerDetail(id);
}

async function loadOfficerDetail(id) {
  const res = await fetch(`${API}/officers/${id}`);
  if (!res.ok) { location.href = '/'; return; }
  const o = await res.json();

  // header
  document.getElementById('detailName').textContent = o.name;
  document.getElementById('detailRank').textContent = o.rank;
  document.getElementById('detailTier').innerHTML   = tierBadge(o.tier);

  // stats
  const avgDist   = minutesToTime(o.averageDistributionMinutes);
  const avgReturn = minutesToTime(o.averageReturnMinutes);
  const avgRating = (o.averageRating ?? 0).toFixed(2);
  const ratingCount = o.ratings?.length ?? 0;

  document.getElementById('statScore').textContent   = `${o.totalScore}점`;
  document.getElementById('statDist').textContent    = avgDist;
  document.getElementById('statReturn').textContent  = avgReturn;
  document.getElementById('statRating').innerHTML    =
    `${avgRating} <span style="font-size:.85rem;color:var(--text-sub)">(${ratingCount}명)</span>`;

  // star rating (user)
  renderUserRating(id, o);

  // records table
  renderRecords(o.dutyRecords ?? []);
}

function renderUserRating(officerId, officer) {
  const uid = getUserId();
  const already = officer.ratings?.some(r => r.userId === uid) ?? false;
  const container = document.getElementById('ratingContainer');
  if (!container) return;

  if (already) {
    const myScore = officer.ratings.find(r => r.userId === uid)?.score ?? 0;
    container.innerHTML = `
      <div style="color:var(--text-sub);font-size:.85rem;">평점을 이미 남기셨습니다.</div>
      ${starsReadonly(myScore)}`;
    return;
  }

  let hovered = 0;
  let selected = 0;

  container.innerHTML = `
    <div style="font-size:.85rem;color:var(--text-sub);margin-bottom:8px;">이 당직사관을 평가해주세요</div>
    <div class="stars" id="interactiveStars">
      ${[1,2,3,4,5].map(i => `<span class="star" data-v="${i}">★</span>`).join('')}
    </div>
    <button class="btn btn-primary" id="submitRating" style="margin-top:12px;display:none;">평가 제출</button>`;

  const stars = container.querySelectorAll('.star');
  stars.forEach(s => {
    s.addEventListener('mouseenter', () => {
      hovered = +s.dataset.v;
      stars.forEach(x => x.classList.toggle('on', +x.dataset.v <= hovered));
    });
    s.addEventListener('mouseleave', () => {
      hovered = 0;
      stars.forEach(x => x.classList.toggle('on', +x.dataset.v <= selected));
    });
    s.addEventListener('click', () => {
      selected = +s.dataset.v;
      stars.forEach(x => x.classList.toggle('on', +x.dataset.v <= selected));
      document.getElementById('submitRating').style.display = 'inline-block';
    });
  });

  document.getElementById('submitRating').addEventListener('click', async () => {
    if (!selected) return;
    const r = await fetch(`${API}/officers/${officerId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid, score: selected }),
    });
    if (r.ok) {
      toast('평점이 등록되었습니다!');
      await loadOfficerDetail(officerId);
    } else {
      const d = await r.json();
      toast(d.message ?? '오류가 발생했습니다.');
    }
  });
}

function renderRecords(records) {
  const tbody = document.getElementById('recordsBody');
  if (!records.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-sub);padding:30px;">기록 없음</td></tr>`;
    return;
  }
  tbody.innerHTML = records.map(r => {
    const total = r.distributionScore + r.returnScore;
    return `<tr>
      <td>${escHtml(r.date ?? '')}</td>
      <td>${escHtml(r.phoneDistributionTime ?? '--:--')}</td>
      <td>${scoreChip(r.distributionScore)}</td>
      <td>${escHtml(r.phoneReturnTime ?? '--:--')}</td>
      <td>${scoreChip(r.returnScore)}</td>
      <td>${scoreChip(total)}</td>
      <td style="max-width:200px;word-break:break-all">${escHtml(r.notes ?? '')}</td>
    </tr>`;
  }).join('');
}

// ── XSS 방어 ──
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
