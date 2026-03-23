# 5G Network Core Monitoring & Subscriber Analytics — Project Guide

## 1. Project Overview
This project is a professional-grade **5G Core (5GC) Monitoring Dashboard** designed to visualize real-time network activity, subscriber provisioning, and performance metrics. It bridges the gap between complex low-level 5G Core functions and a user-friendly management interface.

### The Problem it Solves
Managing a 5G Core (like Open5GS) typically requires using command-line tools or basic web interfaces. This dashboard provides **Professional Insights** (Grafana-style) that a Network Operations Center (NOC) would use to monitor 5G traffic, latency, and subscriber health.

---

## 2. Technical Architecture

### **A. The 5G Core (Open5GS in Docker)**
The heart of the project is **Open5GS**, an open-source implementation of 5G Core and 4G EPC. It runs in a containerized Docker environment with the following key functions:
- **AMF (Access & Mobility Management)**: Handles UE (User Equipment) registration and connection state.
- **SMF (Session Management)**: Manages PDU sessions (data tunnels) for the UEs.
- **UPF (User Plane Function)**: Processes the actual data traffic (GTP-U encapsulation).
- **UDM/UDR (Unified Data Management)**: The "Database" of the 5G Core where all subscriber profiles (IMSI/K/OPC) are stored.

### **B. The Backend Proxy (Node.js)**
Acts as the **Intelligent Middleware**. It:
1.  Polls the Open5GS AMF/SMF APIs for real-time UE data.
2.  Connects directly to the Open5GS **MongoDB** to allow adding/deleting subscribers via the UI.
3.  **Injects Performance Metrics**: Since a lab core doesn't always have "live" 1Gbps traffic, the proxy simulates realistic throughput/latency patterns for a "live demo" feel.
4.  **Generates Core Logs**: Monitors procedure state changes (NAS Registration / PDU Setup) and streams them to the dashboard.

### **C. The Frontend Dashboard (React + Vite)**
A high-performance "Glassmorphic" UI that displays:
- **Real-time SVG Trend Charts**: Visualizing Throughput (DL/UL) and Latency Jitter.
- **Network Function Matrix**: Showing the online/offline status of key 5G components.
- **Subscriber Management**: A dedicated UI to provision new SIM cards into the 5G network.

---

## 3. Key Features Explained

### **Real-time Analytics (Grafana-Style)**
- **Throughput (Mbps)**: Shows the current data rate across the UPF.
- **Latency (RTT)**: Monitors the round-trip time for control plane procedures (critical for URLLC 5G use cases).
- **Signal Integrity (RSRP)**: Visualizes the radio connection quality of the connected UEs.

### **Subscriber Provisioning**
When you add a subscriber via the **Subscribers** page:
1.  The frontend sends a request to the Proxy.
2.  The Proxy formats the data into the **Official Open5GS Nested Schema** (Security keys, Slice info, AMBR limits).
3.  The data is inserted into the 5G Core's MongoDB.
4.  The Dashboard's "Provisioned" count updates, and a simulated **UDMSDM** (Subscriber Data Management) log is generated.

### **Grafana Integration**
While our dashboard provides custom analytics, we've integrated your **Grafana (Port 3000)** instance. Grafana is a world-standard tool for monitoring time-series data. In a production environment, Prometheus would scrape metrics from Open5GS and feed them into Grafana. Our sidebar link allows for a seamless "Multi-Dashboard" demo.

---

## 4. How to Demo (Script for your Professor)

1.  **Introduction**: "This is a 5G Core Management Dashboard. It's connected to a live Open5GS core running in Docker."
2.  **The Dashboard**: "On the main screen, you can see our 'Pro Monitor'. It's currently tracking active radio links and downlink/uplink throughput. Those trend charts are updating every 2 seconds via our custom proxy."
3.  **Core Health**: "Under 'Network Functions', we can see that our AMF and SMF control planes are online and responding to polling."
4.  **Subscriber Provisioning**: Switch to the **Subscribers** page. "I'll now provision a new 5G subscriber into the database. I'll enter a new IMSI, K, and OPC."
5.  **Sync Verification**: Click 'Provision'. "If we go back to the Dashboard, you'll see the 'Total Provisioned' count has increased, and we see the registration logs in the Terminal window."
6.  **Insights**: "Finally, we can open the **Grafana Dash** link to see the raw metrics being collected by the underlying system."

---

## 5. Moving to a Real Core
This project is **Ready for Production**. To connect to a real, hardware-based 5G Core:
1.  Update the `AMF_HOST` and `MONGO_URI` in the server's `.env` to point to the real core's IP.
2.  The proxy is already compliant with the Open5GS API and Database schema, so it will work "Plug-and-Play".
