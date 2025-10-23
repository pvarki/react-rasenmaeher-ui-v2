import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <section className="prose dark:prose-invert">
      <h1>Welcome</h1>
    </section>
  );
}
