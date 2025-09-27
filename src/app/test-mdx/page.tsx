"use client";

import { useState, useEffect } from "react";

export default function TestMDXPage() {
  const [status, setStatus] = useState("Testing MDX loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testMDXLoading = async () => {
      try {
        setStatus("Loading MDX content...");

        // Test direct import
        const mdxModule = await import("@/content/modules/01-asking-questions.mdx");

        if (mdxModule && mdxModule.default) {
          setStatus("✅ MDX content loaded successfully!");
        } else {
          setStatus("❌ MDX module loaded but no default export found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("❌ Failed to load MDX content");
      }
    };

    testMDXLoading();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>MDX Loading Test</h1>
      <p>
        <strong>Status:</strong> {status}
      </p>
      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <div style={{ marginTop: "20px" }}>
        <h3>Test Steps:</h3>
        <ol>
          <li>Import MDX file</li>
          <li>Check for default export</li>
          <li>Render component if successful</li>
        </ol>
      </div>
    </div>
  );
}
