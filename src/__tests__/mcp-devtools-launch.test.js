const fs = require('fs');
const os = require('os');
const path = require('path');

const launcherModule = path.join(__dirname, '../../scripts/mcp-devtools-launch');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { resolveChromeBinary } = require(launcherModule);

describe('resolveChromeBinary', () => {
  let tempRoot;

  beforeEach(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-devtools-test-'));
    fs.mkdirSync(path.join(tempRoot, 'chrome'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it('prefers the latest linux chrome binary', () => {
    const olderDir = path.join(tempRoot, 'chrome', 'linux-139.0.0');
    fs.mkdirSync(path.join(olderDir, 'chrome-linux64'), { recursive: true });
    fs.writeFileSync(path.join(olderDir, 'chrome-linux64', 'chrome'), '');

    const newerDir = path.join(tempRoot, 'chrome', 'linux-140.0.0');
    fs.mkdirSync(path.join(newerDir, 'chrome-linux64'), { recursive: true });
    const expected = path.join(newerDir, 'chrome-linux64', 'chrome');
    fs.writeFileSync(expected, '');

    const result = resolveChromeBinary(tempRoot, 'linux');
    expect(result).toBe(expected);
  });

  it('detects darwin chrome binary layout', () => {
    const macDir = path.join(tempRoot, 'chrome', 'mac-140.0.0');
    const executable = path.join(
      macDir,
      'chrome-mac',
      'Chromium.app',
      'Contents',
      'MacOS',
      'Chromium'
    );
    fs.mkdirSync(path.dirname(executable), { recursive: true });
    fs.writeFileSync(executable, '');

    const result = resolveChromeBinary(tempRoot, 'darwin');
    expect(result).toBe(executable);
  });

  it('detects windows chrome binary layout', () => {
    const winDir = path.join(tempRoot, 'chrome', 'win64-140.0.0');
    const executable = path.join(winDir, 'chrome-win64', 'chrome.exe');
    fs.mkdirSync(path.dirname(executable), { recursive: true });
    fs.writeFileSync(executable, '');

    const result = resolveChromeBinary(tempRoot, 'win32');
    expect(result).toBe(executable);
  });

  it('returns null when no binaries exist', () => {
    const result = resolveChromeBinary(tempRoot, 'linux');
    expect(result).toBeNull();
  });
});
