import "@yeobaek/ui/tokens.css";
import "./globals.css";

export const metadata = {
  title: "관리자 | 여백의 노트",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return <html lang="ko"><body>{children}</body></html>;
}
