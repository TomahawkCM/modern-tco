const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <html>
      <head><title>Test Server</title></head>
      <body>
        <h1>Test Server Running</h1>
        <p>Port 3000 is working correctly</p>
        <p>Time: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
});

server.listen(3000, "127.0.0.1", () => {
  console.log("Test server running at http://127.0.0.1:3000/");
});

server.on("error", (err) => {
  console.error("Server error:", err);
});
