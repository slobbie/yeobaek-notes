import "@yeobaek/ui/tokens.css";
import "@yeobaek/ui/markdown.css";
import "./globals.css";

export const metadata = {
  title: "글 편집 | 여백의 노트 관리자",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return <html lang="ko"><body>{children}</body></html>;
}
