const getApplicationInfo = () => {
    return {
        contestField: $('#contest-field').val(),
        projectName: $('#project-name').val()
    }
}
 
const checkMemberInfoRow = (memberInfo) => {
    let seq = memberInfo.sequence;
    return $(`#member-check-i${seq}`).is(':checked');
}
 
const getMemberInfoList = () => {
    let memberInfoList = [];
 
    memberInfoList.push({
        sequence: 1,
        rank: $(`#member-rank-${1}`).val(),
        rankName: $(`#member-rank-name-${1}`).val(),
        name: $(`#member-name-${1}`).val(),
        birthday: $(`#member-birthday-${1}`).val(),
        phone: $(`#member-phone-${1}`).val(),
        mail: $(`#member-mail-${1}`).val(),
        mainGroup: $(`#member-main-group-${1}`).val(),
    });
 
    for(let i=2; i<=4; i++) {
        const memberInfo = {
            sequence: i,
            rank: $(`#member-rank-${i}`).val(),
            rankName: $(`#member-rank-name-${i}`).val(),
            name: $(`#member-name-${i}`).val(),
            birthday: $(`#member-birthday-${i}`).val(),
            phone: $(`#member-phone-${i}`).val(),
            mail: $(`#member-mail-${i}`).val(),
            mainGroup: $(`#member-main-group-${i}`).val(),
        };
        if(checkMemberInfoRow(memberInfo)) {
            memberInfoList.push(memberInfo);
        }
    }
    return memberInfoList;
}
 
const getTeamInfo = () => {
    const memberInfoList = getMemberInfoList();
    return {
        teamName: $('#team-name').val(),
        userId: $('#user-id').val(),
        password: $('#password').val(),
        passwordCheck: $('#password-check').val(),
        memberInfoList: memberInfoList,
        memberCount: memberInfoList.length
    }
}
 
const getRecognitionPathList = () => {
    let recognitionPathList = [];
    const recognitionPathElemList = $('[id^=recognition-path]');
    for(let i = 0; i < recognitionPathElemList.length; i++) {
        const recognitionPathElem = recognitionPathElemList[i];
        if(recognitionPathElem.checked) recognitionPathList.push(recognitionPathElem.value);
    }
    return recognitionPathList;
}
 
const getSurveyInfo = () => {
    return {
        recognitionPathList: getRecognitionPathList(),
        etcDescription: $('#recognition-path-ETC-description').val()
    }
}
 
const getExtension = fileName => {
    var _fileLen = fileName.length;
    var _lastDot = fileName.lastIndexOf('.');
    var _fileExt = fileName.substring(_lastDot, _fileLen).toLowerCase();
    return _fileExt;
}
 
const getErrorMessage = () => {
    let msg = '';
    invalidInputIdList.forEach(elem => {
        if(elem.includes('ask-content')) msg += '문의사항' + ' : ' + $(`#ask-content-invalid-feedback`).text() + '\n';
        else if(elem.includes('participant-motivation')) msg += '참가동기*' + ' : ' + $(`#participant-motivation-invalid-feedback`).text() + '\n';
        else if(elem.includes('recognition-path')) msg += '인지경로*' + ' : ' + $(`#recognition-path-invalid-feedback`).text() + '\n';
        else if(elem.includes('member')) msg += '팀원정보*' + ' : ' + '팀원정보를 확인하세요.' + '\n';
        else msg += $(`label[for='${elem}']`).text() + ' : ' + $(`#${elem}-invalid-feedback`).text() + '\n';
    })
    return msg;
}
 
 
/* ──────────────────────────────────────────
   [수정] setFileInfo
   ────────────────────────────────────────── */
 
const setFileInfo = async (selector) => {
    const $target = $(selector);
 
    /* ↓↓↓ [추가] personal-info-file, copyright-file 은 이제 type="hidden".
              파일이 없으므로 fileMeta 에 'AGREED' 마커만 기록하고 return.  */
    if (selector === '#personal-info-file') {
        fileMeta.personalInfoFileInfo = { agreed: true };
        return;
    }
    if (selector === '#copyright-file') {
        fileMeta.copyrightFileInfo = { agreed: true };
        return;
    }
    /* ↑↑↑ [추가] 끝 */
 
    const file = $target[0]?.files?.[0];
    if (!file) return;
 
    const origFileName = file.name;
    const extension = getExtension(origFileName);
    const meta = { origFileName, extension };
 
    switch (selector) {
        /* ↓ [삭제] copyright-file, personal-info-file case 제거
           (위에서 이미 처리하고 return 했으므로 여기 도달 안 함) */
        case '#idea-plan-file':    fileMeta.ideaPlanFileInfo    = meta; break;
        case '#idea-summary-file': fileMeta.ideaSummaryFileInfo = meta; break;
        default: break;
    }
}
 
 
/* ──────────────────────────────────────────
   기존 코드 — 변경 없음
   ────────────────────────────────────────── */
 
const fileMeta = {
    copyrightFileInfo:    null,   // setFileInfo 에서 { agreed: true } 로 채워짐
    ideaPlanFileInfo:     null,
    ideaSummaryFileInfo:  null,
    personalInfoFileInfo: null    // setFileInfo 에서 { agreed: true } 로 채워짐
};
 
 
/* ──────────────────────────────────────────
   [추가] 동의서 체크박스 UI 인터랙션 함수 4개
   (기존 submitApplication 위에 위치)
   ────────────────────────────────────────── */
 
/* 내용보기 토글 */
const toggleDetail = (id) => {
    const el  = document.getElementById(id);
    const btn = el.previousElementSibling.querySelector('.view-btn');
    const open = el.classList.toggle('open');
    btn.textContent = open ? '닫기▴' : '내용보기▾';
}
 
/* 전체 선택 체크박스 → 하위 항목 일괄 체크/해제 */
const toggleAll = (g) => {
    const allCb = document.getElementById(g + '-all');
    document.querySelectorAll('.' + g + '-item')
            .forEach(i => i.checked = allCb.checked);
    updateState();
}
 
/* 개별 항목 체크 → 전체 선택 체크박스 동기화 */
const syncAll = (g) => {
    const items = [...document.querySelectorAll('.' + g + '-item')];
    document.getElementById(g + '-all').checked = items.every(i => i.checked);
}
 
/* hidden input value 설정 + 상태 텍스트 업데이트 */
const updateState = () => {
    // 개인정보 동의
    const pItems = [...document.querySelectorAll('.personal-item')];
    const pDone  = pItems.filter(i => i.checked).length;
    const pEl    = document.getElementById('personal-status');
    pEl.textContent = pDone + ' / ' + pItems.length + ' 항목 동의 완료';
    pEl.className   = 'consent-status mt-1' + (pDone === pItems.length ? ' complete' : '');
    // 완료 시 "AGREED", 미완료 시 "" → submitApplication 에서 검사
    document.getElementById('personal-info-file').value =
        pDone === pItems.length ? 'AGREED' : '';
 
    // 저작권 서약
    const cItems = [...document.querySelectorAll('.copy-item')];
    const cDone  = cItems.filter(i => i.checked).length;
    const cEl    = document.getElementById('copy-status');
    cEl.textContent = cDone + ' / ' + cItems.length + ' 항목 동의 완료';
    cEl.className   = 'consent-status mt-1' + (cDone === cItems.length ? ' complete' : '');
    document.getElementById('copyright-file').value =
        cDone === cItems.length ? 'AGREED' : '';
}
 
 
/* ──────────────────────────────────────────
   [수정] submitApplication
   — 동의 차단 2곳 추가 외 나머지 로직 그대로 유지
   ────────────────────────────────────────── */
 
const submitApplication = async (e) => {
    e.preventDefault();
 
    /* ↓↓↓ [추가] 동의 미완료 시 조기 차단 — FileData 처리 전에 검사 */
    const pVal = document.getElementById('personal-info-file').value;
    if (pVal !== 'AGREED') {
        const pFeed = document.getElementById('personal-info-file-invalid-feedback');
        pFeed.textContent = '개인정보 동의 항목을 모두 체크해 주세요.';
        pFeed.style.display = 'block';
        document.getElementById('consent-personal').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
 
    const cVal = document.getElementById('copyright-file').value;
    if (cVal !== 'AGREED') {
        const cFeed = document.getElementById('copyright-file-invalid-feedback');
        cFeed.textContent = '저작권 서약 항목을 모두 체크해 주세요.';
        cFeed.style.display = 'block';
        document.getElementById('consent-copy').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    /* ↑↑↑ [추가] 끝 */
 
 
    /* ↓↓↓ [수정]
              두 항목은 이제 type="hidden" 이므로 FormData 에 파일 append 불필요.
              setFileInfo 는 유지 (fileMeta 마커 기록 목적으로 계속 호출됨).  */
    const formData = new FormData();
    const fileSelectors = [
        { selector: '#idea-plan-file',    partName: 'ideaPlanFile' },
        { selector: '#idea-summary-file', partName: 'ideaSummaryFile' }
    ];
 
    for (const {selector, partName} of fileSelectors) {
        // ① 메타 정보 채우기 — 기존 그대로
        await setFileInfo(selector);
 
        // ② 실제 파일을 FormData 에 추가 — 기존 그대로
        const file = $(selector)[0]?.files?.[0];
        if (file) {
            formData.append(partName, file);
        }
    }
 
    /* ↓↓↓ [추가] personal-info-file, copyright-file 의 fileMeta 마커 기록
              fileSelectors 에서 제거됐으므로 여기서 별도 호출.              */
    await setFileInfo('#personal-info-file');
    await setFileInfo('#copyright-file');
    /* ↑↑↑ [추가] 끝 */
 
 
    /* ── 아래는 기존 코드 그대로 ── */
 
    const payload = {
        applicationInfo: getApplicationInfo(),
        teamInfo:        getTeamInfo(),
        surveyInfo:      getSurveyInfo()
    };
 
    const payloadBlob = new Blob(
        [JSON.stringify(payload)],
        { type: 'application/json' }
    );
    formData.append('payload', payloadBlob);
 
    const fileMetaBlob = new Blob(
        [JSON.stringify(fileMeta)],
        { type: 'application/json' }
    );
    formData.append('fileMeta', fileMetaBlob);
 
    const validateCheck = validateApplicationForm();
 
    if(!validateCheck) {
        e.stopPropagation();
 
        const errorMessage = await getErrorMessage();
        alert(errorMessage);
 
        $('html, body').animate({
            scrollTop: $(`#${invalidInputIdList[0]}`).offset().top - 130
        });
    } else {
        $('#loading-spinner').removeClass('d-none').addClass('d-block');
        $.ajax({
            type: 'POST',
            url: '/alr20/application/register',
            data: formData,
            processData: false,
            contentType: false,
            success: (res) => {
                $('#loading-spinner').removeClass('d-block').addClass('d-none');
                alert(res.message);
                window.location.href = "/alr20/";
            },
            error: (res) => {
                $('#loading-spinner').removeClass('d-block').addClass('d-none');
                const errRes = res.responseJSON;
                if(errRes.status === 'BAD_REQUEST') alert(errRes.message);
                else alert('입력란을 확인하세요.');
            }
        })
    }
}