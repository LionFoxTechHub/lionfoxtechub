/* ===== DASHBOARD JAVASCRIPT ===== */
'use strict';

// ===== CONFIG =====
const TICK_MS = 1500; // update interval in ms

// ===== STATE =====
const state = {
  cpu: 34,
  mem: 62,
  disk: 47,
  netUp: 1.8,
  netDown: 12.4,
  uptime: 1296000, // seconds (~15 days)
  processes: [
    { pid: 1,    name: 'systemd',    tag: 'sys',  cpu: 0.1,  mem: 0.4,  status: 'running' },
    { pid: 312,  name: 'nginx',      tag: 'web',  cpu: 2.8,  mem: 3.1,  status: 'running' },
    { pid: 547,  name: 'postgres',   tag: 'db',   cpu: 4.5,  mem: 8.7,  status: 'running' },
    { pid: 782,  name: 'node',       tag: 'app',  cpu: 11.2, mem: 14.3, status: 'running' },
    { pid: 891,  name: 'redis-server',tag:'cache',cpu: 0.6,  mem: 2.1,  status: 'running' },
    { pid: 1024, name: 'sshd',       tag: null,   cpu: 0.0,  mem: 0.3,  status: 'sleeping'},
    { pid: 1137, name: 'dockerd',    tag: 'sys',  cpu: 1.4,  mem: 5.9,  status: 'running' },
    { pid: 1502, name: 'prometheus', tag: 'mon',  cpu: 0.9,  mem: 4.2,  status: 'running' },
    { pid: 2011, name: 'grafana',    tag: 'mon',  cpu: 0.7,  mem: 6.8,  status: 'running' },
    { pid: 2344, name: 'bash',       tag: null,   cpu: 0.0,  mem: 0.1,  status: 'sleeping'},
  ],
  diskIO: [
    { name: '/dev/sda', read: 42, write: 18, used: 47 },
    { name: '/dev/sdb', read: 8,  write: 3,  used: 22 },
  ],
  cpuCores: [38, 41, 28, 55, 34, 29, 62, 47],
  cpuHistory: Array.from({length: 30}, () => 20 + Math.random() * 40),
  netHistory: Array.from({length: 30}, () => ({ up: Math.random() * 5, down: Math.random() * 20 })),
};

// ===== HELPERS =====
function rand(min, max) { return Math.random() * (max - min) + min; }
function jitter(val, amplitude, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val + (Math.random() - 0.5) * 2 * amplitude));
}
function fmt1(n) { return n.toFixed(1); }
function fmtMB(mb) { return mb >= 1024 ? (mb / 1024).toFixed(1) + ' GB' : mb.toFixed(0) + ' MB'; }

function uptimeStr(s) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// ===== CHARTS =====
const CPU_HISTORY_COLOR  = '#6366f1';
const CPU_AREA_COLOR     = 'rgba(99,102,241,0.12)';
const NET_UP_COLOR       = '#f97316';
const NET_DOWN_COLOR     = '#10b981';
const NET_UP_AREA        = 'rgba(249,115,22,0.1)';
const NET_DOWN_AREA      = 'rgba(16,185,129,0.1)';

let cpuChart, netChart;

function buildCpuChart() {
  const canvas = document.getElementById('cpuChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  cpuChart = { ctx, canvas };
  drawLineChart(ctx, canvas, state.cpuHistory, CPU_HISTORY_COLOR, CPU_AREA_COLOR, 0, 100);
}

function buildNetChart() {
  const canvas = document.getElementById('netChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  netChart = { ctx, canvas };
  drawDualLineChart(ctx, canvas,
    state.netHistory.map(n => n.up),
    state.netHistory.map(n => n.down),
    NET_UP_COLOR, NET_DOWN_COLOR,
    NET_UP_AREA, NET_DOWN_AREA
  );
}

function devicePixelRatio() { return window.devicePixelRatio || 1; }

function setCanvasSize(canvas) {
  const dpr = devicePixelRatio();
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.getContext('2d').scale(dpr, dpr);
  }
  return { w, h };
}

function drawLineChart(ctx, canvas, data, lineColor, areaColor, yMin, yMax) {
  const { w, h } = setCanvasSize(canvas);
  ctx.clearRect(0, 0, w, h);

  if (data.length < 2) return;
  const pad = { top: 8, right: 8, bottom: 20, left: 34 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const range = yMax - yMin;

  const xStep = cw / (data.length - 1);
  const yAt = v => pad.top + ch - ((v - yMin) / range) * ch;
  const xAt = i => pad.left + i * xStep;

  // Grid lines
  ctx.strokeStyle = 'rgba(31,41,55,0.8)';
  ctx.lineWidth = 1;
  [0, 25, 50, 75, 100].forEach(pct => {
    const y = yAt(pct);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + cw, y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(107,114,128,0.6)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(pct + '%', pad.left - 4, y + 3);
  });

  // Area fill
  ctx.beginPath();
  ctx.moveTo(xAt(0), yAt(data[0]));
  for (let i = 1; i < data.length; i++) ctx.lineTo(xAt(i), yAt(data[i]));
  ctx.lineTo(xAt(data.length - 1), pad.top + ch);
  ctx.lineTo(xAt(0), pad.top + ch);
  ctx.closePath();
  ctx.fillStyle = areaColor;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(xAt(0), yAt(data[0]));
  for (let i = 1; i < data.length; i++) ctx.lineTo(xAt(i), yAt(data[i]));
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Latest dot
  const lx = xAt(data.length - 1);
  const ly = yAt(data[data.length - 1]);
  ctx.beginPath();
  ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = lineColor;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(lx, ly, 6, 0, Math.PI * 2);
  ctx.fillStyle = areaColor;
  ctx.fill();

  // X-axis timestamps (every 5 points)
  ctx.fillStyle = 'rgba(107,114,128,0.5)';
  ctx.font = '9px system-ui';
  ctx.textAlign = 'center';
  const now = new Date();
  for (let i = 0; i < data.length; i += 5) {
    const secsAgo = (data.length - 1 - i) * (TICK_MS / 1000);
    const t = new Date(now - secsAgo * 1000);
    const label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    ctx.fillText(label, xAt(i), h - 5);
  }
}

function drawDualLineChart(ctx, canvas, data1, data2, c1, c2, a1, a2) {
  const { w, h } = setCanvasSize(canvas);
  ctx.clearRect(0, 0, w, h);

  if (data1.length < 2) return;
  const all = [...data1, ...data2];
  const yMax = Math.max(...all) * 1.2 || 1;
  const yMin = 0;
  const pad = { top: 8, right: 8, bottom: 20, left: 38 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const range = yMax - yMin;
  const xStep = cw / (data1.length - 1);
  const yAt = v => pad.top + ch - ((v - yMin) / range) * ch;
  const xAt = i => pad.left + i * xStep;

  // Grid
  ctx.strokeStyle = 'rgba(31,41,55,0.8)';
  ctx.lineWidth = 1;
  const gridVals = [0, yMax / 2, yMax].map(v => Math.round(v * 10) / 10);
  gridVals.forEach(v => {
    const y = yAt(v);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cw, y); ctx.stroke();
    ctx.fillStyle = 'rgba(107,114,128,0.6)';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'right';
    const label = v >= 1024 ? (v / 1024).toFixed(1) + 'G' : v.toFixed(1) + 'M';
    ctx.fillText(label, pad.left - 4, y + 3);
  });

  [{ data: data1, c: c1, a: a1 }, { data: data2, c: c2, a: a2 }].forEach(({ data, c, a }) => {
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(data[0]));
    for (let i = 1; i < data.length; i++) ctx.lineTo(xAt(i), yAt(data[i]));
    ctx.lineTo(xAt(data.length - 1), pad.top + ch);
    ctx.lineTo(xAt(0), pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = a; ctx.fill();

    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(data[0]));
    for (let i = 1; i < data.length; i++) ctx.lineTo(xAt(i), yAt(data[i]));
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
  });

  // X-axis labels
  ctx.fillStyle = 'rgba(107,114,128,0.5)';
  ctx.font = '9px system-ui';
  ctx.textAlign = 'center';
  const now = new Date();
  for (let i = 0; i < data1.length; i += 5) {
    const secsAgo = (data1.length - 1 - i) * (TICK_MS / 1000);
    const t = new Date(now - secsAgo * 1000);
    const label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    ctx.fillText(label, xAt(i), h - 5);
  }
}

// ===== GAUGE ARC =====
function drawGauge(canvasId, value, max, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const dpr = devicePixelRatio();
  canvas.width = 90 * dpr;
  canvas.height = 55 * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const cx = 45, cy = 48, r = 36;
  const startAngle = Math.PI;
  const endAngle = Math.PI * 2;
  const valueAngle = startAngle + (value / max) * Math.PI;

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = 'rgba(31,41,55,0.9)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Value
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, valueAngle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ===== UPDATE DOM =====
function updateKPIs() {
  setText('kpi-cpu', fmt1(state.cpu) + '%');
  setText('kpi-mem', fmt1(state.mem) + '%');
  setText('kpi-disk', fmt1(state.disk) + '%');
  setText('kpi-net', fmt1(state.netDown) + ' MB/s');

  setText('kpi-cpu-sub', `${Math.round(state.cpu * 0.08)} / 8 cores active`);
  setText('kpi-mem-sub', `${fmtMB(state.mem * 81.92)} / 8 GB used`);
  setText('kpi-disk-sub', `${fmt1(state.disk * 2)} GB / 420 GB used`);
  setText('kpi-net-sub', `↑ ${fmt1(state.netUp)} MB/s  ↓ ${fmt1(state.netDown)} MB/s`);

  setBar('bar-cpu', state.cpu);
  setBar('bar-mem', state.mem);
  setBar('bar-disk', state.disk);
  setBar('bar-net', Math.min((state.netDown / 100) * 100, 100));
}

function updateGauges() {
  drawGauge('gauge-cpu', state.cpu, 100, '#6366f1');
  drawGauge('gauge-mem', state.mem, 100, '#22d3ee');
  drawGauge('gauge-disk', state.disk, 100, '#f59e0b');
  drawGauge('gauge-load', Math.min(state.cpuCores.reduce((a, b) => a + b, 0) / state.cpuCores.length, 100), 100, '#10b981');
  setGaugeVal('gauge-cpu-val', fmt1(state.cpu) + '%', '#6366f1');
  setGaugeVal('gauge-mem-val', fmt1(state.mem) + '%', '#22d3ee');
  setGaugeVal('gauge-disk-val', fmt1(state.disk) + '%', '#f59e0b');
  const avgLoad = state.cpuCores.reduce((a, b) => a + b, 0) / state.cpuCores.length;
  setGaugeVal('gauge-load-val', fmt1(avgLoad) + '%', '#10b981');
}

function setGaugeVal(id, text, color) {
  const el = document.getElementById(id);
  if (el) { el.textContent = text; el.style.color = color; }
}

function updateCoreGrid() {
  state.cpuCores.forEach((val, i) => {
    const bar = document.getElementById(`core-bar-${i}`);
    if (bar) bar.style.height = val + '%';
    const label = document.getElementById(`core-val-${i}`);
    if (label) label.textContent = Math.round(val) + '%';
  });
}

function updateNetStats() {
  setText('net-up-val', fmt1(state.netUp) + ' MB/s');
  setText('net-down-val', fmt1(state.netDown) + ' MB/s');
}

function updateDiskIO() {
  state.diskIO.forEach((disk, i) => {
    setBar(`diskio-bar-${i}`, disk.used);
    setText(`diskio-read-${i}`, disk.read + ' MB/s');
    setText(`diskio-write-${i}`, disk.write + ' MB/s');
  });
}

function updateProcessTable() {
  const tbody = document.getElementById('proc-tbody');
  if (!tbody) return;
  tbody.innerHTML = state.processes.map(p => `
    <tr>
      <td class="pid-col">${p.pid}</td>
      <td>
        <span class="process-name">${p.name}${p.tag ? `<span class="proc-tag">${p.tag}</span>` : ''}</span>
      </td>
      <td class="cpu-bar-cell">
        <div class="inline-bar">
          <div class="inline-bar-track"><div class="inline-bar-fill" style="width:${Math.min(p.cpu, 100)}%"></div></div>
          <span class="inline-bar-val">${fmt1(p.cpu)}%</span>
        </div>
      </td>
      <td class="cpu-bar-cell">
        <div class="inline-bar">
          <div class="inline-bar-track"><div class="inline-bar-fill mem-fill" style="width:${Math.min(p.mem, 100)}%"></div></div>
          <span class="inline-bar-val">${fmt1(p.mem)}%</span>
        </div>
      </td>
      <td><span class="status-dot ${p.status}"></span> ${p.status}</td>
    </tr>
  `).join('');
}

function updateUptime() {
  state.uptime += Math.round(TICK_MS / 1000);
  setText('uptime-val', uptimeStr(state.uptime));
}

function updateCharts() {
  state.cpuHistory.push(state.cpu);
  if (state.cpuHistory.length > 30) state.cpuHistory.shift();

  state.netHistory.push({ up: state.netUp, down: state.netDown });
  if (state.netHistory.length > 30) state.netHistory.shift();

  if (cpuChart) drawLineChart(cpuChart.ctx, cpuChart.canvas, state.cpuHistory, CPU_HISTORY_COLOR, CPU_AREA_COLOR, 0, 100);
  if (netChart) drawDualLineChart(netChart.ctx, netChart.canvas,
    state.netHistory.map(n => n.up),
    state.netHistory.map(n => n.down),
    NET_UP_COLOR, NET_DOWN_COLOR, NET_UP_AREA, NET_DOWN_AREA
  );
}

// ===== SIMULATE UPDATES =====
function tick() {
  // CPU – realistic oscillation
  state.cpu = jitter(state.cpu, 6, 5, 92);
  state.mem = jitter(state.mem, 2, 20, 88);
  state.disk = jitter(state.disk, 0.3, 30, 85);
  state.netUp = jitter(state.netUp, 0.8, 0.1, 15);
  state.netDown = jitter(state.netDown, 2.5, 0.1, 80);

  state.cpuCores = state.cpuCores.map(c => jitter(c, 8, 2, 98));

  // Process CPU jitter
  state.processes.forEach(p => {
    p.cpu = jitter(p.cpu, p.cpu > 5 ? 1.5 : 0.3, 0, 60);
    p.mem = jitter(p.mem, 0.3, 0.05, 30);
  });

  // Disk IO jitter
  state.diskIO.forEach(d => {
    d.read  = Math.max(0, jitter(d.read,  5, 0, 200));
    d.write = Math.max(0, jitter(d.write, 3, 0, 100));
  });

  // Update DOM
  updateKPIs();
  updateGauges();
  updateCoreGrid();
  updateNetStats();
  updateDiskIO();
  updateProcessTable();
  updateUptime();
  updateCharts();
  updateClock();
}

// ===== UTILITIES =====
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setBar(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = Math.min(Math.max(pct, 0), 100) + '%';
}

function updateClock() {
  const el = document.getElementById('topbar-clock');
  if (el) el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const btn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!btn || !sidebar || !overlay) return;

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('show');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  }

  btn.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  overlay.addEventListener('click', closeSidebar);
  sidebar.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      if (window.innerWidth < 768) closeSidebar();
    });
  });
}

// ===== RESIZE =====
function onResize() {
  if (cpuChart) drawLineChart(cpuChart.ctx, cpuChart.canvas, state.cpuHistory, CPU_HISTORY_COLOR, CPU_AREA_COLOR, 0, 100);
  if (netChart) drawDualLineChart(netChart.ctx, netChart.canvas,
    state.netHistory.map(n => n.up),
    state.netHistory.map(n => n.down),
    NET_UP_COLOR, NET_DOWN_COLOR, NET_UP_AREA, NET_DOWN_AREA
  );
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Initial render
  updateKPIs();
  updateGauges();
  updateCoreGrid();
  updateNetStats();
  updateDiskIO();
  updateProcessTable();
  updateUptime();
  updateClock();
  buildCpuChart();
  buildNetChart();
  initMobileMenu();

  // Start ticking
  setInterval(tick, TICK_MS);
  setInterval(updateClock, 1000);
  window.addEventListener('resize', onResize);
});
