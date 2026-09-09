import "./globals.css";

export const metadata = {
  title: "여백의 노트 — 생각을 기록하는 개인 아카이브",
  description: "경제, 기술, 생활과 그 사이에서 발견한 것을 기록합니다.",
};

export default function RootLayout({ children }) {
  return <html lang="ko"><body>{children}</body></html>;
}
