import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function MockExamLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-4 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Preparing exam...</p>
      </div>
    </div>
  );
}
