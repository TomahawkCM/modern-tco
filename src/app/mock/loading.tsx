import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function MockExamLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Preparing exam...</p>
      </div>
    </div>
  );
}
