const wsUrl = process.argv[2];
if (!wsUrl) {
  console.error('Usage: node tmp/devtools-cdp.js <webSocketDebuggerUrl> [targetUrl]');
  process.exit(1);
}

const targetUrl = process.argv[3] || 'http://127.0.0.1:3001/';
const results = {
  console: {
    error: [],
    warn: [],
    log: [],
    info: [],
  },
  exceptions: [],
  logs: [],
  networkFailures: [],
  networkResponses: [],
  performance: null,
};

const pendingCommands = new Map();
let nextMessageId = 100;
const requestMap = new Map();

function send(ws, method, params = {}) {
  const id = nextMessageId++;
  ws.send(JSON.stringify({ id, method, params }));
  return id;
}

function sendWithPromise(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = send(ws, method, params);
    pendingCommands.set(id, { resolve, reject });
  });
}

function recordConsole(type, text, stackTrace) {
  const bucket = results.console[type] || (results.console[type] = []);
  if (bucket.length >= 10) return;
  bucket.push({
    text,
    frames: stackTrace?.callFrames?.slice(0, 3)?.map((frame) => ({
      functionName: frame.functionName,
      url: frame.url,
      lineNumber: frame.lineNumber,
    })) || null,
  });
}

const ws = new WebSocket(wsUrl);
let loadEventSeen = false;

ws.onopen = () => {
  send(ws, 'Page.enable');
  send(ws, 'Runtime.enable');
  send(ws, 'Log.enable');
  send(ws, 'Network.enable');
  send(ws, 'Performance.enable');
  send(ws, 'Page.navigate', { url: targetUrl });
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pendingCommands.has(message.id)) {
    const { resolve, reject } = pendingCommands.get(message.id);
    pendingCommands.delete(message.id);
    if (message.error) {
      reject(new Error(message.error.message));
    } else {
      resolve(message.result);
    }
    return;
  }

  switch (message.method) {
    case 'Network.requestWillBeSent': {
      const { requestId, request } = message.params;
      requestMap.set(requestId, {
        url: request.url,
        method: request.method,
        type: message.params.type,
        timestamp: message.params.timestamp,
      });
      break;
    }
    case 'Network.responseReceived': {
      const { requestId, response, type } = message.params;
      if (results.networkResponses.length < 20) {
        results.networkResponses.push({
          url: response.url,
          status: response.status,
          statusText: response.statusText,
          type,
        });
      }
      break;
    }
    case 'Runtime.consoleAPICalled': {
      const { type, args, stackTrace } = message.params;
      const text = args
        .map((arg) => ('value' in arg ? JSON.stringify(arg.value) : arg.description || arg.type))
        .join(' ');
      recordConsole(type, text, stackTrace);
      break;
    }
    case 'Runtime.exceptionThrown': {
      const { exceptionDetails } = message.params;
      if (results.exceptions.length < 10) {
        results.exceptions.push({
          text: exceptionDetails.text,
          url: exceptionDetails.url || null,
          lineNumber: exceptionDetails.lineNumber,
          columnNumber: exceptionDetails.columnNumber,
        });
      }
      break;
    }
    case 'Log.entryAdded': {
      const { entry } = message.params;
      if (results.logs.length < 10) {
        results.logs.push({ source: entry.source, level: entry.level, text: entry.text });
      }
      break;
    }
    case 'Network.loadingFailed': {
      const { requestId, errorText, type, canceled, blockedReason, timestamp } = message.params;
      const requestInfo = requestMap.get(requestId);
      results.networkFailures.push({
        requestId,
        url: requestInfo?.url || null,
        method: requestInfo?.method || null,
        resourceType: requestInfo?.type || type,
        errorText,
        canceled,
        blockedReason: blockedReason || null,
        timestamp,
      });
      break;
    }
    case 'Page.loadEventFired': {
      if (!loadEventSeen) {
        loadEventSeen = true;
        sendWithPromise(ws, 'Performance.getMetrics')
          .then((metrics) => {
            const map = Object.fromEntries(metrics.metrics.map((entry) => [entry.name, entry.value]));
            results.performance = {
              FirstContentfulPaint: map.FirstContentfulPaint,
              DOMContentLoaded: map.DomContentLoaded,
              FirstMeaningfulPaint: map.FirstMeaningfulPaint,
              LCP: map.LargestContentfulPaint,
              NavigationStart: map.NavigationStart,
              LayoutShift: map.CumulativeLayoutShift,
              TotalBlockingTime: map.TotalBlockingTime,
            };
          })
          .catch((err) => {
            results.performance = { error: err.message };
          });
      }
      break;
    }
    default:
      break;
  }
};

ws.onerror = (err) => {
  console.error('WebSocket error', err.message || err);
};

setTimeout(() => ws.close(1000, 'Done'), 8000);

ws.onclose = () => {
  console.log(JSON.stringify(results, null, 2));
};
