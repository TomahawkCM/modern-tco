import { TaniumQueryEngine } from "@/lib/tanium-query-engine";
import { withErrorTracking, ApiError, apiSuccess } from "@/lib/error-tracking";

// Initialize the query engine
const queryEngine = new TaniumQueryEngine();

// Add some default saved queries
queryEngine.saveQuery(
  "All Machines",
  "Get Computer Name, OS Platform, Group from all machines",
  "List all machines with basic information"
);

queryEngine.saveQuery(
  "High CPU Usage",
  'Get Computer Name, CPU Percent from all machines where CPU Percent is greater than "80" order by CPU Percent desc',
  "Find machines with high CPU utilization"
);

queryEngine.saveQuery(
  "Low Disk Space",
  'Get Computer Name, Disk Free GB from all machines where Disk Free GB is less than "50" order by Disk Free GB',
  "Find machines running low on disk space"
);

export const GET = withErrorTracking(
  async () => {
    try {
      const saved = queryEngine.listSavedQueries().map((query) => ({
        name: query.name,
        question: query.question,
        savedAt: query.createdAt,
      }));

      return apiSuccess({
        ok: true,
        saved,
      });
    } catch (error) {
      throw new ApiError("Unable to load saved questions", 500, "SAVED_QUERIES_LOAD_FAILED");
    }
  },
  { endpoint: "/api/sim-saved" }
);
