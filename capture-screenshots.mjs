import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = import.meta.dirname;
const OUT_DIR = path.join(import.meta.dirname, "screenshots");
const BASE_URL = process.env.PETNEXA_SCREENSHOT_URL || "http://localhost:8098";
const CDP_PORT = process.env.PETNEXA_CHROME_CDP_PORT || "9224";
const CDP_BASE = `http://127.0.0.1:${CDP_PORT}`;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date, days) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

const today = todayIso();

const demoSnapshot = {
  owner: { id: "owner_1", fullName: "PetNexa Demo", birthday: "2000-01-01" },
  pets: [
    {
      id: "pet_buddy",
      name: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      sex: "Male",
      birthday: "2023-04-12",
      weightKg: 12.5,
      color: "Golden",
      microchipNumber: "DEMO-0001",
      notes: "Friendly demo pet.",
      assignedVetId: "vet_1",
      createdAt: today,
    },
    {
      id: "pet_luna",
      name: "Luna",
      species: "Cat",
      breed: "Persian Cat",
      sex: "Female",
      birthday: "2022-05-20",
      weightKg: 4.2,
      color: "Gray",
      notes: "Demo pet profile.",
      assignedVetId: "vet_1",
      createdAt: today,
    },
    {
      id: "pet_max",
      name: "Max",
      species: "Dog",
      breed: "Beagle",
      sex: "Male",
      birthday: "2025-01-18",
      weightKg: 8.7,
      color: "Tri-color",
      notes: "Demo puppy profile.",
      assignedVetId: "vet_2",
      createdAt: today,
    },
  ],
  veterinarians: [
    {
      id: "vet_1",
      clinicName: "Happy Paws Clinic",
      veterinarianName: "Dr. Demo",
      phone: "+1 555 0200",
      email: "care@example.com",
      address: "45 Vet Care Road",
      website: "https://example.com",
      emergencyHotline: "+1 555 0911",
      hours: "Mon-Sat, 8 AM - 6 PM",
      notes: "Demo clinic.",
      isPrimary: true,
      createdAt: today,
    },
    {
      id: "vet_2",
      clinicName: "City Animal ER",
      veterinarianName: "Emergency Desk",
      phone: "+1 555 0300",
      email: "er@example.com",
      address: "88 Emergency Lane",
      website: "https://example.org",
      emergencyHotline: "+1 555 0999",
      hours: "24/7",
      notes: "Demo emergency clinic.",
      isPrimary: false,
      createdAt: today,
    },
  ],
  records: [
    {
      id: "record_1",
      petId: "pet_buddy",
      type: "Deworming",
      date: today,
      veterinarian: "Dr. Demo",
      clinic: "Happy Paws Clinic",
      notes: "Routine deworming completed.",
      nextScheduleDate: addDays(today, 14),
      createdAt: today,
    },
    {
      id: "record_2",
      petId: "pet_luna",
      type: "Vaccination",
      date: addDays(today, -4),
      veterinarian: "Dr. Demo",
      clinic: "Happy Paws Clinic",
      notes: "Rabies booster completed.",
      nextScheduleDate: addDays(today, 5),
      createdAt: today,
    },
    {
      id: "record_3",
      petId: "pet_buddy",
      type: "Checkup",
      date: addDays(today, -16),
      veterinarian: "Dr. Demo",
      clinic: "Happy Paws Clinic",
      notes: "Healthy demo exam.",
      createdAt: today,
    },
  ],
  reminders: [
    {
      id: "reminder_1",
      petId: "pet_buddy",
      type: "Deworming",
      title: "Deworming",
      dueDate: today,
      linkedRecordId: "record_1",
      notes: "Follow vet schedule.",
      createdAt: today,
    },
    {
      id: "reminder_2",
      petId: "pet_luna",
      type: "Vaccination",
      title: "Vaccine (Rabies)",
      dueDate: addDays(today, 5),
      linkedRecordId: "record_2",
      notes: "Bring vaccination card.",
      createdAt: today,
    },
    {
      id: "reminder_3",
      petId: "pet_max",
      type: "Appointment",
      title: "Vet Appointment",
      dueDate: addDays(today, 13),
      notes: "Initial puppy check.",
      createdAt: today,
    },
  ],
  consultations: [
    {
      id: "consult_1",
      petId: "pet_luna",
      preset: "My pet is not eating",
      symptoms: "Reduced appetite for one meal.",
      appetite: "Low",
      waterIntake: "Normal",
      behaviorChanges: "Resting more than usual",
      vomiting: "No",
      diarrhea: "No",
      mobility: "Normal",
      breathing: "Normal",
      injury: "None",
      notes: "Monitoring at home.",
      riskLevel: "Mild",
      guidance: "Monitor appetite and hydration. Contact a veterinarian if symptoms continue or worsen.",
      emergencyFlags: "",
      createdAt: addDays(today, -1),
    },
  ],
  creditState: {
    aiCredits: 3,
    starterCreditsGranted: true,
    weeklyAdWatchCount: 0,
    lastWeeklyResetDate: today,
    totalConsultationsUsed: 0,
  },
  settings: {
    notificationsEnabled: true,
    dailySummaryTime: "08:00",
    careMode: "solo",
    syncEnabled: false,
    analyticsEnabled: false,
    diagnosticsEnabled: false,
    adsPersonalizationConsent: false,
    hasCompletedTutorial: true,
    privacyAcknowledgedAt: new Date().toISOString(),
    aiDisclaimerAcceptedAt: new Date().toISOString(),
  },
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureChrome() {
  try {
    const res = await fetch(`${CDP_BASE}/json/version`);
    if (res.ok) return null;
  } catch {}

  console.log("Launching headless Chrome for screenshot capture...");
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tmpDir = path.join(ROOT, ".tmp-chrome-cdp");
  const proc = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${CDP_PORT}`,
    `--remote-debugging-address=127.0.0.1`,
    `--user-data-dir=${tmpDir}`,
    "--window-size=430,932",
    "about:blank",
  ]);

  for (let i = 0; i < 40; i++) {
    await delay(300);
    try {
      const res = await fetch(`${CDP_BASE}/json/version`);
      if (res.ok) {
        console.log("Connected to Chrome CDP successfully.");
        return proc;
      }
    } catch {}
  }
  throw new Error("Could not start Chrome with CDP on port " + CDP_PORT);
}

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

async function createPage({ demo }) {
  const target = await createTarget();
  const client = connect(target.webSocketDebuggerUrl);
  await client.opened;
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 430,
    height: 932,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await client.send("Emulation.setUserAgentOverride", {
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });

  const setupSource = demo
    ? `localStorage.clear(); localStorage.setItem("petnexa_web_snapshot", ${JSON.stringify(JSON.stringify(demoSnapshot))}); localStorage.setItem("petnexa_last_opened", new Date().toISOString());`
    : "localStorage.clear();";
  await client.send("Page.addScriptToEvaluateOnNewDocument", { source: setupSource });
  return client;
}

async function navigateAndWait(client, url, textProbe) {
  await client.send("Page.navigate", { url });
  const start = Date.now();

  while (Date.now() - start < 45000) {
    await delay(800);
    const result = await client
      .send("Runtime.evaluate", {
        expression: `document.body && document.body.innerText.includes(${JSON.stringify(textProbe)})`,
        returnByValue: true,
      })
      .catch(() => ({ result: { value: false } }));

    if (result.result?.value) {
      await delay(2500);
      return;
    }
  }

  throw new Error(`Timed out waiting for ${textProbe} at ${url}`);
}

async function scrollDown(client, amount = 650) {
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      window.scrollBy(0, ${amount});
      const nodes = [...document.querySelectorAll("*")];
      for (const node of nodes) {
        try {
          if (node.scrollHeight > node.clientHeight) node.scrollTop += ${amount};
        } catch (_) {}
      }
    })()`,
  });
  await delay(900);
}

async function screenshot(client, filename) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  const file = path.join(OUT_DIR, filename);
  await fs.writeFile(file, Buffer.from(result.data, "base64"));
  const stat = await fs.stat(file);
  if (stat.size < 10000) throw new Error(`${filename} is unexpectedly small.`);
  return { filename, size: stat.size };
}

async function captureOne(config) {
  const client = await createPage({ demo: config.demo });
  try {
    await navigateAndWait(client, config.url, config.probe);
    return await screenshot(client, config.file);
  } finally {
    client.close();
  }
}

const chromeProc = await ensureChrome();

try {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const captures = [];

  // 1. Onboarding
  console.log("Capturing 01-onboarding-login.png...");
  captures.push(await captureOne({
    demo: false,
    url: BASE_URL,
    probe: "Owner details",
    file: "01-onboarding-login.png",
  }));

  // 2. Dashboard
  console.log("Capturing 02-dashboard.png...");
  const dashboardPage = await createPage({ demo: true });
  try {
    await navigateAndWait(dashboardPage, BASE_URL, "Featured Pet");
    captures.push(await screenshot(dashboardPage, "02-dashboard.png"));
  } finally {
    dashboardPage.close();
  }

  // 3. My Pets
  console.log("Capturing 03-my-pets.png...");
  const petsPage = await createPage({ demo: true });
  try {
    await navigateAndWait(petsPage, `${BASE_URL}/more/pets`, "Buddy");
    captures.push(await screenshot(petsPage, "03-my-pets.png"));
  } finally {
    petsPage.close();
  }

  // 4. Records
  console.log("Capturing 04-records.png...");
  const recordsPage = await createPage({ demo: true });
  try {
    await navigateAndWait(recordsPage, `${BASE_URL}/more/records`, "Deworming");
    captures.push(await screenshot(recordsPage, "04-records.png"));
  } finally {
    recordsPage.close();
  }

  // 5. AI Assistant
  console.log("Capturing 05-ai-assistant.png...");
  const aiPage = await createPage({ demo: true });
  try {
    await navigateAndWait(aiPage, `${BASE_URL}/ai-assistant`, "Start Consultation");
    captures.push(await screenshot(aiPage, "05-ai-assistant.png"));
  } finally {
    aiPage.close();
  }

  // 6. Settings & Privacy Controls
  console.log("Capturing 06-settings-privacy-controls.png...");
  const settingsPage = await createPage({ demo: true });
  try {
    await navigateAndWait(settingsPage, `${BASE_URL}/more/settings`, "App Preferences");
    await scrollDown(settingsPage, 500);
    captures.push(await screenshot(settingsPage, "06-settings-privacy-controls.png"));
  } finally {
    settingsPage.close();
  }

  console.table(captures);
  console.log(`Saved screenshots to ${path.relative(ROOT, OUT_DIR)}`);
} finally {
  if (chromeProc) {
    chromeProc.kill();
  }
}
