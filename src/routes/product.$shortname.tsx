"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, lazy, Suspense } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  loadRemote,
  registerRemotes,
} from "@module-federation/enhanced/runtime";

export const Route = createFileRoute("/product/$shortname")({
  component: ProductPage,
});

interface Product {
  shortname: string;
  title: string;
  icon: string | null;
  description: string;
  language: string;
  docs: string | null;
  content: "markdown" | "link" | "component";
  markdownUrl?: string;
}

const loadRemoteComponent = async (
  shortname: string,
): Promise<{ default: React.ComponentType }> => {
  const remoteName = `${shortname}-integration`;
  registerRemotes([
    {
      name: remoteName,
      type: "module",
      entry: `/ui/${shortname}/remoteEntry.js`,
    },
  ]);
  try {
    const module = await loadRemote(`${remoteName}/remote-ui`);
    return module as { default: React.ComponentType };
  } catch {
    // Fallback module: a simple local component
    return {
      default: () => (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "8px",
            marginTop: "1rem",
            background: "#f8d7da",
            color: "#842029",
          }}
        >
          Remote app unavailable. Please try again later.
        </div>
      ),
    };
  }
};

function ProductPage() {
  const { shortname } = Route.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [markdownContent, setMarkdownContent] = useState("");

  useEffect(() => {
    fetch("/products.json")
      .then((res) => res.json())
      .then((data: Product[]) => {
        const found = data.find((p) => p.shortname === shortname);
        if (found) {
          setProduct(found);
          const interval = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 100) {
                clearInterval(interval);
                setTimeout(() => setLoading(false), 300);
                return 100;
              }
              return prev + 5;
            });
          }, 100);

          if (found.content === "markdown" && found.markdownUrl) {
            fetch(found.markdownUrl)
              .then((res) => res.text())
              .then((text) => setMarkdownContent(text))
              .catch((err) => console.error("Failed to load markdown:", err));
          }
        } else {
          navigate({ to: "/" });
        }
      })
      .catch((err) => {
        console.error("Failed to load product:", err);
        navigate({ to: "/" });
      });
  }, [shortname, navigate]);

  const handleClose = () => {
    navigate({ to: "/" });
  };

  if (!product) {
    return null;
  }
  const Remote = lazy(() => loadRemoteComponent(shortname));
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-base md:text-lg font-semibold truncate">
          {product.title}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="shrink-0"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full"></div>
              <Loader2 className="w-20 h-20 animate-spin text-primary absolute inset-0" />
            </div>
            <div className="w-full max-w-md space-y-3">
              <Progress value={progress} className="h-2" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Loading {product.title}</p>
                <p className="text-xs text-muted-foreground">{progress}%</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {product.content === "component" ? (
              <div className="text-center space-y-4 py-12">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  <Suspense fallback={<div>Loading remote...</div>}>
                    <Remote />
                  </Suspense>
                </h2>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            ) : product.content === "markdown" ? (
              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-code:text-primary prose-pre:bg-card prose-pre:border prose-blockquote:border-l-primary">
                {markdownContent ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mb-6 text-foreground">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold mb-4 text-foreground">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-medium mb-3 text-foreground">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 text-muted-foreground leading-relaxed">
                          {children}
                        </p>
                      ),
                      code: ({ children, className }) => {
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
                      pre: ({ children }) => (
                        <pre className="bg-card p-4 rounded-lg border overflow-x-auto mb-4">
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
                          {children}
                        </blockquote>
                      ),
                      a: ({ children, href }) => (
                        <a href={href} className="text-primary hover:underline">
                          {children}
                        </a>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 mb-4 text-muted-foreground">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-6 mb-4 text-muted-foreground">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-2">{children}</li>
                      ),
                    }}
                  >
                    {markdownContent}
                  </ReactMarkdown>
                ) : (
                  <>
                    <h1>{product.title}</h1>
                    <p>{product.description}</p>
                  </>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
