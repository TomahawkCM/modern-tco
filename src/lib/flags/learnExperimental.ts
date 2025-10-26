export function isLearnExperimentalEnabled(): boolean {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("path") === "learn-experimental") {
      return true;
    }
  }

  return process.env.NEXT_PUBLIC_LEARN_EXPERIMENTAL === "1";
}
