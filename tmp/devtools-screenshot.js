const { writeFileSync } = require('node:fs');

const wsUrl = process.argv[2];
const outputPath = process.argv[3] || 'tmp/devtools-screenshot.png';
const targetUrl = process.argv[4] || 'http://127.0.0.1:3001/';

if (!wsUrl) {
  console.error('Usage: node tmp/devtools-screenshot.js <webSocketDebuggerUrl> [outputPath] [targetUrl]');
  process.exit(1);
}

const pending = new Map();
let nextId = 1;

const ws = new WebSocket(wsUrl);

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

ws.onopen = async () => {
  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send('Page.navigate', { url: targetUrl });
  } catch (error) {
    console.error('Setup failed', error.message || error);
    ws.close();
  }
};

ws.onmessage = async (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) {
      reject(new Error(message.error.message));
    } else {
      resolve(message.result);
    }
    return;
  }

  if (message.method === 'Page.loadEventFired') {
    try {
      const { data } = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
      writeFileSync(outputPath, Buffer.from(data, 'base64'));
      console.log(`Saved screenshot to ${outputPath}`);
    } catch (error) {
      console.error('Screenshot failed', error.message || error);
    } finally {
      ws.close();
    }
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error', error.message || error);
};

setTimeout(() => {
  console.error('Timed out waiting for load event');
  ws.close();
}, 10000);
