/* ════════════════════════════════════════
   당직사관 티어리스트 - Admin JS
   ════════════════════════════════════════ */

const API = '/api';
let adminPw = '';
let officers = [];
let ranks = [];

// ════════════════════════════════════════
//  인증
// ════════════════════════════════════════

function getAdminPw() { return sessionStorage.getItem('admin_pw') || ''; }
function setAdminPw(pw) { sessionStorage.setItem('admin_pw', pw); adminPw = pw; }

function adminHeaders(extra = {}) {
  return { 'Content-Type': 'application/json', 'X-Admin-Password': getAdminPw(), ...extra };
}

async function initAdminPage() {
  const pw = getAdminPw();
  if (!pw) {
    showAuthModal();
    return;
  }
  adminPw = pw;
  await loadAll();
}

function showAuthModal() {
  document.getElementById('authModal').classList.add('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('authForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const pw = document.getElementById('authPwInput').value;
      const res = await fetch(`${API}/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        setAdminPw(pw);
        document.getElementById('authModal').classList.remove('open');
        await loadAll();
      } else {
        document.getElementById('authError').textContent = '비밀번호가 틀렸습니다.';
      }
    });
  }
});

// ════════════════════════════════════════
//  데이터 로드
// ════════════════════════════════════════

async function loadAll() {
  await Promise.all([loadOfficers(), loadRanks()]);
}

async function loadOfficers() {
  const res = await fetch(`${API}/officers`);
  officers = await res.json();
  renderOfficerList();
}

async function loadRanks() {
  const res = await fetch(`${API}/admin/ranks`);
  ranks = await res.json();
  ranks.sort((a,b) => a.order - b.order);
  renderRankList();
  populateRankSelects();
}

// ════════════════════════════════════════
//  렌더
// ════════════════════════════════════════

function renderOfficerList() {
  const ul = document.getElementById('adminOfficerList');
  if (!officers.length) {
    ul.innerHTML = `<div class="empty"><div class="icon">🎖️</div>등록된 당직사관이 없습니다.</div>`;
    return;
  }
  ul.innerHTML = officers.map(o => `
    <div class="card" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
      <div>
        <span class="tier-badge tier-${o.tier}" style="margin-right:8px;">${TIER_LABELS[o.tier]||o.tier}</span>
        <strong>${escHtml(o.name)}</strong>
        <span style="color:var(--text-sub);margin-left:8px;font-size:.85rem;">${escHtml(o.rank)}</span>
        <span style="color:var(--text-sub);margin-left:16px;font-size:.85rem;">점수: ${o.totalScore}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-ghost" onclick="openAddRecordModal('${o.id}')">기록 추가</button>
        <button class="btn btn-ghost" onclick="openOfficerRecords('${o.id}')">기록 관리</button>
        <button class="btn btn-ghost" onclick="openEditOfficerModal('${o.id}')">수정</button>
        <button class="btn btn-danger" onclick="deleteOfficer('${o.id}')">삭제</button>
      </div>
    </div>`).join('');
}

const TIER_LABELS = {
  CHALLENGER:'챌린저', DIAMOND:'다이아', PLATINUM:'플래티넘',
  GOLD:'골드', SILVER:'실버', BRONZE:'브론즈'
};

function renderRankList() {
  const ul = document.getElementById('adminRankList');
  if (!ranks.length) {
    ul.innerHTML = '<div style="color:var(--text-sub);font-size:.9rem;">등록된 계급 없음</div>';
    return;
  }
  ul.innerHTML = ranks.map(r => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
      <span>${escHtml(r.name)} <span style="color:var(--text-sub);font-size:.8rem;">(순서 ${r.order})</span></span>
      <button class="btn btn-danger" style="padding:4px 12px;font-size:.8rem;" onclick="deleteRank('${r.id}')">삭제</button>
    </div>`).join('');
}

function populateRankSelects() {
  document.querySelectorAll('.rank-select').forEach(sel => {
    const cur = sel.value;
    sel.innerHTML = ranks.map(r => `<option value="${escHtml(r.name)}">${escHtml(r.name)}</option>`).join('');
    if (cur) sel.value = cur;
  });
}

// ════════════════════════════════════════
//  당직사관 추가
// ════════════════════════════════════════

function openAddOfficerModal() {
  document.getElementById('officerModalTitle').textContent = '당직사관 추가';
  document.getElementById('officerForm').reset();
  document.getElementById('officerEditId').value = '';
  populateRankSelects();
  document.getElementById('officerModal').classList.add('open');
}

function openEditOfficerModal(id) {
  const o = officers.find(x => x.id === id);
  if (!o) return;
  document.getElementById('officerModalTitle').textContent = '당직사관 수정';
  document.getElementById('officerEditId').value = id;
  document.getElementById('officerName').value = o.name;
  populateRankSelects();
  document.getElementById('officerRank').value = o.rank;
  document.getElementById('officerModal').classList.add('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('officerForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const id   = document.getElementById('officerEditId').value;
      const name = document.getElementById('officerName').value.trim();
      const rank = document.getElementById('officerRank').value;
      if (!name) return toast('이름을 입력해주세요.');

      const url    = id ? `${API}/admin/officers/${id}` : `${API}/admin/officers`;
      const method = id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: adminHeaders(),
        body: JSON.stringify({ name, rank }),
      });
      if (res.ok) {
        toast(id ? '수정 완료' : '추가 완료');
        document.getElementById('officerModal').classList.remove('open');
        await loadOfficers();
      } else {
        toast('오류가 발생했습니다.');
      }
    });
  }
});

async function deleteOfficer(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  const res = await fetch(`${API}/admin/officers/${id}`, {
    method: 'DELETE', headers: adminHeaders(),
  });
  if (res.ok) { toast('삭제 완료'); await loadOfficers(); }
  else toast('오류가 발생했습니다.');
}

// ════════════════════════════════════════
//  기록 추가
// ════════════════════════════════════════

function openAddRecordModal(officerId) {
  document.getElementById('recordOfficerId').value = officerId;
  document.getElementById('recordEditId').value = '';
  document.getElementById('recordModalTitle').textContent = '당직 기록 추가';
  document.getElementById('recordForm').reset();
  document.getElementById('recordDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('recordModal').classList.add('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recordForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const officerId = document.getElementById('recordOfficerId').value;
      const recordId  = document.getElementById('recordEditId').value;
      const body = {
        date:                  document.getElementById('recordDate').value,
        phoneDistributionTime: document.getElementById('distTime').value,
        phoneReturnTime:       document.getElementById('returnTime').value,
        notes:                 document.getElementById('recordNotes').value,
      };
      const url    = recordId
        ? `${API}/admin/officers/${officerId}/records/${recordId}`
        : `${API}/admin/officers/${officerId}/records`;
      const method = recordId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: adminHeaders(), body: JSON.stringify(body) });
      if (res.ok) {
        toast(recordId ? '기록 수정 완료' : '기록 추가 완료');
        document.getElementById('recordModal').classList.remove('open');
        await loadOfficers();
        // 기록 관리 모달이 열려 있으면 갱신
        if (document.getElementById('recordsModal').classList.contains('open')) {
          openOfficerRecords(officerId);
        }
      } else toast('오류가 발생했습니다.');
    });
  }
});

// ════════════════════════════════════════
//  기록 관리 모달
// ════════════════════════════════════════

async function openOfficerRecords(officerId) {
  const res = await fetch(`${API}/officers/${officerId}`);
  const o = await res.json();
  const records = o.dutyRecords ?? [];

  document.getElementById('recordsModalTitle').textContent = `${escHtml(o.name)} 기록 관리`;
  const tbody = document.getElementById('adminRecordsBody');

  if (!records.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-sub);padding:24px;">기록 없음</td></tr>`;
  } else {
    tbody.innerHTML = records.map(r => `
      <tr>
        <td>${escHtml(r.date??'')}</td>
        <td>${escHtml(r.phoneDistributionTime??'--:--')}</td>
        <td>${scoreChip(r.distributionScore)}</td>
        <td>${escHtml(r.phoneReturnTime??'--:--')}</td>
        <td>${scoreChip(r.returnScore)}</td>
        <td style="max-width:160px;word-break:break-all">${escHtml(r.notes??'')}</td>
        <td>
          <button class="btn btn-ghost" style="padding:4px 10px;font-size:.8rem;"
            onclick="openEditRecord('${officerId}','${r.id}','${escHtml(r.date??'')}','${r.phoneDistributionTime??''}','${r.phoneReturnTime??''}')">수정</button>
          <button class="btn btn-danger" style="padding:4px 10px;font-size:.8rem;"
            onclick="deleteRecord('${officerId}','${r.id}')">삭제</button>
        </td>
      </tr>`).join('');
  }
  document.getElementById('recordsModal').classList.add('open');
  // 기록 추가 버튼 연결
  document.getElementById('addRecordFromModal').onclick = () => {
    document.getElementById('recordsModal').classList.remove('open');
    openAddRecordModal(officerId);
  };
}

function openEditRecord(officerId, recordId, date, distTime, returnTime) {
  document.getElementById('recordsModal').classList.remove('open');
  document.getElementById('recordOfficerId').value = officerId;
  document.getElementById('recordEditId').value    = recordId;
  document.getElementById('recordModalTitle').textContent = '기록 수정';
  document.getElementById('recordDate').value  = date;
  document.getElementById('distTime').value    = distTime;
  document.getElementById('returnTime').value  = returnTime;
  document.getElementById('recordModal').classList.add('open');
}

async function deleteRecord(officerId, recordId) {
  if (!confirm('기록을 삭제하시겠습니까?')) return;
  const res = await fetch(`${API}/admin/officers/${officerId}/records/${recordId}`, {
    method: 'DELETE', headers: adminHeaders(),
  });
  if (res.ok) {
    toast('삭제 완료');
    await loadOfficers();
    openOfficerRecords(officerId);
  } else toast('오류가 발생했습니다.');
}

// ════════════════════════════════════════
//  계급 관리
// ════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rankForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name  = document.getElementById('rankName').value.trim();
      const order = parseInt(document.getElementById('rankOrder').value) || 99;
      if (!name) return toast('계급명을 입력해주세요.');
      const res = await fetch(`${API}/admin/ranks`, {
        method: 'POST', headers: adminHeaders(), body: JSON.stringify({ name, order }),
      });
      if (res.ok) {
        toast('계급 추가 완료');
        form.reset();
        await loadRanks();
      } else toast('오류가 발생했습니다.');
    });
  }
});

async function deleteRank(id) {
  if (!confirm('계급을 삭제하시겠습니까?')) return;
  const res = await fetch(`${API}/admin/ranks/${id}`, {
    method: 'DELETE', headers: adminHeaders(),
  });
  if (res.ok) { toast('삭제 완료'); await loadRanks(); }
  else toast('오류가 발생했습니다.');
}

// ── 모달 닫기 ──
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// ── 공통 유틸 ──
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

function scoreChip(n) {
  if (n > 0)  return `<span class="score-chip score-pos">+${n}</span>`;
  if (n < 0)  return `<span class="score-chip score-neg">${n}</span>`;
  return `<span class="score-chip score-zero">0</span>`;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
