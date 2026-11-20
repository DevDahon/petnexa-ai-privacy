import http from "node:http";
import fs from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "play-store-assets");
const HTTP_PORT = 8110;
const CDP_PORT = 9226;
const CDP_BASE = `http://127.0.0.1:${CDP_PORT}`;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 1. Lightweight Static File Server
function startServer() {
  const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".json": "application/json",
  };

  const server = http.createServer((req, res) => {
    try {
      const urlPath = new URL(req.url, `http://localhost:${HTTP_PORT}`).pathname;
      const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, "");
      const filePath = path.join(ROOT, safePath);

      if (!existsSync(filePath)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      createReadStream(filePath).pipe(res);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(err.message);
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(HTTP_PORT, "127.0.0.1", () => {
      console.log(`Local preview server running at http://127.0.0.1:${HTTP_PORT}`);
      resolve(server);
    });
    server.on("error", reject);
  });
}

// 2. Launch Chrome with CDP
async function ensureChrome() {
  console.log("Launching headless Chrome for Play Console asset render...");
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tmpDir = path.join(ROOT, ".tmp-chrome-play-cdp");
  const proc = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${CDP_PORT}`,
    `--remote-debugging-address=127.0.0.1`,
    `--user-data-dir=${tmpDir}`,
    "--window-size=1080,1920",
    "--hide-scrollbars",
    "about:blank",
  ]);

  for (let i = 0; i < 40; i++) {
    await delay(300);
    try {
      const res = await fetch(`${CDP_BASE}/json/version`);
      if (res.ok) {
        console.log("Connected to Chrome CDP on port " + CDP_PORT);
        return proc;
      }
    } catch {}
  }
  throw new Error("Could not start Chrome with CDP on port " + CDP_PORT);
}

// 3. WebSocket CDP Client
function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result || {});
  };

  return {
    opened: new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    }),
    send(method, params = {}) {
      const callId = ++id;
      ws.send(JSON.stringify({ id: callId, method, params }));
      return new Promise((resolve, reject) => pending.set(callId, { resolve, reject }));
    },
    close() {
      ws.close();
    },
  };
}

async function createTarget() {
  const response = await fetch(`${CDP_BASE}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
  if (!response.ok) throw new Error(`Could not create Chrome target: ${response.status}`);
  return response.json();
}

const slides = [
  { index: 1, filename: "01-phone-dashboard.png", name: "Care Dashboard" },
  { index: 2, filename: "02-phone-ai-assistant.png", name: "AI Symptom Assistant" },
  { index: 3, filename: "03-phone-records.png", name: "Clinical Records Vault" },
  { index: 4, filename: "04-phone-my-pets.png", name: "Multi-Pet Profiles" },
  { index: 5, filename: "05-phone-privacy-controls.png", name: "Privacy & Data Controls" },
  { index: 6, filename: "06-phone-onboarding.png", name: "Quick Onboarding Setup" },
];

const server = await startServer();
const chromeProc = await ensureChrome();

try {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const target = await createTarget();
  const client = connect(target.webSocketDebuggerUrl);
  await client.opened;
  await client.send("Page.enable");
  await client.send("Runtime.enable");

  // Force exact 1080x1920 (9:16 aspect ratio)
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1080,
    height: 1920,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const results = [];

  for (const slide of slides) {
    console.log(`Rendering Slide ${slide.index}: ${slide.name}...`);
    const url = `http://127.0.0.1:${HTTP_PORT}/play-store-assets/template.html?slide=${slide.index}`;
    await client.send("Page.navigate", { url });

    // Wait until document fonts and images are completely loaded
    const start = Date.now();
    while (Date.now() - start < 15000) {
      await delay(400);
      const readyRes = await client.send("Runtime.evaluate", {
        expression: `(() => {
          const fontsReady = document.fonts ? document.fonts.status === 'loaded' : true;
          const images = [...document.querySelectorAll('img')];
          const imgsReady = images.every(img => img.complete && img.naturalWidth > 0);
          return fontsReady && imgsReady;
        })()`,
        returnByValue: true,
      });
      if (readyRes.result?.value) {
        await delay(600); // Allow paints to settle
        break;
      }
    }

    const screenshotRes = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      clip: { x: 0, y: 0, width: 1080, height: 1920, scale: 1 },
      captureBeyondViewport: false,
    });

    const filePath = path.join(OUT_DIR, slide.filename);
    const buffer = Buffer.from(screenshotRes.data, "base64");
    await fs.writeFile(filePath, buffer);
    const stat = await fs.stat(filePath);

    results.push({
      file: slide.filename,
      feature: slide.name,
      dimensions: "1080 x 1920",
      aspectRatio: "9:16",
      sizeKb: Math.round(stat.size / 1024) + " KB",
    });
  }

  client.close();
  console.table(results);
  console.log(`\nSuccessfully generated ${results.length} Play Store screenshots in: ${OUT_DIR}`);
} finally {
  if (chromeProc) chromeProc.kill();
  server.close();
}
