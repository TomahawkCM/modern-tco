import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-6xl font-bold text-zinc-300 dark:text-zinc-700">404</h1>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Page not found</h2>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
