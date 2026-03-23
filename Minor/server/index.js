require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const AMF_BASE = `http://${process.env.AMF_HOST || "localhost"}:${process.env.AMF_PORT || 9101}`;
const SMF_BASE = `http://${process.env.SMF_HOST || "localhost"}:${process.env.SMF_PORT || 9201}`;
const MONGO_URI = "mongodb://localhost:27017";
const DEMO_MODE = process.env.DEMO_MODE === "true";

// ──────────────────────────────────────────────────────────
// STATE & LOGS
// ──────────────────────────────────────────────────────────
let logs = [];
const addLog = (comp, msg) => {
  logs.unshift({ time: new Date().toLocaleTimeString(), comp, msg });
  if (logs.length > 20) logs.pop();
};

// ──────────────────────────────────────────────────────────
// MONGO DB CLIENT
// ──────────────────────────────────────────────────────────
let dbClient;
async function getDb() {
  if (dbClient) return dbClient.db("open5gs");
  try {
    dbClient = await MongoClient.connect(MONGO_URI, { timeoutMS: 2000 });
    return dbClient.db("open5gs");
  } catch (err) {
    return null;
  }
}

// ──────────────────────────────────────────────────────────
// ADVANCED SIMULATION LOGIC: HISTORICAL TRENDS
// ──────────────────────────────────────────────────────────
let history = [];
setInterval(() => {
  const now = new Date().toLocaleTimeString();
  const baseDL = 80 + Math.random() * 40;
  history.push({ time: now, dl: baseDL.toFixed(2), ul: (baseDL/6).toFixed(2), latency: (5 + Math.random()*5).toFixed(1) });
  if (history.length > 30) history.shift();
}, 2000);

function getSimulatedMetrics(imsi) {
  const hash = imsi.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseDL = (hash % 100) + 50; 
  const fluctuation = Math.random() * 20 - 10;
  return {
    throughput_dl: (baseDL + fluctuation).toFixed(2),
    throughput_ul: ((baseDL / 5) + (fluctuation / 2)).toFixed(2),
    latency: (Math.random() * 10 + 5).toFixed(1),
    signal: -(Math.floor(Math.random() * 20 + 75)),
  };
}

// ──────────────────────────────────────────────────────────
// API ROUTES
// ──────────────────────────────────────────────────────────

// GET /api/ue — Hybrid: Real AMF UEs+ MongoDB Subscribers
app.get("/api/ue", async (req, res) => {
  let realUes = [];
  try {
    const resp = await axios.get(`${AMF_BASE}/ue-info`, { timeout: 1000 });
    realUes = resp.data.items || [];
  } catch (err) {}

  const db = await getDb();
  let dbSubs = [];
  if (db) dbSubs = await db.collection("subscribers").find().toArray();

  // Map real UEs from AMF and inject metrics if connected
  const allUes = realUes.map(u => ({
    ...u,
    metrics: u.cm_state === "connected" ? getSimulatedMetrics(u.supi || "real-ue") : null
  }));

  const realImsis = new Set(realUes.map(u => u.supi));

  dbSubs.forEach((sub, idx) => {
    const imsi = `imsi-${sub.imsi}`;
    if (!realImsis.has(imsi)) {
      const isConnected = idx === 0 || Math.random() > 0.4;
      allUes.push({
        supi: imsi,
        cm_state: isConnected ? "connected" : "idle",
        pdu_sessions_count: isConnected ? 1 : 0,
        metrics: isConnected ? getSimulatedMetrics(sub.imsi) : null,
        isSimulated: true
      });
      if (Math.random() > 0.98) addLog("AMF", `NAS Procedure Success: Registration for ${imsi}`);
    }
  });

  res.json({ data: { items: allUes, count: allUes.length }, source: "hybrid-core" });
});

app.get("/api/metrics/history", (req, res) => {
  res.json({ data: history });
});

// GET /api/gnb — Hybrid: Real AMF gNBs + Simulated gNB
app.get("/api/gnb", async (req, res) => {
  try {
    const resp = await axios.get(`${AMF_BASE}/gnb-info`, { timeout: 1000 });
    res.json({ data: resp.data, source: "live-core" });
  } catch (err) {
    const simGnb = [{ gnb_id: "00101", name: "C-RAN-SITE-01", state: "active", ues: 1 }];
    res.json({ data: { items: simGnb }, source: "simulated-gnb" });
  }
});

// GET /api/pdu — Hybrid: Real SMF PDUs + Simulated sessions
app.get("/api/pdu", async (req, res) => {
  try {
    const resp = await axios.get(`${SMF_BASE}/pdu-info`, { timeout: 1000 });
    res.json({ data: resp.data, source: "live-core" });
  } catch (err) {
    res.json({ data: { items: [] }, source: "simulated-pdu" });
  }
});

// GET /api/subscribers — Direct from MongoDB
app.get("/api/subscribers", async (req, res) => {
  const db = await getDb();
  if (!db) return res.status(530).json({ error: "Mongo Offline" });
  const subs = await db.collection("subscribers").find().toArray();
  res.json({ data: subs });
});

// POST /api/subscribers — OFFICIAL OPEN5GS NESTED SCHEMA
app.post("/api/subscribers", async (req, res) => {
  const db = await getDb();
  if (!db) return res.status(530).json({ error: "Mongo Offline" });
  
  const { imsi, k, opc, sst, sd } = req.body;
  
  // Official Open5GS nested structure
  const subscriberDoc = {
    imsi: imsi,
    msisdn: [],
    imeisv: "4370816125816151",
    security: {
      k: k || "8baf473f2f8fd09487cccbd7097c6862",
      op: null,
      opc: opc || "8e27b6af0e692e750f32667a3b14605d",
      amf: "8000",
      sqn: 128
    },
    ambr: {
      downlink: { value: 1, unit: 3 },
      uplink: { value: 1, unit: 3 }
    },
    slice: [
      {
        sst: parseInt(sst) || 1,
        sd: sd || "ffffff",
        default_indicator: true,
        session: [{
          name: "internet",
          type: 3,
          qos: { index: 9, arp: { priority_level: 8, pre_emption_capability: 1, pre_emption_vulnerability: 1 } },
          ambr: { downlink: { value: 1, unit: 3 }, uplink: { value: 1, unit: 3 } },
          ue: { addr: "0.0.0.0" },
          smf: { addr: "0.0.0.0" }
        }]
      }
    ],
    access_restriction_data: 32,
    subscriber_status: 0,
    network_access_mode: 0,
    subscribed_rau_tau_timer: 12,
    schema_version: 1,
    createdAt: new Date()
  };

  try {
    await db.collection("subscribers").insertOne(subscriberDoc);
    addLog("UDM", `SDM: Subscriber Data Management initialized for ${imsi}`);
    addLog("AMF", `NAS: Registration Accept for UE ${imsi}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/subscribers/:imsi", async (req, res) => {
  const db = await getDb();
  if (db) await db.collection("subscribers").deleteOne({ imsi: req.params.imsi });
  addLog("UDM", `SDM: Subscriber ${req.params.imsi} purged from UDR`);
  res.json({ success: true });
});

// GET /api/logs — Live Core Logs
app.get("/api/logs", (req, res) => {
  res.json({ data: logs });
});

// GET /api/status — Health check
app.get("/api/status", async (req, res) => {
  const db = await getDb();
  const amfStatus = await axios.get(`${AMF_BASE}/ue-info`).then(() => "online").catch(() => "offline");
  res.json({
    nfs: { amf: amfStatus, mongodb: db ? "online" : "offline" },
    mode: "hybrid-pro"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[SERVER] Professional 5G Proxy active on 0.0.0.0:${PORT}`);
  addLog("CORE", "5G Core Control Plane v2.7.0 Initializing...");
});


