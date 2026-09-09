import Link from "next/link";

export function SiteHeader({ home = false, onBrandClick }) {
  const brandTitle = home
    ? <h1 className="brand-title">여백의 노트</h1>
    : <span className="brand-title">여백의 노트</span>;

  return <header className="masthead">
    <Link className="brand" href="/" onClick={onBrandClick}>
      {brandTitle}
      <span>읽고, 쓰고, 생각한 것을 남깁니다.</span>
    </Link>
    <nav aria-label="주요 메뉴">
      <Link className={home ? "active" : undefined} aria-current={home ? "page" : undefined} href="/#archive">글 모아보기</Link>
      <Link href="/#about">소개</Link>
    </nav>
  </header>;
}
