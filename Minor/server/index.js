require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const AMF_BASE = `http://${process.env.AMF_HOST || "172.22.0.10"}:${process.env.AMF_PORT || 9091}`;
const SMF_BASE = `http://${process.env.SMF_HOST || "172.22.0.7"}:${process.env.SMF_PORT || 9091}`;
const WEBUI_BASE = `http://${process.env.WEBUI_HOST || "localhost"}:${process.env.WEBUI_PORT || 9999}`;
const DEMO_MODE = process.env.DEMO_MODE === "true";

// ──────────────────────────────────────────────────────────
// DEMO DATA — realistic fluctuating mock 5G core state
// ──────────────────────────────────────────────────────────
function getDemoUEInfo() {
  const states = ["connected", "idle"];
  const ues = ["imsi-001011234567895", "imsi-001011234567896", "imsi-001011234567897"];
  return {
    items: ues.map((supi, i) => ({
      supi,
      cm_state: states[Math.random() > 0.2 ? 0 : 1],
      pdu_sessions: [{ psi: i + 1, dnn: "internet", snssai: { sst: 1, sd: "ffffff" } }],
      pdu_sessions_count: 1,
      location: { nr_tai: { plmn: "00101", tac: 1 } },
      ambr: { downlink: 1e9, uplink: 1e9 },
    })),
    pager: { page: 0, page_size: 100, count: ues.length },
  };
}

function getDemoGNBInfo() {
  return {
    items: [
      {
        gnb_id: 1,
        plmn: "00101",
        num_connected_ues: Math.floor(Math.random() * 5) + 1,
        supported_ta_list: [{ tac: "000001", bplmns: [{ plmn: "00101", snssai: [{ sst: 1, sd: "ffffff" }] }] }],
        ng: { setup_success: true },
      },
    ],
    pager: { page: 0, page_size: 100, count: 1 },
  };
}

function getDemoPDUInfo() {
  const states = ["active", "inactive"];
  return {
    items: [
      {
        supi: "imsi-001011234567895",
        ue_activity: "active",
        pdu: [{ psi: 1, dnn: "internet", ipv4: "192.168.100.2", snssai: { sst: 1, sd: "ffffff" }, qos_flows: [{ qfi: 1, "5qi": 9 }], pdu_state: "active" }],
      },
      {
        supi: "imsi-001011234567896",
        ue_activity: states[Math.random() > 0.5 ? 0 : 1],
        pdu: [{ psi: 2, dnn: "internet", ipv4: "192.168.100.3", snssai: { sst: 1, sd: "ffffff" }, qos_flows: [{ qfi: 1, "5qi": 9 }], pdu_state: "active" }],
      },
    ],
    pager: { page: 0, page_size: 100, count: 2 },
  };
}

// ──────────────────────────────────────────────────────────
// PROXY HELPER — try real API, fall back to demo on error
// ──────────────────────────────────────────────────────────
async function proxyOrDemo(realUrl, demoFn, label) {
  if (DEMO_MODE) {
    console.log(`[DEMO] ${label}`);
    return { data: demoFn(), source: "demo" };
  }
  try {
    const resp = await axios.get(realUrl, { timeout: 3000 });
    console.log(`[LIVE] ${label} → ${realUrl}`);
    return { data: resp.data, source: "live" };
  } catch (err) {
    console.warn(`[FALLBACK] ${label} — core unreachable: ${err.message}`);
    return { data: demoFn(), source: "demo-fallback" };
  }
}

// ──────────────────────────────────────────────────────────
// API ROUTES
// ──────────────────────────────────────────────────────────

// GET /api/ue — All connected UEs (from AMF)
app.get("/api/ue", async (req, res) => {
  const page = req.query.page || 0;
  const pageSize = req.query.page_size || 100;
  const result = await proxyOrDemo(
    `${AMF_BASE}/ue-info?page=${page}&page_size=${pageSize}`,
    getDemoUEInfo,
    "UE Info"
  );
  res.json(result);
});

// GET /api/gnb — All connected gNBs (from AMF)
app.get("/api/gnb", async (req, res) => {
  const result = await proxyOrDemo(
    `${AMF_BASE}/gnb-info`,
    getDemoGNBInfo,
    "gNB Info"
  );
  res.json(result);
});

// GET /api/pdu — All active PDU sessions (from SMF)
app.get("/api/pdu", async (req, res) => {
  const page = req.query.page || 0;
  const pageSize = req.query.page_size || 100;
  const result = await proxyOrDemo(
    `${SMF_BASE}/pdu-info?page=${page}&page_size=${pageSize}`,
    getDemoPDUInfo,
    "PDU Session Info"
  );
  res.json(result);
});

// GET /api/subscribers — Subscriber list from WebUI
app.get("/api/subscribers", async (req, res) => {
  try {
    const resp = await axios.get(`${WEBUI_BASE}/api/db/Subscriber`, { timeout: 3000 });
    res.json({ data: resp.data, source: "live" });
  } catch (err) {
    res.json({ data: [], source: "unavailable", error: err.message });
  }
});

// GET /api/status — Health check: which NFs are reachable
app.get("/api/status", async (req, res) => {
  const checks = await Promise.allSettled([
    axios.get(`${AMF_BASE}/ue-info`, { timeout: 2000 }),
    axios.get(`${SMF_BASE}/pdu-info`, { timeout: 2000 }),
    axios.get(`${WEBUI_BASE}/api/db/Subscriber`, { timeout: 2000 }),
  ]);

  const nfs = ["AMF", "SMF", "WebUI"];
  const status = nfs.map((nf, i) => ({
    name: nf,
    status: checks[i].status === "fulfilled" ? "online" : "offline",
  }));

  const allOnline = status.every((s) => s.status === "online");

  res.json({
    mode: DEMO_MODE ? "demo" : allOnline ? "live" : "partial",
    nfs: status,
    amf: AMF_BASE,
    smf: SMF_BASE,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║   5G Core Monitor — Proxy Server                ║
║   Running on http://localhost:${PORT}              ║
║   Mode: ${DEMO_MODE ? "DEMO (mock data)" : "LIVE (proxying to Open5GS)"}           ║
║                                                  ║
║   Endpoints:                                     ║
║   GET /api/ue          → AMF UE info            ║
║   GET /api/gnb         → AMF gNB info           ║
║   GET /api/pdu         → SMF PDU session info   ║
║   GET /api/subscribers → WebUI subscriber list  ║
║   GET /api/status      → NF health check        ║
╚══════════════════════════════════════════════════╝
  `);
});
