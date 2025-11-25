import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useTranslation } from "react-i18next";

interface MarkdownRendererProps {
  content: string;
  isLoading: boolean;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-3xl font-bold mb-6 text-foreground">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-2xl font-semibold mb-4 text-foreground">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-xl font-medium mb-3 text-foreground">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-4 text-muted-foreground leading-relaxed">{children}</p>
  ),
  code: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => {
    const isInline = !className?.includes("language-");
    return isInline ? (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-primary font-mono">
        {children}
      </code>
    ) : (
      <code
        className={`block bg-card p-4 rounded-lg border text-sm font-mono overflow-x-auto ${className || ""}`}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-card p-4 rounded-lg border overflow-x-auto mb-4">
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} className="text-primary hover:underline">
      {children}
    </a>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-6 mb-4 text-muted-foreground">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-6 mb-4 text-muted-foreground">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="mb-2">{children}</li>
  ),
};

export function MarkdownRenderer({
  content,
  isLoading,
  fallbackTitle,
  fallbackDescription,
}: MarkdownRendererProps) {
  const { t } = useTranslation();

  return (
    <div className="prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-primary prose-pre:bg-card prose-pre:border prose-blockquote:border-l-primary">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {t("product.loadingMarkdown")}
          </p>
        </div>
      ) : content ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      ) : (
        <>
          <h1>{fallbackTitle}</h1>
          <p>{fallbackDescription}</p>
        </>
      )}
    </div>
  );
}
