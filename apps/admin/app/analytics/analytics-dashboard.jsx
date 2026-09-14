const number = new Intl.NumberFormat("ko-KR");

function Count({ value }) {
  return <strong>{number.format(value)}</strong>;
}

export function AnalyticsDashboard({ dashboard, days, range, error }) {
  return <main className="admin-app analytics-app" data-app-boundary="YEOBAEK_LOCAL_ADMIN_ONLY">
    <header className="admin-header">
      <div className="admin-brand"><strong>여백의 노트</strong><span>관리자</span></div>
      <nav aria-label="관리자 화면">
        <a href="/">글 편집</a>
        <a aria-current="page" href="/analytics">지표</a>
      </nav>
      <p className="local-state">로컬 전용</p>
    </header>

    <div className="analytics-shell">
      <section className="analytics-heading" aria-labelledby="analytics-title">
        <div><p>비식별 행동 지표</p><h1 id="analytics-title">블로그 사용 현황</h1></div>
        <nav aria-label="지표 기간">
          {[7, 30, 90].map((period) => <a
            aria-current={period === days ? "page" : undefined}
            href={`/analytics?days=${period}`}
            key={period}
          >{period}일</a>)}
        </nav>
      </section>
      <p className="analytics-range">{range.start} ~ {range.end} · 사용자가 아닌 이벤트 횟수 기준</p>

      {error ? <p className="save-message save-error" role="alert">{error}</p> : <>
        <section className="metric-cards" aria-label="핵심 지표">
          <article><span>전체 행동</span><Count value={dashboard.totalEvents} /><small>이벤트</small></article>
          <article><span>페이지 조회</span><Count value={dashboard.pageViews} /><small>이벤트</small></article>
          <article><span>출처 확인</span><Count value={dashboard.sourceOpens} /><small>이벤트</small></article>
          <article><span>결과 있는 검색</span><strong>{dashboard.searchSuccessRate === null ? "—" : `${dashboard.searchSuccessRate}%`}</strong><small>검색 이벤트 기준</small></article>
        </section>

        <div className="analytics-grid">
          <section className="analytics-panel" aria-labelledby="event-count-title">
            <div className="analytics-panel-heading"><h2 id="event-count-title">행동별 횟수</h2><span>{days}일</span></div>
            <ul className="metric-list">{dashboard.events.map((event) => <li key={event.name}><span>{event.label}</span><Count value={event.count} /></li>)}</ul>
          </section>

          <section className="analytics-panel" aria-labelledby="daily-count-title">
            <div className="analytics-panel-heading"><h2 id="daily-count-title">일별 행동</h2><span>서울 날짜</span></div>
            {dashboard.daily.length ? <ol className="metric-list daily-list">{dashboard.daily.map((day) => <li key={day.date}><time dateTime={day.date}>{day.date}</time><Count value={day.count} /></li>)}</ol> : <p className="analytics-empty">아직 저장된 행동이 없습니다.</p>}
          </section>

          <section className="analytics-panel analytics-panel-wide" aria-labelledby="post-count-title">
            <div className="analytics-panel-heading"><h2 id="post-count-title">글별 행동</h2><span>조회 · 열기 · 출처</span></div>
            {dashboard.posts.length ? <div className="metric-table-wrap"><table className="metric-table"><thead><tr><th scope="col">글 주소</th><th scope="col">조회</th><th scope="col">열기</th><th scope="col">출처</th></tr></thead><tbody>{dashboard.posts.map((post) => <tr key={post.slug}><th scope="row">/posts/{post.slug}</th><td>{number.format(post.views)}</td><td>{number.format(post.opens)}</td><td>{number.format(post.sourceOpens)}</td></tr>)}</tbody></table></div> : <p className="analytics-empty">글별 행동이 쌓이면 여기에 표시됩니다.</p>}
          </section>

          <section className="analytics-panel" aria-labelledby="filter-count-title">
            <div className="analytics-panel-heading"><h2 id="filter-count-title">선택한 주제</h2><span>필터 이벤트</span></div>
            {dashboard.filters.length ? <ol className="metric-list">{dashboard.filters.map((filter) => <li key={filter.value}><span>{filter.value}</span><Count value={filter.count} /></li>)}</ol> : <p className="analytics-empty">주제 선택 기록이 없습니다.</p>}
          </section>

          <section className="analytics-panel" aria-labelledby="source-count-title">
            <div className="analytics-panel-heading"><h2 id="source-count-title">확인한 출처</h2><span>hostname만 저장</span></div>
            {dashboard.sources.length ? <ol className="metric-list">{dashboard.sources.map((source) => <li key={source.host}><span>{source.host}</span><Count value={source.count} /></li>)}</ol> : <p className="analytics-empty">출처 확인 기록이 없습니다.</p>}
          </section>
        </div>
      </>}

      <aside className="analytics-note">
        <strong>지표 해석 기준</strong>
        <p>식별자를 수집하지 않으므로 사용자 수·세션·개인 전환율을 계산하지 않습니다. 검색 노출과 AI 인용 성과도 이 화면의 내부 행동으로 추정하지 않습니다.</p>
      </aside>
    </div>
  </main>;
}
