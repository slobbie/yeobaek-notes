import Link from "next/link";
import { SiteFooter } from "../components/site-footer.jsx";
import { SiteHeader } from "../components/site-header.jsx";

export const metadata = {
  title: "소개와 편집 원칙 | 여백의 노트",
  description: "여백의 노트가 다루는 주제와 출처, 수정, 리뷰, 익명 운영 원칙을 소개합니다.",
};

const topics = [
  ["경제", "돈과 시장을 이해하기 위해 공부한 내용과 판단 과정을 기록합니다."],
  ["기술", "새로운 도구를 직접 사용하며 알게 된 점과 적용 과정을 남깁니다."],
  ["생활", "일상을 더 잘 이해하거나 바꾸는 데 도움이 된 경험을 기록합니다."],
  ["관찰", "지나치기 쉬운 생각과 질문을 짧거나 긴 글로 붙잡아 둡니다."],
  ["리뷰", "직접 사용한 제품과 서비스의 장점, 한계, 사용 조건을 함께 남깁니다."],
];

const principles = [
  ["사실과 생각을 구분합니다", "확인 가능한 사실, 외부 자료의 해석, 개인적인 의견이 섞이지 않도록 문맥에서 구분합니다."],
  ["기준 시점을 남깁니다", "경제 지표와 제품 정보처럼 달라질 수 있는 내용에는 확인하거나 경험한 날짜를 표시합니다."],
  ["원문으로 연결합니다", "수치, 인용, 외부 주장에는 가능한 한 최초 발행처나 공식 문서를 연결합니다."],
  ["바뀐 내용은 수정합니다", "의미 있는 오류나 변화가 확인되면 수정일을 갱신하고 글의 핵심 판단이 달라진 경우 그 사실을 밝힙니다."],
];

export default function AboutPage() {
  return <>
    <a className="skip-link" href="#about-content">본문으로 건너뛰기</a>
    <main className="site-shell">
      <SiteHeader current="about" />
      <article className="about-page" id="about-content">
        <header className="about-hero">
          <p className="about-kicker">소개와 편집 원칙</p>
          <h1>이름 대신,<br />기록의 기준을 남깁니다.</h1>
          <p className="about-lead">여백의 노트는 경제, 기술, 생활과 그 사이에서 발견한 것을 공부하고 경험한 만큼 기록하는 개인 아카이브입니다.</p>
          <p className="about-updated">마지막 확인 · 2026. 09. 09</p>
        </header>

        <section className="about-section" aria-labelledby="topics-title">
          <div className="about-section-heading"><span>01</span><h2 id="topics-title">무엇을 기록하나요</h2></div>
          <ul className="topic-list">{topics.map(([name, description]) => <li key={name}><strong>{name}</strong><p>{description}</p></li>)}</ul>
        </section>

        <section className="about-section" aria-labelledby="principles-title">
          <div className="about-section-heading"><span>02</span><h2 id="principles-title">글을 쓰는 기준</h2></div>
          <ol className="principle-list">{principles.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
        </section>

        <section className="about-section policy-grid" aria-labelledby="responsibility-title">
          <div className="about-section-heading"><span>03</span><h2 id="responsibility-title">주제별 책임 기준</h2></div>
          <div className="policy-card"><h3>경제 관련 글</h3><p>공부와 정보 정리를 위한 기록입니다. 개인의 재무 상황을 고려한 투자 권유나 맞춤 조언으로 작성하지 않습니다. 자료의 기준 시점과 출처를 함께 확인해 주세요.</p></div>
          <div className="policy-card"><h3>제품과 서비스 리뷰</h3><p>직접 사용했는지, 어떤 조건에서 경험했는지 밝힙니다. 제품 제공, 광고, 제휴처럼 판단에 영향을 줄 수 있는 관계가 있다면 글 상단에 표시합니다.</p></div>
        </section>

        <section className="about-section about-anonymous" aria-labelledby="anonymous-title">
          <div className="about-section-heading"><span>04</span><h2 id="anonymous-title">익명으로 운영하는 이유</h2></div>
          <div><p>운영자의 이름과 개인 신상은 공개하지 않습니다. 기록의 가치가 개인 정보보다 내용과 근거에서 판단되기를 바라기 때문입니다.</p><p>익명이라는 이유로 책임 기준을 낮추지는 않습니다. 글마다 작성·수정 시점과 출처를 남기고, 오류를 확인하면 고칩니다.</p></div>
        </section>

        <section className="about-section contact-note" aria-labelledby="contact-title">
          <div className="about-section-heading"><span>05</span><h2 id="contact-title">문의와 정정 요청</h2></div>
          <div><p>현재 별도의 개인정보를 받는 문의 양식은 운영하지 않습니다. 공개 전 브랜드 전용 연락 채널이 정해지면 이 페이지에 안내합니다.</p><Link href="/#archive">최근 기록 살펴보기 →</Link></div>
        </section>
      </article>
      <SiteFooter />
    </main>
  </>;
}
