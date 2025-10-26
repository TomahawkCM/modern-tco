export default function TestMinimalPage() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>TCO Minimal Test Page</h1>
      <p>This page bypasses all complex React contexts and providers.</p>
      <div
        style={{
          backgroundColor: "#f0f8f0",
          border: "1px solid #4CAF50",
          padding: "10px",
          margin: "10px 0",
          borderRadius: "4px",
        }}
      >
        <strong>✓ Next.js App Router:</strong> Working correctly
      </div>
      <div
        style={{
          backgroundColor: "#f0f4f8",
          border: "1px solid #2196F3",
          padding: "10px",
          margin: "10px 0",
          borderRadius: "4px",
        }}
      >
        <strong>✓ Server Connection:</strong> http://127.0.0.1:3007
      </div>
      <div
        style={{
          backgroundColor: "#fff8f0",
          border: "1px solid #FF9800",
          padding: "10px",
          margin: "10px 0",
          borderRadius: "4px",
        }}
      >
        <strong>⚠ Status:</strong> Testing without complex providers
      </div>
      <hr />
      <h2>Next Steps:</h2>
      <ul>
        <li>Fix remaining initialization race conditions</li>
        <li>Gradually add back simplified providers</li>
        <li>Test main application functionality</li>
        <li>Complete browser testing workflow</li>
      </ul>
    </div>
  );
}
