import "./globals.css";
import { createPageMetadata, siteConfig } from "./seo.js";

const homeTitle = "여백의 노트 — 생각을 기록하는 개인 아카이브";
const homeMetadata = createPageMetadata({
  title: homeTitle,
  description: siteConfig.description,
  path: "/",
});

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  ...homeMetadata,
  title: {
    default: homeTitle,
    template: `%s | ${siteConfig.name}`,
  },
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return <html lang="ko"><body>{children}</body></html>;
}
