/**
 * 동의서 체크형 UI 전용 함수
 */

/**
 * 동의서 상세 내용 패널 토글
 * @param {string} id  .consent-card-header 요소의 id
 */
function toggleDetail(id) {
    $('#' + id).toggleClass('open');
}

/**
 * "전체 동의" 체크박스 → 개별 항목 일괄 적용
 * @param {string} group  'personal-info' 또는 'copyright'
 */
function toggleAll(group) {
    const allChecked = $('#consent-all-' + group).is(':checked');
    $('input.consent-item-' + group).prop('checked', allChecked);
    updateState();
}

/**
 * 개별 항목 변경 시 "전체 동의" 체크박스 동기화
 * @param {string} group  'personal-info' 또는 'copyright'
 */
function syncAll(group) {
    const $items = $('input.consent-item-' + group);
    const allChecked = $items.length === $items.filter(':checked').length;
    $('#consent-all-' + group).prop('checked', allChecked);
    updateState();
}

/**
 * 동의 상태 집계 → hidden input value 업데이트
 * - 모두 체크 시 "AGREED", 미완료 시 ""
 * - .trigger('input')으로 기존 notBlank 실시간 검증 리스너 연동
 */
function updateState() {
    var piItems = $('input.consent-item-personal-info');
    var piAllChecked = piItems.length === piItems.filter(':checked').length;
    $('#personal-info-file').val(piAllChecked ? 'AGREED' : '').trigger('input');

    var crItems = $('input.consent-item-copyright');
    var crAllChecked = crItems.length === crItems.filter(':checked').length;
    $('#copyright-file').val(crAllChecked ? 'AGREED' : '').trigger('input');
}
