import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-gray-100 dark:bg-gray-900">
        <nav className="max-w-5xl mx-auto flex gap-4">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>
        </nav>
      </header>
      <main className="flex-1 max-w-5xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  ),
});
