import Link from "next/link";

export default function PostNotFound() {
  return <main className="site-shell not-found">
    <p>404</p>
    <h1>이 기록을 찾을 수 없어요.</h1>
    <p>주소가 바뀌었거나 아직 공개되지 않은 글일 수 있습니다.</p>
    <Link href="/#archive">글 모아보기로 돌아가기</Link>
  </main>;
}
