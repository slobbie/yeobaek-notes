/** 공개 웹의 비식별 분석 이벤트 계약. 실제 저장소 연결은 백엔드 단계에서 진행한다. */
export function track(name, properties = {}) {
  window.dispatchEvent(new CustomEvent("blog:analytics", { detail: {
    name, properties, occurred_at: new Date().toISOString(), page_path: window.location.pathname,
  } }));
}
