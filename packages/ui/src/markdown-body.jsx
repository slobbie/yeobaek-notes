import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  h1: ({ children }) => <h2>{children}</h2>,
};

export function MarkdownBody({ children, className = "markdown-body" }) {
  return <div className={className}>
    <Markdown components={components} remarkPlugins={[remarkGfm]} skipHtml>{children}</Markdown>
  </div>;
}
