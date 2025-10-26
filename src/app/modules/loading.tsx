import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ModulesLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Loading module...</p>
      </div>
    </div>
  );
}
