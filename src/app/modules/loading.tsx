import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ModulesLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-4 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Loading module...</p>
      </div>
    </div>
  );
}
