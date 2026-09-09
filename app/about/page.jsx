import { SiteFooter } from "../components/site-footer.jsx";
import { SiteHeader } from "../components/site-header.jsx";

export const metadata = {
  title: "소개 | 여백의 노트",
  description: "요즘의 생각과 오래 생각해볼 만한 주제를 차분히 기록하는 여백의 노트입니다.",
};

export default function AboutPage() {
  return <>
    <a className="skip-link" href="#about-content">본문으로 건너뛰기</a>
    <main className="site-shell about-shell">
      <SiteHeader current="about" />
      <article className="about-page" id="about-content">
        <h1>여백의 노트는 요즘의 생각을 기록하는 공간입니다.</h1>
        <p>하나의 분야에 스스로를 가두기보다,</p>
        <p>오래 생각해볼 만한 주제를 차분히 정리합니다.</p>
      </article>
      <SiteFooter />
    </main>
  </>;
}
