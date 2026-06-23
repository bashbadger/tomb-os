// Tomb OS Security Desktop Simulator Logic

// System States
const systemState = {
  features: {
    ufw: true,
    apparmor: true,
    audit: true,
    fail2ban: true,
    ips: false
  },
  apps: {
    browser: { name: "Web Browser", secured: true, desc: "Restricted filesystem access, sandboxed chromium core" },
    filemanager: { name: "File Explorer", secured: true, desc: "Restricted write permissions to system folders" },
    pdfviewer: { name: "PDF Viewer", secured: true, desc: "Isolated environment, JS execution disabled" },
    ssh: { name: "SSH Service", secured: true, desc: "Key-based authentication enforced, port 22 Hardened" }
  },
  soc2: {
    mfa: false,
    backup: false,
    encryption: false
  },
  globalcom: {
    activeTab: 'eu',
    gdprForgotten: false,
    doNotSell: false,
    localResidency: false,
    piplAssessment: false,
    lgpdMapping: false
  },
  ultimate: {
    sel4: false,
    tpm: false,
    immutable: false,
    zerotrust: false
  },
  tour: {
    step: 0,
    active: false
  },
  threatLevel: "SECURE", // SECURE, WARNING, THREAT_DETECTED
  uptime: 0,
  activeWindow: null,
  windowCount: 0,
  blockedIPs: ["198.51.100.42", "203.0.113.88"]
};

// Simulated Security Logs for auditd
let auditLogs = [
  "Jun 23 00:01:10 tomb-os auditd[412]: Audit daemon started successfully",
  "Jun 23 00:01:15 tomb-os kernel: [    0.000000] AppArmor: AppArmor initialized",
  "Jun 23 00:02:04 tomb-os ufw[618]: [UFW BLOCK] IN=eth0 OUT= MAC=00:11:22:33:44:55 SRC=198.51.100.42 DST=10.0.2.15 PROTO=TCP SPT=44211 DPT=22",
  "Jun 23 00:03:42 tomb-os fail2ban.actions[812]: [ssh] Ban 198.51.100.42"
];

// Simulated IDS Event Queue
const idsEventTemplates = [
  { tag: "alert", msg: "SQL Injection attempt detected in HTTP GET /login", src: "185.220.101.5", type: "Web attack" },
  { tag: "warn", msg: "Port scan detected on ports: 21, 22, 23, 80", src: "45.143.203.14", type: "Reconnaissance" },
  { tag: "alert", msg: "Brute-force SSH attack: 5 failed logins in 10s", src: "91.240.118.66", type: "Authentication" },
  { tag: "info", msg: "AppArmor blocked unauthorized read on /etc/shadow by chromium-browser", src: "localhost", type: "MAC Policy" },
  { tag: "warn", msg: "ICMP flood packet volume exceeded threshold", src: "192.168.1.102", type: "DoS Attempt" }
];

let idsActiveLogs = [];

// Boot Screen Simulation
window.addEventListener('DOMContentLoaded', () => {
  const bootScreen = document.getElementById('boot-screen');
  const bootStatus = document.querySelector('.boot-status');
  const bootProgressFill = document.querySelector('.boot-progress-fill');
  const desktopWrapper = document.getElementById('desktop-wrapper');

  const bootSteps = [
    { progress: 10, text: "Initializing Linux 6.13.0-hardened-lts kernel..." },
    { progress: 25, text: "Loading AppArmor MAC kernel profiles..." },
    { progress: 40, text: "Activating Netfilter IPTables firewall..." },
    { progress: 55, text: "Starting auditd (Linux Audit Daemon)..." },
    { progress: 75, text: "Starting fail2ban intrusion prevention agent..." },
    { progress: 90, text: "Starting GNOME Desktop Environment..." },
    { progress: 100, text: "Welcome to TOMB OS 1.0!" }
  ];

  let currentStep = 0;
  function runBootLoader() {
    if (currentStep < bootSteps.length) {
      const step = bootSteps[currentStep];
      bootProgressFill.style.width = `${step.progress}%`;
      bootStatus.textContent = step.text;
      currentStep++;
      setTimeout(runBootLoader, 400 + Math.random() * 250);
    } else {
      setTimeout(() => {
        bootScreen.classList.add('fade-out');
        desktopWrapper.classList.remove('hidden');
        setTimeout(() => {
          bootScreen.classList.add('hidden');
          openWindow('readme');
          setTimeout(startTour, 1000);
        }, 800);
      }, 300);
    }
  }

  runBootLoader();
  updateTime();
  setInterval(updateTime, 1000);
  setInterval(incrementUptime, 60000);
  setupIDSFeed();
});

// Update System Clock
function updateTime() {
  const liveTimeEl = document.getElementById('live-time');
  if (liveTimeEl) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    liveTimeEl.textContent = new Date().toLocaleString('en-US', options);
  }
}

// Uptime Counter
function incrementUptime() {
  systemState.uptime++;
  const uptimeEl = document.getElementById('uptime-counter');
  if (uptimeEl) {
    uptimeEl.textContent = `${systemState.uptime}m`;
  }
}

// Toggle Quick Settings
function toggleQuickSettings() {
  const qs = document.getElementById('quick-settings');
  qs.classList.toggle('hidden');
}

// Close popup on click outside
window.addEventListener('click', (e) => {
  const qs = document.getElementById('quick-settings');
  const shield = document.getElementById('security-badge');
  const indicators = document.querySelector('.system-indicators');
  
  if (qs && !qs.classList.contains('hidden')) {
    if (!qs.contains(e.target) && !shield.contains(e.target) && !indicators.contains(e.target)) {
      qs.classList.add('hidden');
    }
  }
});

// Toggle Security Feature from Quick Settings
function toggleSecurityFeature(feature) {
  systemState.features[feature] = !systemState.features[feature];
  
  const iconWrapper = document.getElementById(`qs-${feature}-icon`);
  if (iconWrapper) {
    if (systemState.features[feature]) {
      iconWrapper.classList.add('active');
    } else {
      iconWrapper.classList.remove('active');
    }
  }

  if (feature === 'apparmor') {
    Object.keys(systemState.apps).forEach(app => {
      systemState.apps[app].secured = systemState.features.apparmor;
    });
    updateAppArmorUI();
  }

  logAudit(`System security configuration altered. Feature '${feature}' set to ${systemState.features[feature] ? 'ENABLED' : 'DISABLED'}`);
  updateSecurityShield();
  syncComplianceDials();
}

// Update Topbar Badge
function updateSecurityShield() {
  const badge = document.getElementById('security-badge');
  const badgeText = badge.querySelector('.badge-text');
  
  const ufwActive = systemState.features.ufw;
  const aaActive = systemState.features.apparmor;
  const auditActive = systemState.features.audit;
  const f2bActive = systemState.features.fail2ban;
  
  if (systemState.threatLevel === "THREAT_DETECTED") {
    badge.className = "status-shield threat-detected";
    badgeText.textContent = "THREAT LEVEL HIGH";
    return;
  }

  const activeCount = [ufwActive, aaActive, auditActive, f2bActive].filter(Boolean).length;

  if (activeCount === 4) {
    systemState.threatLevel = "SECURE";
    badge.className = "status-shield";
    badgeText.textContent = "SECURE";
    badgeText.style.color = "var(--sec-green)";
  } else if (activeCount >= 2) {
    systemState.threatLevel = "WARNING";
    badge.className = "status-shield";
    badgeText.textContent = "HARDENING DEGRADED";
    badgeText.style.color = "var(--sec-yellow)";
  } else {
    systemState.threatLevel = "WARNING";
    badge.className = "status-shield threat-detected";
    badgeText.textContent = "CRITICAL WARNING";
    badgeText.style.color = "var(--sec-red)";
  }
}

// Log message to auditd
function logAudit(message) {
  const now = new Date();
  const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + " " + now.toLocaleTimeString('en-US', { hour12: false });
  auditLogs.push(`${timeStr} tomb-os admin-events: ${message}`);
}

// Sync compliance metrics dynamically
function syncComplianceDials() {
  const soc2ScoreEl = document.getElementById('soc2-score-display');
  if (soc2ScoreEl) {
    const s2 = calculateSOC2Score();
    soc2ScoreEl.textContent = `${s2}%`;
  }
  const globalScoreEl = document.querySelector('.globalcom-score-val');
  if (globalScoreEl) {
    const gc = calculateGlobalComplianceScore();
    globalScoreEl.textContent = `${gc}%`;
    globalScoreEl.style.color = gc > 80 ? 'var(--sec-green)' : (gc > 50 ? 'var(--sec-yellow)' : 'var(--sec-red)');
  }
  const ultimateScoreEl = document.getElementById('ultimate-score-display');
  if (ultimateScoreEl) {
    const ult = calculateUltimateScore();
    ultimateScoreEl.textContent = `${ult}%`;
    ultimateScoreEl.style.color = ult > 90 ? 'var(--sec-green)' : (ult > 50 ? 'var(--sec-yellow)' : 'var(--sec-red)');
  }
}

// Window Management Configuration
const windowConfig = {
  readme: {
    title: "README_SECURITY.md",
    width: 600,
    height: 460,
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM13 9V3.5L18.5 9H13z" fill="#E95420"/></svg>`,
    getContent: () => `
      <div class="app-readme-container">
        <h1>Tomb OS 1.0 LTS (Ultimate Security Edition)</h1>
        <p>Welcome to the secure desktop of Tomb OS. This system has been fortified with top-tier kernel security frameworks to defend against advanced threats.</p>
        
        <h2>Active Security Frameworks:</h2>
        <ul>
          <li><strong>AppArmor (Mandatory Access Control)</strong>: Enforces strict sandboxing constraints on high-risk applications (e.g. browsers, SSH).</li>
          <li><strong>Uncomplicated Firewall (UFW)</strong>: Rejects unauthorized inbound network packets and blocks suspicious ports.</li>
          <li><strong>auditd (Audit Framework)</strong>: Logs all administrative events, privilege escalations, and system calls to a secure audit journal.</li>
          <li><strong>Fail2Ban (IPS)</strong>: Monitors server authentication logs and dynamically blacklists offending brute-force IPs.</li>
        </ul>
        
        <h2>Quick Start Commands (Open Terminal):</h2>
        <ul>
          <li><code>ufw status</code> - Inspect current firewall filters.</li>
          <li><code>aa-status</code> - Check sandboxed application containment status.</li>
          <li><code>auditd</code> - Dump audit daemon logs.</li>
          <li><code>gpg -c [filename]</code> - Encrypt text files with symmetrical AES encryption.</li>
        </ul>
        <p><em>Use the left dock to open the Terminal, Intrusion Detection System (IDS), AppArmor controller, CIS Auditor, and Crypt Vault.</em></p>
      </div>
    `
  },
  terminal: {
    title: "sec-admin@tomb-os: ~",
    width: 650,
    height: 440,
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><rect width="20" height="16" x="2" y="4" rx="2" fill="none" stroke="#FFF" stroke-width="1.5" /><path d="M6 8l4 4-4 4M12 15h6" stroke="#4AF626" stroke-width="1.5" stroke-linecap="round" fill="none" /></svg>`,
    getContent: () => `
      <div class="app-terminal-container" onclick="focusTerminalInput(this)">
        <div class="terminal-welcome">
          Welcome to TOMB OS 1.0 LTS (GNU/Linux 6.13.0-tomb-hardened x86_64)
          <br>* AppArmor state: Active (Enforcing profiles)
          <br>* Firewall state: Active (UFW rules loaded)
          <br>* System auditd daemon: running
          <br>Type 'help' to review list of authorized diagnostic commands.
        </div>
        <div class="terminal-history"></div>
        <div class="terminal-input-line">
          <span class="terminal-prompt">sec-admin@tomb-os:~$</span>
          <input type="text" class="terminal-input" autofocus onkeydown="handleTerminalCommand(event, this)" spellcheck="false" aria-label="Terminal input prompt" />
        </div>
        <div class="terminal-chips-wrapper">
          <div class="terminal-chip-label">Quick Commands (Click to Run):</div>
          <button class="terminal-chip" onclick="runTerminalChipCommand('ufw status')">ufw status</button>
          <button class="terminal-chip" onclick="runTerminalChipCommand('aa-status')">aa-status</button>
          <button class="terminal-chip" onclick="runTerminalChipCommand('fail2ban-client status')">fail2ban status</button>
          <button class="terminal-chip" onclick="runTerminalChipCommand('auditd')">auditd</button>
          <button class="terminal-chip" onclick="runTerminalChipCommand('sysctl -a')">sysctl -a</button>
          <button class="terminal-chip" onclick="runTerminalChipCommand('help')">help</button>
        </div>
      </div>
    `
  },
  ids: {
    title: "Intrusion Detection System (Snort/Suricata Visualizer)",
    width: 650,
    height: 480,
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2L2 7v6c0 5.52 4.48 10 10 10s10-4.48 10-10V7l-10-5zm0 18c-4.41 0-8-3.59-8-8V8.38l8-4 8 4V12c0 4.41-3.59 8-8 8z" fill="#E95420"/></svg>`,
    getContent: () => `
      <div class="app-ids-container">
        <div class="ids-grid">
          <div class="ids-panel">
            <h4>Live Network Intrusions / Sec</h4>
            <div class="ids-canvas-wrapper">
              <canvas id="ids-chart" class="ids-canvas"></canvas>
            </div>
          </div>
          <div class="ids-panel">
            <h4>System Threat Metrics</h4>
            <div class="ids-stats-grid">
              <div class="ids-stat-card">
                <div class="ids-stat-val" id="stats-total-alerts">0</div>
                <div class="ids-stat-label">Alerts Logged</div>
              </div>
              <div class="ids-stat-card" style="border-left-color: var(--sec-green)">
                <div class="ids-stat-val" id="stats-blocked-ips">2</div>
                <div class="ids-stat-label">Banned IPs</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="ids-log-section">
          <div class="ids-log-header">
            <span class="ids-log-title">IDS Security Events Log (Suricata Engine)</span>
            <div class="ids-controls">
              <button class="ids-btn" id="ips-toggle-btn" onclick="toggleIPS()" aria-label="Toggle Intrusion Prevention Shield">Enable IPS Shield</button>
              <button class="ids-btn sec-off" onclick="clearIDSLogs()" aria-label="Clear Console Output">Clear Console</button>
            </div>
          </div>
          <div class="ids-log-list" id="ids-logs-wrapper"></div>
        </div>
      </div>
    `
  },
  apparmor: {
    title: "AppArmor Security Profiles",
    width: 580,
    height: 420,
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" fill="#E95420"/></svg>`,
    getContent: () => {
      let appCards = '';
      Object.keys(systemState.apps).forEach(key => {
        const app = systemState.apps[key];
        appCards += `
          <div class="aa-card">
            <div class="aa-card-left">
              <span class="aa-card-title">${app.name}</span>
              <span class="aa-card-desc">${app.desc}</span>
            </div>
            <div class="aa-card-right">
              <span class="aa-badge ${app.secured ? 'enforce' : 'complain'}" id="aa-badge-${key}">
                ${app.secured ? 'ENFORCE' : 'COMPLAIN / UNCONFINED'}
              </span>
              <label class="aa-switch">
                <input type="checkbox" ${app.secured ? 'checked' : ''} onchange="toggleAppArmorProfile('${key}', this)" aria-label="AppArmor Enforcing Switch for ${app.name}">
                <span class="aa-slider"></span>
              </label>
            </div>
          </div>
        `;
      });

      return `
        <div class="app-apparmor-container">
          <div class="apparmor-header">
            <div class="aa-stats">
              <div class="aa-stat-item">
                <span class="aa-stat-lbl">Profiles Loaded</span>
                <span class="aa-stat-val" id="aa-total-profiles">4</span>
              </div>
              <div class="aa-stat-item" style="margin-left: 20px;">
                <span class="aa-stat-lbl">Enforcing Mode</span>
                <span class="aa-stat-val" id="aa-enforcing-profiles">4</span>
              </div>
            </div>
            <button class="ids-btn" onclick="enforceAllAppArmor()" aria-label="Enforce All Sandbox rules">Enforce All Sandbox rules</button>
          </div>
          <div class="aa-list" id="aa-app-list">
            ${appCards}
          </div>
        </div>
      `;
    }
  },
  cis: {
    title: "CIS Tomb OS Hardening Benchmark Auditor",
    width: 600,
    height: 480,
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#E95420"/></svg>`,
    getContent: () => `
      <div class="app-cis-container">
        <div class="cis-header">
          <div class="cis-intro">
            <h3>CIS Benchmarks Auditor</h3>
            <p>Audits local Tomb OS configuration settings against the Center for Internet Security Hardening standards.</p>
            <button class="cis-btn-scan" onclick="runCISAudit()" aria-label="Run Security Compliance Audit">Run Security Compliance Audit</button>
          </div>
          <div class="cis-score-panel">
            <div>
              <div class="cis-score-circle" id="cis-score-dial">0%</div>
              <div class="cis-score-dial-label" style="font-size:11px; margin-top:4px; text-align:center; color:var(--ubuntu-light-grey);">Compliance Rating</div>
            </div>
          </div>
        </div>

        <div class="cis-body">
          <div class="cis-scan-overlay hidden" id="cis-loader">
            <div class="cis-spinner"></div>
            <div style="color: #fff; font-family: var(--font-mono); font-size: 13px;">Analyzing configs & file policies...</div>
          </div>
          <div class="cis-list" id="cis-results-list">
            <div style="text-align: center; color: var(--ubuntu-light-grey); font-size: 13px; padding-top: 40px;">
              Launch audit scan to view results.
            </div>
          </div>
        </div>
      </div>
    `
  },
  vault: {
    title: "Cryptographic Vault Manager",
    width: 500,
    height: 440,
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="#E95420" /></svg>`,
    getContent: () => `
      <div class="app-vault-container">
        <div class="vault-tabs">
          <button class="vault-tab active" onclick="switchVaultTab(this, 'encrypt')">Encrypt Message</button>
          <button class="vault-tab" onclick="switchVaultTab(this, 'decrypt')">Decrypt Ciphertext</button>
        </div>
        <div class="vault-body" id="vault-panel-encrypt">
          <div class="vault-group">
            <label for="vault-plaintext">Plaintext Secret</label>
            <textarea class="vault-textarea" id="vault-plaintext" placeholder="Type sensitive message to encrypt..."></textarea>
          </div>
          <div class="vault-row">
            <div class="vault-group">
              <label for="vault-algo">Encryption Algorithm</label>
              <select class="vault-select" id="vault-algo" onchange="toggleVaultAlgoDetails(this.value)">
                <option value="aes">AES-256 (Symmetric)</option>
                <option value="kyber">Kyber-1024 (Lattice-Based PQC)</option>
                <option value="dilithium">Dilithium-5 (Digital Signature PQC)</option>
                <option value="rot13">ROT13 (Obfuscation)</option>
              </select>
            </div>
            <div class="vault-group">
              <label for="vault-key" id="vault-key-label">Secret Password / Key</label>
              <input type="password" class="vault-input" id="vault-key" placeholder="Enter keyphrase..." />
            </div>
          </div>
          <button class="vault-btn-action" onclick="runVaultEncrypt()">Generate Sealed Payload</button>
          <div class="vault-group" style="margin-top: 10px;">
            <label>Ciphertext Result</label>
            <div class="vault-result-panel" id="vault-ciphertext-output">Payload will appear here...</div>
          </div>
        </div>

        <div class="vault-body hidden" id="vault-panel-decrypt">
          <div class="vault-group">
            <label for="vault-ciphertext-input">Ciphertext Payload</label>
            <textarea class="vault-textarea" id="vault-ciphertext-input" placeholder="Paste Base64 payload..."></textarea>
          </div>
          <div class="vault-row">
            <div class="vault-group">
              <label for="vault-algo-decrypt">Encryption Algorithm</label>
              <select class="vault-select" id="vault-algo-decrypt">
                <option value="aes">AES-256 (Symmetric)</option>
                <option value="kyber">Kyber-1024 (PQC)</option>
                <option value="rot13">ROT13 (Obfuscation)</option>
              </select>
            </div>
            <div class="vault-group">
              <label for="vault-key-decrypt">Decryption Password / Key</label>
              <input type="password" class="vault-input" id="vault-key-decrypt" placeholder="Enter keyphrase..." />
            </div>
          </div>
          <button class="vault-btn-action" onclick="runVaultDecrypt()">Decrypt Payload</button>
          <div class="vault-group" style="margin-top: 10px;">
            <label>Recovered Plaintext</label>
            <div class="vault-result-panel" id="vault-plaintext-output">Recovered data will appear here...</div>
          </div>
        </div>
      </div>
    `
  },
  soc2: {
    title: "SOC 2 Trust Services Compliance Auditor",
    width: 620,
    height: 480,
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><rect x="2" y="2" width="20" height="20" rx="3" fill="#E95420"/><circle cx="12" cy="12" r="5" fill="none" stroke="#FFF" stroke-width="1.8"/><path d="M12 9v6M9 12h6" stroke="#FFF" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    getContent: () => getSOC2Content()
  },
  globalcom: {
    title: "Global Data Protection & Regulatory Compliance Hub",
    width: 680,
    height: 480,
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#E95420"/></svg>`,
    getContent: () => getGlobalComplianceContent()
  },
  ultimate: {
    title: "Ultimate Hardening Center (ZTA, seL4, TPM)",
    width: 640,
    height: 500,
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm0 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm5 8H7v-1.5c0-1.66 3.33-2.5 5-2.5s5 .84 5 2.5V16z" fill="#E95420" /></svg>`,
    getContent: () => getUltimateContent()
  }
};

// Open Window API
function openWindow(appId) {
  const container = document.getElementById('windows-container');
  const dot = document.getElementById(`dot-${appId}`);
  
  if (dot) dot.classList.remove('hidden');

  let win = document.getElementById(`window-${appId}`);
  if (win) {
    if (win.classList.contains('minimized')) {
      win.classList.remove('minimized');
    }
    focusWindow(win);
    return;
  }

  const config = windowConfig[appId];
  if (!config) return;
  systemState.windowCount++;
  
  win = document.createElement('div');
  win.id = `window-${appId}`;
  win.className = `os-window active`;
  
  const desktopWidth = document.getElementById('desktop').clientWidth;
  const desktopHeight = document.getElementById('desktop').clientHeight;
  const left = Math.max(80, (desktopWidth - config.width) / 2 + (systemState.windowCount * 20) % 100);
  const top = Math.max(40, (desktopHeight - config.height) / 2 + (systemState.windowCount * 20) % 100);
  
  win.style.width = `${config.width}px`;
  win.style.height = `${config.height}px`;
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
  
  win.innerHTML = `
    <div class="window-titlebar" onmousedown="dragStart(event, '${appId}')" ondblclick="maximizeWindow('${appId}')">
      <div class="window-title">
        <span class="window-title-icon">${config.icon}</span>
        <span>${config.title}</span>
      </div>
      <div class="window-controls">
        <button class="window-btn minimize" onclick="minimizeWindow('${appId}', event)" title="Minimize" aria-label="Minimize Window">─</button>
        <button class="window-btn maximize" onclick="maximizeWindow('${appId}', event)" title="Maximize" aria-label="Maximize Window">⬜</button>
        <button class="window-btn close" onclick="closeWindow('${appId}', event)" title="Close" aria-label="Close Window">✕</button>
      </div>
    </div>
    <div class="window-content">
      ${config.getContent()}
    </div>
  `;

  win.addEventListener('mousedown', () => focusWindow(win));
  container.appendChild(win);
  focusWindow(win);

  if (appId === 'ids') {
    initIDSCanvas();
  }
}

// Window Operations
function focusWindow(targetWin) {
  if (systemState.activeWindow === targetWin) return;
  document.querySelectorAll('.os-window').forEach(w => {
    w.classList.remove('active');
  });
  targetWin.classList.add('active');
  systemState.activeWindow = targetWin;
}

function closeWindow(appId, e) {
  if (e) e.stopPropagation();
  const win = document.getElementById(`window-${appId}`);
  if (win) win.remove();
  const dot = document.getElementById(`dot-${appId}`);
  if (dot) dot.classList.add('hidden');
}

function minimizeWindow(appId, e) {
  if (e) e.stopPropagation();
  const win = document.getElementById(`window-${appId}`);
  if (win) win.classList.add('minimized');
}

function maximizeWindow(appId, e) {
  if (e) e.stopPropagation();
  const win = document.getElementById(`window-${appId}`);
  if (win) win.classList.toggle('maximized');
}

// Drag & Drop
let dragElement = null;
let dragX = 0;
let dragY = 0;

function dragStart(e, appId) {
  const win = document.getElementById(`window-${appId}`);
  if (win.classList.contains('maximized')) return;

  focusWindow(win);
  dragElement = win;
  dragX = e.clientX - win.offsetLeft;
  dragY = e.clientY - win.offsetTop;

  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', dragEnd);
}

function dragMove(e) {
  if (!dragElement) return;
  const desktopWidth = document.getElementById('desktop').clientWidth;
  const desktopHeight = document.getElementById('desktop').clientHeight;
  
  let left = e.clientX - dragX;
  let top = e.clientY - dragY;
  
  left = Math.max(58, Math.min(left, desktopWidth - 100));
  top = Math.max(28, Math.min(top, desktopHeight - 40));

  dragElement.style.left = `${left}px`;
  dragElement.style.top = `${top}px`;
}

function dragEnd() {
  dragElement = null;
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', dragEnd);
}

// ACCESSIBILITY: Terminal Suggestions runner
function runTerminalChipCommand(cmdText) {
  const win = document.getElementById('window-terminal');
  if (!win) return;
  const input = win.querySelector('.terminal-input');
  if (input) {
    input.value = cmdText;
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    Object.defineProperty(event, 'target', { value: input });
    handleTerminalCommand(event, input);
  }
}

function focusTerminalInput(container) {
  const input = container.querySelector('.terminal-input');
  if (input) input.focus();
}

// Terminal Commands handler
function handleTerminalCommand(e, input) {
  if (e.key === 'Enter') {
    const rawVal = input.value.trim();
    input.value = '';
    
    if (!rawVal) return;
    const history = input.parentElement.previousElementSibling;
    
    history.innerHTML += `<div class="terminal-line"><span class="terminal-prompt">sec-admin@tomb-os:~$</span> <span style="color: #fff;">${escapeHTML(rawVal)}</span></div>`;
    
    // IMMUTABLE FILESYSTEM CONSTRAINT CHECK
    if (systemState.ultimate.immutable) {
      const isWriteCmd = rawVal.match(/^(gpg|touch|rm|mkdir|mv|cp|dd|sudo\s+touch|sudo\s+rm|sudo\s+mkdir)/i);
      if (isWriteCmd) {
        history.innerHTML += `<div class="terminal-line error">[AppArmor/Immutable Core BLOCK] Root filesystem overlay is locked read-only. File write and directory creation requests on '/usr' and '/' sectors are prohibited.</div>`;
        const terminalContainer = input.parentElement.parentElement;
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
        logAudit(`Unauthorized write command '${rawVal}' blocked by Immutable Core Overlay.`);
        return;
      }
    }

    const args = rawVal.split(' ');
    const cmd = args[0].toLowerCase();
    let output = '';
    
    switch (cmd) {
      case 'help':
        output = `Available Diagnostics Toolkit Commands:
  help                       - Show this documentation index.
  whoami                     - Inspect active administrative context.
  ufw status                 - Display active Firewall filters.
  ufw enable | ufw disable   - Configure status parameters for packet filter.
  aa-status                  - Inspect active AppArmor confinement state.
  aa-enforce [app]           - Force enforce sandboxing policy on target profile.
  fail2ban-client status     - Display active IPS banned telemetry logs.
  auditd                     - Print Linux Audit Daemon security logs.
  sysctl -a                  - View hardened system network kernel configs.
  gpg -c [text]              - Run symmetric AES encryption pipeline.
  clear                      - Purge terminal lines.`;
        break;
      case 'whoami':
        output = `sec-admin (System Administrator, UID: 0 - root context active)`;
        break;
      case 'clear':
        history.innerHTML = '';
        return;
      case 'ufw':
        if (args[1] === 'status') {
          output = `Status: ${systemState.features.ufw ? 'active' : 'inactive'}
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)

To                         Action      From
--                         ------      ----
22/tcp (SSH/Hardened)      LIMIT       Anywhere
443/tcp (HTTPS)            ALLOW       Anywhere
80/tcp (HTTP-redirect)     ALLOW       Anywhere`;
        } else if (args[1] === 'enable') {
          systemState.features.ufw = true;
          const ufwIcon = document.getElementById('qs-ufw-icon');
          if (ufwIcon) ufwIcon.classList.add('active');
          output = `Firewall is active and enabled on system startup`;
          logAudit("UFW Firewall status set to: ACTIVE");
          updateSecurityShield();
          syncComplianceDials();
        } else if (args[1] === 'disable') {
          systemState.features.ufw = false;
          const ufwIcon = document.getElementById('qs-ufw-icon');
          if (ufwIcon) ufwIcon.classList.remove('active');
          output = `Firewall stopped and disabled on system startup`;
          logAudit("UFW Firewall status set to: INACTIVE (WARNING)");
          updateSecurityShield();
          syncComplianceDials();
        } else {
          output = `Usage: ufw status | enable | disable`;
        }
        break;
      case 'aa-status':
        const loaded = Object.keys(systemState.apps).length;
        const enforced = Object.values(systemState.apps).filter(a => a.secured).length;
        output = `apparmor module is loaded.
${loaded} profiles are loaded.
${enforced} profiles are in enforce mode.
   /usr/bin/chromium-browser
   /usr/bin/evince-pdf-viewer
   /usr/bin/nautilus-file-manager
   /usr/sbin/sshd
${loaded - enforced} profiles are in complain mode.`;
        break;
      case 'aa-enforce':
        const target = args[1];
        if (!target) {
          output = `Usage: aa-enforce [browser | filemanager | pdfviewer | ssh]`;
        } else if (systemState.apps[target]) {
          systemState.apps[target].secured = true;
          updateAppArmorUI();
          output = `Setting AppArmor profile for /usr/bin/${target} to Enforcing mode.`;
          logAudit(`AppArmor containment profile for ${target} set to ENFORCE.`);
          syncComplianceDials();
        } else {
          output = `AppArmor profile target '/usr/bin/${target}' not found.`;
        }
        break;
      case 'fail2ban-client':
        if (args[1] === 'status') {
          output = `Status
|- Number of jail:      1
\`- Jail list:           sshd
   |- Status for jail:   sshd
   |- Filter
   |  |- Currently failed: 1
   |  \`- Total failed:     38
   \`- Actions
      |- Currently banned: ${systemState.blockedIPs.length}
      \`- Banned IP list:  ${systemState.blockedIPs.join(', ')}`;
        } else {
          output = `Usage: fail2ban-client status`;
        }
        break;
      case 'auditd':
        output = auditLogs.slice(-10).join('\n');
        break;
      case 'sysctl':
        if (rawVal.includes('net.ipv4')) {
          output = `net.ipv4.conf.all.rp_filter = 1 (Enforces Reverse Path Filtering)
net.ipv4.conf.all.accept_source_route = 0 (Disables IP Source Routing)
net.ipv4.conf.all.accept_redirects = 0 (Disables ICMP Redirects)
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.tcp_syncookies = 1 (Enables SYN Flood Mitigation)
net.ipv4.tcp_rfc1337 = 1 (Protects against TIME-WAIT assassination)`;
        } else {
          output = `net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
kernel.kptr_restrict = 2 (Blocks kernel address leaks)
kernel.yama.ptrace_scope = 1 (Hardens process memory probing)
fs.protected_symlinks = 1`;
        }
        break;
      case 'gpg':
        if (args[1] === '-c') {
          const content = args.slice(2).join(' ');
          if (!content) {
            output = `Usage: gpg -c [message_to_encrypt]`;
          } else {
            const b64 = btoa(unescape(encodeURIComponent(content)));
            output = `-----BEGIN PPG SIGNED MESSAGE-----
Hash: SHA256

Symmetric Cipher: AES-256
Salted Payload: ${b64.slice(0, 12)}X9F..${b64.slice(-8)}==
-----END PPG SIGNED MESSAGE-----`;
          }
        } else {
          output = `Usage: gpg -c [plaintext_string]`;
        }
        break;
      default:
        output = `bash: command not found: ${cmd}. Type 'help' to review authorized diagnostics toolkits.`;
    }
    
    if (output) {
      const cssClass = output.includes('not found') || output.includes('Usage:') ? 'warning' : 'output';
      history.innerHTML += `<div class="terminal-line ${cssClass}">${output.replace(/\n/g, '<br>')}</div>`;
    }
    
    const terminalContainer = input.parentElement.parentElement;
    terminalContainer.scrollTop = terminalContainer.scrollHeight;
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// APP: Intrusion Detection System
let idsChartInterval = null;
let idsAttackInterval = null;
let alertCount = 0;
const chartData = Array(30).fill(0);

function initIDSCanvas() {
  const canvas = document.getElementById('ids-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  if (idsChartInterval) clearInterval(idsChartInterval);
  
  idsChartInterval = setInterval(() => {
    if (!ctx) return;
    
    ctx.fillStyle = '#0a0006';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(233, 84, 32, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    chartData.shift();
    let latest = Math.floor(Math.random() * 15) + 5;
    if (systemState.threatLevel === "THREAT_DETECTED") {
      latest += 45;
    } else if (systemState.features.ips) {
      latest = Math.max(2, latest - 10);
    }
    chartData.push(latest);

    ctx.strokeStyle = systemState.threatLevel === "THREAT_DETECTED" ? 'var(--sec-red)' : 'var(--sec-green)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    
    const sliceWidth = canvas.width / (chartData.length - 1);
    for (let i = 0; i < chartData.length; i++) {
      const x = i * sliceWidth;
      const y = canvas.height - (chartData[i] / 80) * canvas.height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    ctx.fillStyle = systemState.threatLevel === "THREAT_DETECTED" 
      ? 'rgba(255, 59, 48, 0.08)' 
      : 'rgba(74, 246, 38, 0.08)';
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();
    
  }, 180);
}

function setupIDSFeed() {
  if (idsAttackInterval) clearInterval(idsAttackInterval);

  idsAttackInterval = setInterval(() => {
    const triggerChance = Math.random();
    if (triggerChance > 0.45) {
      const template = idsEventTemplates[Math.floor(Math.random() * idsEventTemplates.length)];
      
      let alertMsg = template.msg;
      let alertTag = template.tag;
      
      if (systemState.features.ips && template.tag === 'alert') {
        alertMsg = `[IPS BLOCKED] ${template.msg} from IP ${template.src}`;
        alertTag = 'info';
      } else {
        if (template.tag === 'alert') {
          if (!systemState.features.ufw && !systemState.features.ips) {
            systemState.threatLevel = "THREAT_DETECTED";
            updateSecurityShield();
          }
        }
      }

      const logList = document.getElementById('ids-logs-wrapper');
      if (logList) {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const row = document.createElement('div');
        row.className = 'ids-log-item';
        row.innerHTML = `
          <span class="ids-log-time">${time}</span>
          <span class="ids-log-tag ${alertTag}">${alertTag.toUpperCase()}</span>
          <span class="ids-log-msg">${alertMsg}</span>
        `;
        
        logList.insertBefore(row, logList.firstChild);
        if (logList.childElementCount > 40) {
          logList.removeChild(logList.lastChild);
        }

        if (alertTag === 'alert') {
          alertCount++;
          const alertCounter = document.getElementById('stats-total-alerts');
          if (alertCounter) alertCounter.textContent = alertCount;
        }
      }
    }
  }, 2200);
}

function toggleIPS() {
  systemState.features.ips = !systemState.features.ips;
  const btn = document.getElementById('ips-toggle-btn');
  if (btn) {
    if (systemState.features.ips) {
      btn.textContent = "IPS Active (Filtering)";
      btn.classList.add('sec-off');
      logAudit("IDS Shield Intrusion Prevention Module activated.");
    } else {
      btn.textContent = "Enable IPS Shield";
      btn.classList.remove('sec-off');
      logAudit("IDS Shield Intrusion Prevention Module deactivated.");
    }
  }

  const ipsToggle = document.getElementById('soc2-ips-toggle');
  if (ipsToggle) {
    ipsToggle.checked = systemState.features.ips;
  }

  if (systemState.features.ips && systemState.threatLevel === "THREAT_DETECTED") {
    systemState.threatLevel = "SECURE";
    updateSecurityShield();
  }
  syncComplianceDials();
}

function clearIDSLogs() {
  const logList = document.getElementById('ids-logs-wrapper');
  if (logList) logList.innerHTML = '';
}

// APP: AppArmor profiles
function toggleAppArmorProfile(appKey, checkbox) {
  systemState.apps[appKey].secured = checkbox.checked;
  const badge = document.getElementById(`aa-badge-${appKey}`);
  if (badge) {
    if (checkbox.checked) {
      badge.textContent = "ENFORCE";
      badge.className = "aa-badge enforce";
    } else {
      badge.textContent = "COMPLAIN / UNCONFINED";
      badge.className = "aa-badge complain";
    }
  }
  updateAppArmorStats();
  logAudit(`AppArmor configuration toggled for ${systemState.apps[appKey].name}. Action: ${checkbox.checked ? 'ENFORCED' : 'COMPLAIN'}`);
  updateSecurityShield();
  syncComplianceDials();
}

function enforceAllAppArmor() {
  Object.keys(systemState.apps).forEach(key => {
    systemState.apps[key].secured = true;
  });
  updateAppArmorUI();
  updateAppArmorStats();
  logAudit("AppArmor forced ENFORCE policy on all environment components.");
  updateSecurityShield();
  syncComplianceDials();
}

function updateAppArmorUI() {
  Object.keys(systemState.apps).forEach(key => {
    const app = systemState.apps[key];
    const badge = document.getElementById(`aa-badge-${key}`);
    const input = document.querySelector(`#window-apparmor input[onchange*="${key}"]`);
    
    if (badge) {
      if (app.secured) {
        badge.textContent = "ENFORCE";
        badge.className = "aa-badge enforce";
      } else {
        badge.textContent = "COMPLAIN / UNCONFINED";
        badge.className = "aa-badge complain";
      }
    }
    if (input) input.checked = app.secured;
  });
  updateAppArmorStats();
}

function updateAppArmorStats() {
  const enforcedCount = Object.values(systemState.apps).filter(a => a.secured).length;
  const enforceVal = document.getElementById('aa-enforcing-profiles');
  if (enforceVal) enforceVal.textContent = enforcedCount;
}

// APP: CIS Hardening scanning
function runCISAudit() {
  const loader = document.getElementById('cis-loader');
  const results = document.getElementById('cis-results-list');
  const dial = document.getElementById('cis-score-dial');
  
  if (!loader) return;
  loader.classList.remove('hidden');

  setTimeout(() => {
    loader.classList.add('hidden');
    
    const audits = [
      { code: "CIS 1.1.1", name: "Ensure Uncomplicated Firewall (UFW) is active", status: systemState.features.ufw },
      { code: "CIS 1.1.2", name: "Ensure AppArmor is enabled in kernel config", status: systemState.features.apparmor },
      { code: "CIS 1.1.3", name: "Ensure system audit daemon (auditd) is active", status: systemState.features.audit },
      { code: "CIS 1.1.4", name: "Verify SSH Logins restricted to SSH Keys", status: systemState.apps.ssh.secured },
      { code: "CIS 1.1.5", name: "Disable root access via remote SSH link", status: true },
      { code: "CIS 1.1.6", name: "Enforce password hashing algorithm to SHA-512", status: true },
      { code: "CIS 1.1.7", name: "Configure Reverse Path Filter verification in sysctl.conf", status: systemState.features.ufw }
    ];

    let passedCount = audits.filter(a => a.status).length;
    let percentage = Math.round((passedCount / audits.length) * 100);
    
    results.innerHTML = '';
    audits.forEach(audit => {
      const row = document.createElement('div');
      row.className = 'cis-item-row';
      row.innerHTML = `
        <div class="cis-item-left">
          <span class="cis-item-code">${audit.code}</span>
          <span class="cis-item-name">${audit.name}</span>
        </div>
        <span class="cis-item-status ${audit.status ? 'pass' : 'fail'}">${audit.status ? 'PASSED' : 'FAILED'}</span>
      `;
      results.appendChild(row);
    });

    dial.textContent = `${percentage}%`;
    dial.style.borderColor = percentage > 80 ? 'var(--sec-green)' : (percentage > 50 ? 'var(--sec-yellow)' : 'var(--sec-red)');
    dial.style.color = percentage > 80 ? 'var(--sec-green)' : (percentage > 50 ? 'var(--sec-yellow)' : 'var(--sec-red)');

    logAudit(`CIS Hardening audit scan complete. Systems compliance rated at: ${percentage}%`);
  }, 1200);
}

// APP: Cryptographic key vault
function toggleVaultAlgoDetails(val) {
  const keyLabel = document.getElementById('vault-key-label');
  const keyInput = document.getElementById('vault-key');
  if (val === 'kyber') {
    keyLabel.textContent = "Generated Lattice Keypair";
    keyInput.value = "Kyber-1024_lattice_pubkey_0x82A1B";
    keyInput.disabled = true;
  } else if (val === 'dilithium') {
    keyLabel.textContent = "ML-DSA Signatures Matrix Seed";
    keyInput.value = "Dilithium-5_matrix_seed_0xF890B2";
    keyInput.disabled = true;
  } else {
    keyLabel.textContent = "Secret Password / Key";
    keyInput.value = "";
    keyInput.disabled = false;
  }
}

function switchVaultTab(tabEl, tabId) {
  document.querySelectorAll('#window-vault .vault-tab').forEach(t => t.classList.remove('active'));
  tabEl.classList.add('active');

  document.getElementById('vault-panel-encrypt').classList.add('hidden');
  document.getElementById('vault-panel-decrypt').classList.add('hidden');
  document.getElementById(`vault-panel-${tabId}`).classList.remove('hidden');
}

function runVaultEncrypt() {
  const plaintext = document.getElementById('vault-plaintext').value;
  const key = document.getElementById('vault-key').value;
  const algo = document.getElementById('vault-algo').value;
  const outputPanel = document.getElementById('vault-ciphertext-output');

  if (!plaintext) {
    outputPanel.textContent = "Error: Input plaintext is required.";
    outputPanel.className = "vault-result-panel";
    return;
  }

  if (algo === 'aes' && !key) {
    outputPanel.textContent = "Error: Symmetrical key required for AES encoding.";
    outputPanel.className = "vault-result-panel";
    return;
  }

  let cipher = '';
  if (algo === 'aes') {
    const salt = btoa(key).slice(0, 6);
    cipher = `U2VjLU9T-AES256-${salt}-${btoa(plaintext)}`;
    outputPanel.className = "vault-result-panel active";
  } else if (algo === 'kyber') {
    // Post-Quantum Kyber-1024 simulation
    const seed = Math.floor(Math.random() * 899999) + 100000;
    const ct = btoa(plaintext).slice(0, 16);
    cipher = `[PQC-ML-KEM-1024] Lattice encapsulation active. 
Shared Secret Key: HASH-SHA3-256(0x9E2B...F8A0)
Ciphertext Block:
0x8C${seed}F2..${ct}..87BA2A==`;
    outputPanel.className = "vault-result-panel quantum-glow";
  } else if (algo === 'dilithium') {
    // Post-Quantum Dilithium-5 digital signature verification simulation
    const sig = btoa(`Dilithium-Sig-Verify-${plaintext}`).slice(0, 24);
    cipher = `[PQC-ML-DSA-5] Mathematical matrix signature seal generated.
Public Key Ref: Dilithium-5_matrix_seed_0xF890B2
Quantum-Proof Signature Block:
SIG_DILITHIUM5_0x${sig}..a9d2..==`;
    outputPanel.className = "vault-result-panel quantum-glow";
  } else {
    cipher = plaintext.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
    outputPanel.className = "vault-result-panel active";
  }

  outputPanel.textContent = cipher;
  logAudit(`Cryptographic payload generated using algorithm: ${algo.toUpperCase()}`);
}

function runVaultDecrypt() {
  const ciphertext = document.getElementById('vault-ciphertext-input').value;
  const key = document.getElementById('vault-key-decrypt').value;
  const algo = document.getElementById('vault-algo-decrypt').value;
  const outputPanel = document.getElementById('vault-plaintext-output');

  if (!ciphertext) {
    outputPanel.textContent = "Error: Ciphertext input required.";
    outputPanel.className = "vault-result-panel";
    return;
  }

  if (algo === 'aes' && !key) {
    outputPanel.textContent = "Error: Passkey required for AES decoding.";
    outputPanel.className = "vault-result-panel";
    return;
  }

  let plain = '';
  try {
    if (algo === 'aes') {
      const parts = ciphertext.split('-');
      if (parts[0] !== 'U2VjLU9T' || parts[1] !== 'AES256') {
        throw new Error("Invalid format");
      }
      
      const salt = btoa(key).slice(0, 6);
      if (parts[2] !== salt) {
        outputPanel.textContent = "Error: AES Decryption Failed. Key mismatch or integrity check failed.";
        outputPanel.className = "vault-result-panel";
        return;
      }
      plain = atob(parts[3]);
      outputPanel.className = "vault-result-panel active";
    } else if (algo === 'kyber') {
      if (!ciphertext.includes('[PQC-ML-KEM-1024]')) {
        outputPanel.textContent = "Error: Target is not a valid Kyber encapsulated block.";
        outputPanel.className = "vault-result-panel";
        return;
      }
      // Decode simulated ciphertext block
      const lines = ciphertext.split('\n');
      const ctLine = lines[lines.length - 1];
      const match = ctLine.match(/\.\.(.+)\.\./);
      if (match && match[1]) {
        plain = atob(match[1]);
      } else {
        plain = "Decrypted Shared Secret Key matches (Integrity Verified)";
      }
      outputPanel.className = "vault-result-panel quantum-glow";
    } else {
      plain = ciphertext.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26));
      outputPanel.className = "vault-result-panel active";
    }

    outputPanel.textContent = plain;
    logAudit(`Decryption query completed successfully for cipher payload.`);
  } catch (e) {
    outputPanel.textContent = "Error: Could not decode payload. Check algorithm details.";
    outputPanel.className = "vault-result-panel";
  }
}

// SOC 2 COMPLIANCE CENTER LOGIC
function calculateSOC2Score() {
  let score = 20;
  if (systemState.features.ufw) score += 20;
  if (systemState.features.apparmor) score += 20;
  if (systemState.soc2.mfa) score += 15;
  if (systemState.soc2.encryption) score += 15;
  if (systemState.soc2.backup) score += 10;
  return score;
}

function getSOC2Content() {
  const score = calculateSOC2Score();
  return `
    <div class="app-soc2-container">
      <div class="soc2-header">
        <div class="soc2-title-block">
          <h3>SOC 2 Trust Services Center</h3>
          <p>Audits administrative access protocols, system availability parameters, and confidentiality locks.</p>
        </div>
        <div class="soc2-score-dial">
          <div>
            <div class="soc2-dial-value" id="soc2-score-display">${score}%</div>
            <div class="soc2-dial-label">Criteria Readiness</div>
          </div>
        </div>
      </div>
      <div class="soc2-grid">
        <div class="soc2-card">
          <div class="soc2-card-header">
            <span class="soc2-card-id">CC6.1 (Access Control)</span>
            <span class="soc2-card-status ${systemState.soc2.mfa ? 'compliant' : 'non-compliant'}" id="soc2-status-mfa">${systemState.soc2.mfa ? 'COMPLIANT' : 'FAIL'}</span>
          </div>
          <span class="soc2-card-name">Multi-Factor Authentication</span>
          <span class="soc2-card-desc">Enforce multi-factor authentication (MFA) challenges for administrative shell logins.</span>
          <div class="soc2-action-area">
            <span class="soc2-toggle-label">Enforce admin MFA</span>
            <label class="aa-switch">
              <input type="checkbox" ${systemState.soc2.mfa ? 'checked' : ''} onchange="toggleSOC2Control('mfa', this)" aria-label="Enforce admin Multi-Factor Authentication">
              <span class="aa-slider"></span>
            </label>
          </div>
        </div>
        <div class="soc2-card">
          <div class="soc2-card-header">
            <span class="soc2-card-id">CC6.3 (Confidentiality)</span>
            <span class="soc2-card-status ${systemState.soc2.encryption ? 'compliant' : 'non-compliant'}" id="soc2-status-encryption">${systemState.soc2.encryption ? 'COMPLIANT' : 'FAIL'}</span>
          </div>
          <span class="soc2-card-name">Volume Encryption</span>
          <span class="soc2-card-desc">Enforce LUKS full-disk partition encryption to shield confidentiality at rest.</span>
          <div class="soc2-action-area">
            <span class="soc2-toggle-label">Enable LUKS encryption</span>
            <label class="aa-switch">
              <input type="checkbox" ${systemState.soc2.encryption ? 'checked' : ''} onchange="toggleSOC2Control('encryption', this)" aria-label="Enable LUKS volume encryption">
              <span class="aa-slider"></span>
            </label>
          </div>
        </div>
        <div class="soc2-card">
          <div class="soc2-card-header">
            <span class="soc2-card-id">CC2.1 (Availability)</span>
            <span class="soc2-card-status ${systemState.soc2.backup ? 'compliant' : 'non-compliant'}" id="soc2-status-backup">${systemState.soc2.backup ? 'COMPLIANT' : 'FAIL'}</span>
          </div>
          <span class="soc2-card-name">Redundant Backups</span>
          <span class="soc2-card-desc">Automate offsite daily incremental system snapshot transfers with integrity checks.</span>
          <div class="soc2-action-area">
            <span class="soc2-toggle-label">Activate offsite backups</span>
            <label class="aa-switch">
              <input type="checkbox" ${systemState.soc2.backup ? 'checked' : ''} onchange="toggleSOC2Control('backup', this)" aria-label="Activate offsite daily backup nodes">
              <span class="aa-slider"></span>
            </label>
          </div>
        </div>
        <div class="soc2-card">
          <div class="soc2-card-header">
            <span class="soc2-card-id">CC7.2 (Incident Response)</span>
            <span class="soc2-card-status ${systemState.features.ips ? 'compliant' : 'non-compliant'}" id="soc2-status-ips">${systemState.features.ips ? 'COMPLIANT' : 'FAIL'}</span>
          </div>
          <span class="soc2-card-name">Intrusion Prevention (IPS)</span>
          <span class="soc2-card-desc">Enable active Suricata/Snort network traffic drop rules for real-time risk mitigation.</span>
          <div class="soc2-action-area">
            <span class="soc2-toggle-label">IPS Shield active</span>
            <label class="aa-switch">
              <input type="checkbox" id="soc2-ips-toggle" ${systemState.features.ips ? 'checked' : ''} onchange="toggleSOC2IPSControl(this)" aria-label="IPS active mode status toggle">
              <span class="aa-slider"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="soc2-report-footer">
        <span>Current status: <strong>${score === 100 ? 'Audit Ready' : 'Hardening Required'}</strong></span>
        <button class="ids-btn" onclick="downloadSOC2Report()" aria-label="Generate Audit Readiness PDF">Generate Audit Readiness PDF</button>
      </div>
    </div>
  `;
}

function toggleSOC2Control(key, checkbox) {
  systemState.soc2[key] = checkbox.checked;
  const badge = document.getElementById(`soc2-status-${key}`);
  if (badge) {
    badge.textContent = checkbox.checked ? 'COMPLIANT' : 'FAIL';
    badge.className = `soc2-card-status ${checkbox.checked ? 'compliant' : 'non-compliant'}`;
  }
  logAudit(`SOC 2 security audit framework control update: '${key}' set to ${checkbox.checked ? 'COMPLIANT' : 'FAIL'}`);
  syncComplianceDials();
}

function toggleSOC2IPSControl(checkbox) {
  toggleIPS();
  const badge = document.getElementById('soc2-status-ips');
  if (badge) {
    badge.textContent = checkbox.checked ? 'COMPLIANT' : 'FAIL';
    badge.className = `soc2-card-status ${checkbox.checked ? 'compliant' : 'non-compliant'}`;
  }
}

function downloadSOC2Report() {
  const score = calculateSOC2Score();
  const reportText = `===========================================
Tomb OS 1.0 SOC 2 Readiness Report
Generated: ${new Date().toUTCString()}
Compliance Index: ${score}%
===========================================
- CC6.1 Multi-Factor Auth: ${systemState.soc2.mfa ? 'COMPLIANT' : 'NON-COMPLIANT'}
- CC6.3 Full Disk Encryption: ${systemState.soc2.encryption ? 'COMPLIANT' : 'NON-COMPLIANT'}
- CC2.1 Offsite Daily Backups: ${systemState.soc2.backup ? 'COMPLIANT' : 'NON-COMPLIANT'}
- CC7.2 Network Intrusion Shield: ${systemState.features.ips ? 'COMPLIANT' : 'NON-COMPLIANT'}
- UFW Packet Filter: ${systemState.features.ufw ? 'ACTIVE' : 'INACTIVE'}
- AppArmor MAC Containment: ${systemState.features.apparmor ? 'ACTIVE' : 'INACTIVE'}

Result: ${score === 100 ? 'COMPLIANT AUDIT COMPLETED' : 'REMEDIATION ACTIONS REQUIRED'}
===========================================`;

  const blob = new Blob([reportText], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'soc2_audit_readiness_report.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  logAudit("SOC 2 audit compliance packet downloaded by administrator.");
}

// GLOBAL REGULATORY COMPLIANCE LOGIC
function calculateGlobalComplianceScore() {
  let score = 10;
  if (systemState.globalcom.gdprForgotten) score += 20;
  if (systemState.features.audit) score += 15;
  if (systemState.globalcom.doNotSell) score += 15;
  if (systemState.features.ips) score += 10;
  if (systemState.globalcom.localResidency) score += 10;
  if (systemState.globalcom.piplAssessment) score += 10;
  if (systemState.globalcom.lgpdMapping) score += 10;
  return score;
}

function getGlobalComplianceContent() {
  return renderGlobalComplianceWrapper();
}

function renderGlobalComplianceWrapper() {
  const score = calculateGlobalComplianceScore();
  let content = '';
  
  if (systemState.globalcom.activeTab === 'eu') {
    content = `
      <div class="globalcom-intro-panel">
        <div class="globalcom-intro-text">
          <h3>GDPR - European Union</h3>
          <p>General Data Protection Regulation. Protects user privacy, data portability, and enforces rights of erasure.</p>
        </div>
      </div>
      <div class="globalcom-controls-list">
        <div class="globalcom-control-row">
          <div class="globalcom-control-info">
            <span class="globalcom-control-title">Right to Erasure (Article 17)</span>
            <span class="globalcom-control-desc">Implement a automated flow to purge sensitive user telemetry and logs on request.</span>
          </div>
          <label class="aa-switch">
            <input type="checkbox" ${systemState.globalcom.gdprForgotten ? 'checked' : ''} onchange="toggleGlobalControl('gdprForgotten', this)" aria-label="Toggle GDPR Right to Erasure">
            <span class="aa-slider"></span>
          </label>
        </div>
        <div class="globalcom-control-row">
          <div class="globalcom-control-info">
            <span class="globalcom-control-title">Data Minimization (Article 5)</span>
            <span class="globalcom-control-desc">Restrict default log retention bounds for network requests to 30 days.</span>
          </div>
          <label class="aa-switch">
            <input type="checkbox" ${systemState.features.audit ? 'checked' : ''} onchange="toggleGlobalAuditSync(this)" aria-label="Toggle GDPR Data Minimization logs">
            <span class="aa-slider"></span>
          </label>
        </div>
      </div>
    `;
  } else if (systemState.globalcom.activeTab === 'us') {
    content = `
      <div class="globalcom-intro-panel">
        <div class="globalcom-intro-text">
          <h3>CCPA / CPRA - United States (California)</h3>
          <p>California Consumer Privacy Act. Gives users rights to opt-out of data sale, sharing, and commercial monetization.</p>
        </div>
      </div>
      <div class="globalcom-controls-list">
        <div class="globalcom-control-row">
          <div class="globalcom-control-info">
            <span class="globalcom-control-title">Do Not Sell My Personal Info</span>
            <span class="globalcom-control-desc">Inject headers into outbound HTTP queries blocking backend analytics tracking.</span>
          </div>
          <label class="aa-switch">
            <input type="checkbox" ${systemState.globalcom.doNotSell ? 'checked' : ''} onchange="toggleGlobalControl('doNotSell', this)" aria-label="Toggle Do Not Sell California Personal Info">
            <span class="aa-slider"></span>
          </label>
        </div>
      </div>
    `;
  } else if (systemState.globalcom.activeTab === 'ca') {
    content = `
      <div class="globalcom-intro-panel">
        <div class="globalcom-intro-text">
          <h3>PIPEDA - Canada</h3>
          <p>Personal Information Protection and Electronic Documents Act. Governs how private-sector organizations collect data.</p>
        </div>
      </div>
      <div class="globalcom-controls-list">
        <div class="globalcom-control-row">
          <div class="globalcom-control-info">
            <span class="globalcom-control-title">Breach Notification Automation</span>
            <span class="globalcom-control-desc">Integrate fail-safe alerts that report IDS incident alerts to the compliance coordinator.</span>
          </div>
          <label class="aa-switch">
            <input type="checkbox" ${systemState.features.ips ? 'checked' : ''} onchange="toggleGlobalIPSSync(this)" aria-label="Toggle Breach Notification Automation">
            <span class="aa-slider"></span>
          </label>
        </div>
      </div>
    `;
  } else if (systemState.globalcom.activeTab === 'in') {
    content = `
      <div class="globalcom-intro-panel">
        <div class="globalcom-intro-text">
          <h3>DPDP - India</h3>
          <p>Digital Personal Data Protection Act. Mandates strict localization of data residency and processing criteria.</p>
        </div>
      </div>
      <div class="globalcom-controls-list">
        <div class="globalcom-control-row">
          <div class="globalcom-control-info">
            <span class="globalcom-control-title">Localized Data Residency</span>
            <span class="globalcom-control-desc">Enforce network iptables rules routing simulated cloud queries to regional host nodes.</span>
          </div>
          <label class="aa-switch">
            <input type="checkbox" ${systemState.globalcom.localResidency ? 'checked' : ''} onchange="toggleGlobalControl('localResidency', this)" aria-label="Toggle Localized Data Residency under DPDP">
            <span class="aa-slider"></span>
          </label>
        </div>
      </div>
    `;
  } else if (systemState.globalcom.activeTab === 'cn') {
    content = `
      <div class="globalcom-intro-panel">
        <div class="globalcom-intro-text">
          <h3>PIPL - China</h3>
          <p>Personal Information Protection Law. Oversees algorithmic recommendation restrictions and security assessments.</p>
        </div>
      </div>
      <div class="globalcom-controls-list">
        <div class="globalcom-control-row">
          <div class="globalcom-control-info">
            <span class="globalcom-control-title">Algorithmic Recommendation Filter</span>
            <span class="globalcom-control-desc">Inject strict content filtering templates into the sandboxed Web Browser profile.</span>
          </div>
          <label class="aa-switch">
            <input type="checkbox" ${systemState.globalcom.piplAssessment ? 'checked' : ''} onchange="toggleGlobalControl('piplAssessment', this)" aria-label="Toggle Algorithmic Recommendation filtering under PIPL">
            <span class="aa-slider"></span>
          </label>
        </div>
      </div>
    `;
  } else if (systemState.globalcom.activeTab === 'br') {
    content = `
      <div class="globalcom-intro-panel">
        <div class="globalcom-intro-text">
          <h3>LGPD - Brazil</h3>
          <p>Lei Geral de Proteção de Dados. Regulates personal data processing, requiring a defined legal basis registry.</p>
        </div>
      </div>
      <div class="globalcom-controls-list">
        <div class="globalcom-control-row">
          <div class="globalcom-control-info">
            <span class="globalcom-control-title">DPO Legal Processing Registry</span>
            <span class="globalcom-control-desc">Generate auditd mappings registering processing activities to valid legal bases.</span>
          </div>
          <label class="aa-switch">
            <input type="checkbox" ${systemState.globalcom.lgpdMapping ? 'checked' : ''} onchange="toggleGlobalControl('lgpdMapping', this)" aria-label="Toggle LGPD Legal Processing Registry mappings">
            <span class="aa-slider"></span>
          </label>
        </div>
      </div>
    `;
  }

  return `
    <div class="app-globalcom-container">
      <div class="globalcom-sidebar">
        <span class="globalcom-sidebar-title">Jurisdictions</span>
        <div class="globalcom-tab ${systemState.globalcom.activeTab === 'eu' ? 'active' : ''}" onclick="switchGlobalTab('eu')">
          <span>EU (GDPR)</span>
          <span class="globalcom-tab-status ${systemState.globalcom.gdprForgotten && systemState.features.audit ? 'pass' : 'fail'}"></span>
        </div>
        <div class="globalcom-tab ${systemState.globalcom.activeTab === 'us' ? 'active' : ''}" onclick="switchGlobalTab('us')">
          <span>USA (CCPA)</span>
          <span class="globalcom-tab-status ${systemState.globalcom.doNotSell ? 'pass' : 'fail'}"></span>
        </div>
        <div class="globalcom-tab ${systemState.globalcom.activeTab === 'ca' ? 'active' : ''}" onclick="switchGlobalTab('ca')">
          <span>Canada (PIPEDA)</span>
          <span class="globalcom-tab-status ${systemState.features.ips ? 'pass' : 'fail'}"></span>
        </div>
        <div class="globalcom-tab ${systemState.globalcom.activeTab === 'in' ? 'active' : ''}" onclick="switchGlobalTab('in')">
          <span>India (DPDP)</span>
          <span class="globalcom-tab-status ${systemState.globalcom.localResidency ? 'pass' : 'fail'}"></span>
        </div>
        <div class="globalcom-tab ${systemState.globalcom.activeTab === 'cn' ? 'active' : ''}" onclick="switchGlobalTab('cn')">
          <span>China (PIPL)</span>
          <span class="globalcom-tab-status ${systemState.globalcom.piplAssessment ? 'pass' : 'fail'}"></span>
        </div>
        <div class="globalcom-tab ${systemState.globalcom.activeTab === 'br' ? 'active' : ''}" onclick="switchGlobalTab('br')">
          <span>Brazil (LGPD)</span>
          <span class="globalcom-tab-status ${systemState.globalcom.lgpdMapping ? 'pass' : 'fail'}"></span>
        </div>
      </div>
      <div class="globalcom-content">
        <div class="globalcom-intro-panel">
          <div class="globalcom-intro-text">
            <h3>Global Compliance Score</h3>
            <p>Weighted readiness ratio across all active global data protection jurisdictions.</p>
          </div>
          <div class="globalcom-score-dial">
            <span class="globalcom-score-val" style="color: ${score > 80 ? 'var(--sec-green)' : (score > 50 ? 'var(--sec-yellow)' : 'var(--sec-red)')}">${score}%</span>
          </div>
        </div>
        
        <div id="globalcom-tab-content">
          ${content}
        </div>
        
        <div class="globalcom-compliance-logs" id="globalcom-logs">
          <div class="globalcom-log-line success">[INIT] Regional data controller compliance listener active.</div>
        </div>
      </div>
    </div>
  `;
}

function switchGlobalTab(tabId) {
  systemState.globalcom.activeTab = tabId;
  const win = document.getElementById('window-globalcom');
  if (win) {
    const contentArea = win.querySelector('.window-content');
    if (contentArea) {
      contentArea.innerHTML = renderGlobalComplianceWrapper();
    }
  }
}

function toggleGlobalControl(key, checkbox) {
  systemState.globalcom[key] = checkbox.checked;
  logAudit(`Global compliance protocol update for '${key}' set to ${checkbox.checked ? 'ENABLED' : 'DISABLED'}`);
  
  const logs = document.getElementById('globalcom-logs');
  if (logs) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const line = document.createElement('div');
    line.className = checkbox.checked ? 'globalcom-log-line success' : 'globalcom-log-line warning';
    line.textContent = `[${time}] Regulatory control '${key}' ${checkbox.checked ? 'Enabled' : 'Disabled'} and applied.`;
    logs.appendChild(line);
    logs.scrollTop = logs.scrollHeight;
  }
  
  syncComplianceDials();
  const activeTab = systemState.globalcom.activeTab;
  switchGlobalTab(activeTab);
}

function toggleGlobalAuditSync(checkbox) {
  toggleSecurityFeature('audit');
  toggleGlobalControl('audit_sync', checkbox);
}

function toggleGlobalIPSSync(checkbox) {
  toggleIPS();
  toggleGlobalControl('ips_sync', checkbox);
}


// ULTIMATE SECURITY HARDENING LOGIC
function calculateUltimateScore() {
  let score = 0;
  if (systemState.ultimate.sel4) score += 25;
  if (systemState.ultimate.tpm) score += 25;
  if (systemState.ultimate.immutable) score += 25;
  if (systemState.ultimate.zerotrust) score += 25;
  return score;
}

function getUltimateContent() {
  return renderUltimateWrapper();
}

function renderUltimateWrapper() {
  const score = calculateUltimateScore();
  return `
    <div class="app-ultimate-container">
      <div class="ultimate-header">
        <div class="ultimate-title-block">
          <h3>Ultimate Hardening Center</h3>
          <p>Configure mathematically proven microkernels, read-only system structures, and hardware attestation locks.</p>
        </div>
        <div class="ultimate-badge-panel">
          <div>
            <div class="ultimate-badge-val" id="ultimate-score-display" style="color: ${score > 90 ? 'var(--sec-green)' : (score > 50 ? 'var(--sec-yellow)' : 'var(--sec-red)')}">${score}%</div>
            <div class="ultimate-badge-lbl">Ultimate Protection</div>
          </div>
        </div>
      </div>
      <div class="ultimate-grid">
        <div class="ultimate-card">
          <div class="ultimate-card-header">
            <span class="ultimate-card-tag">MICROKERNEL</span>
            <span class="ultimate-card-status ${systemState.ultimate.sel4 ? 'enforced' : 'inactive'}" id="ultimate-status-sel4">${systemState.ultimate.sel4 ? 'FORMALLY VERIFIED' : 'STANDARD KERNEL'}</span>
          </div>
          <span class="ultimate-card-title">seL4 Math Proof Containment</span>
          <span class="ultimate-card-desc">Enforce compile-time mathematical proofs certifying absolute isolation between drivers and system cores.</span>
          <div class="ultimate-card-action">
            <span class="ultimate-action-lbl">Run seL4 Kernel</span>
            <label class="aa-switch">
              <input type="checkbox" ${systemState.ultimate.sel4 ? 'checked' : ''} onchange="toggleUltimateControl('sel4', this)" aria-label="Enforce seL4 Formally Verified Microkernel">
              <span class="aa-slider"></span>
            </label>
          </div>
        </div>
        <div class="ultimate-card">
          <div class="ultimate-card-header">
            <span class="ultimate-card-tag">PHYSICAL</span>
            <span class="ultimate-card-status ${systemState.ultimate.tpm ? 'enforced' : 'inactive'}" id="ultimate-status-tpm">${systemState.ultimate.tpm ? 'ATTESTATION ACTIVE' : 'UNSECURED MEMORY'}</span>
          </div>
          <span class="ultimate-card-title">TPM 2.0 & Enclave Shield</span>
          <span class="ultimate-card-desc">Cryptographically lock critical credentials to hardware TPM chips and virtualize RAM using Secure Enclaves.</span>
          <div class="ultimate-card-action">
            <span class="ultimate-action-lbl">Lock TPM keyrings</span>
            <label class="aa-switch">
              <input type="checkbox" ${systemState.ultimate.tpm ? 'checked' : ''} onchange="toggleUltimateControl('tpm', this)" aria-label="Activate TPM 2.0 and Secure Enclave">
              <span class="aa-slider"></span>
            </label>
          </div>
        </div>
        <div class="ultimate-card">
          <div class="ultimate-card-header">
            <span class="ultimate-card-tag">FILESYSTEM</span>
            <span class="ultimate-card-status ${systemState.ultimate.immutable ? 'enforced' : 'inactive'}" id="ultimate-status-immutable">${systemState.ultimate.immutable ? 'READONLY SYSTEM' : 'WRITABLE OVERLAY'}</span>
          </div>
          <span class="ultimate-card-title">Immutable Core File System</span>
          <span class="ultimate-card-desc">Mount system binary directories (/bin, /sbin, /lib) as read-only. Block all runtime root write calls.</span>
          <div class="ultimate-card-action">
            <span class="ultimate-action-lbl">Enable Immutability</span>
            <label class="aa-switch">
              <input type="checkbox" ${systemState.ultimate.immutable ? 'checked' : ''} onchange="toggleUltimateControl('immutable', this)" aria-label="Enable Immutable Core System overlay">
              <span class="aa-slider"></span>
            </label>
          </div>
        </div>
        <div class="ultimate-card">
          <div class="ultimate-card-header">
            <span class="ultimate-card-tag">ZTNA</span>
            <span class="ultimate-card-status ${systemState.ultimate.zerotrust ? 'enforced' : 'inactive'}" id="ultimate-status-zerotrust">${systemState.ultimate.zerotrust ? 'ZERO TRUST ACTIVE' : 'OPEN COMMS'}</span>
          </div>
          <span class="ultimate-card-title">Zero Trust Micro-Segmentation</span>
          <span class="ultimate-card-desc">Enforce continuous authentication between internal subsystems. Require signed tokens for API requests.</span>
          <div class="ultimate-card-action">
            <span class="ultimate-action-lbl">Enforce Zero Trust</span>
            <label class="aa-switch">
              <input type="checkbox" ${systemState.ultimate.zerotrust ? 'checked' : ''} onchange="toggleUltimateControl('zerotrust', this)" aria-label="Enforce continuous Zero Trust validation">
              <span class="aa-slider"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="ultimate-interactive-logs" id="ultimate-logs">
        <div class="ultimate-log-row info">[SECURE ENGINE] Monitoring advanced containment vectors...</div>
      </div>
    </div>
  `;
}

function toggleUltimateControl(key, checkbox) {
  systemState.ultimate[key] = checkbox.checked;
  
  const statusBadge = document.getElementById(`ultimate-status-${key}`);
  if (statusBadge) {
    if (key === 'sel4') {
      statusBadge.textContent = checkbox.checked ? 'FORMALLY VERIFIED' : 'STANDARD KERNEL';
    } else if (key === 'tpm') {
      statusBadge.textContent = checkbox.checked ? 'ATTESTATION ACTIVE' : 'UNSECURED MEMORY';
    } else if (key === 'immutable') {
      statusBadge.textContent = checkbox.checked ? 'READONLY SYSTEM' : 'WRITABLE OVERLAY';
    } else if (key === 'zerotrust') {
      statusBadge.textContent = checkbox.checked ? 'ZERO TRUST ACTIVE' : 'OPEN COMMS';
    }
    statusBadge.className = `ultimate-card-status ${checkbox.checked ? 'enforced' : 'inactive'}`;
  }

  logAudit(`Ultimate security control update: '${key}' set to ${checkbox.checked ? 'ENABLED' : 'DISABLED'}`);
  
  const logs = document.getElementById('ultimate-logs');
  if (logs) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const row = document.createElement('div');
    row.className = checkbox.checked ? 'ultimate-log-row verified' : 'ultimate-log-row alert';
    
    let msg = '';
    if (key === 'sel4') {
      msg = checkbox.checked 
        ? `[seL4 Verification Engine] Executed mathematical proofs. 0 buffer overflows or memory leaks possible in core kernel threads.` 
        : `[seL4 Warning] Switched to standard monolithic kernel. Mathematical isolation guarantees disabled.`;
    } else if (key === 'tpm') {
      msg = checkbox.checked 
        ? `[TPM 2.0 / Secure Enclave] Encrypted RAM sectors. Secure Enclave (Intel SGX / AMD SEV) is shielding memory buffers from root/hypervisor snooping.`
        : `[TPM/Enclave warning] Memory keys cleared. System RAM is raw-writable.`;
    } else if (key === 'immutable') {
      msg = checkbox.checked 
        ? `[Immutable Filesystem] Mounted /bin, /lib, /sbin read-only. File system write overlay locked.`
        : `[Immutable Filesystem warning] Writable filesystem mounted. Root overlay unlocked.`;
    } else if (key === 'zerotrust') {
      msg = checkbox.checked 
        ? `[Zero Trust Access] SUB-SYSTEM SEGMENTATION ENFORCED. App-to-app communications require SHA-256 micro-token signatures.`
        : `[Zero Trust warning] SUB-SYSTEM SEGMENTATION DISABLED. Open inter-process communication allowed.`;
    }
    
    row.textContent = `[${time}] ${msg}`;
    logs.appendChild(row);
    logs.scrollTop = logs.scrollHeight;
  }

  syncComplianceDials();
}


// INTERACTIVE ONBOARDING TOUR
const tourSteps = [
  {
    title: "Step 1: CIS Hardening Auditor",
    body: "Start by checking the system security score. Open the **CIS Auditor** app (square shield checklist icon in the left dock) and click **Run Security Compliance Audit**.",
    highlight: "cis"
  },
  {
    title: "Step 2: AppArmor Sandboxing",
    body: "A key control is process isolation. Open the **AppArmor Control Center** (profile shield icon) and toggle the switches to put applications in **Enforce Sandbox** mode.",
    highlight: "apparmor"
  },
  {
    title: "Step 3: Hardened Terminal Suggestions",
    body: "For users of all skill levels, the **Hardened Terminal** (green prompt icon) has **Quick Command Chips** at the bottom. Simply click on `ufw status` to run it instantly without typing!",
    highlight: "terminal"
  },
  {
    title: "Step 4: SOC 2 Auditor Center",
    body: "Compliance centers simplify operations. Open the **SOC 2 Auditor** (plus folder icon) to toggle access controls (MFA), volume encryption, and generate a signed report packet.",
    highlight: "soc2"
  },
  {
    title: "Step 5: Global Compliance Hub",
    body: "To satisfy regional laws, open the **Global Compliance Hub** (earth icon) and toggle rules for GDPR (Europe), CCPA (USA), and DPDP (India) to reach 100% compliance.",
    highlight: "globalcom"
  },
  {
    title: "Step 6: Ultimate Hardening Core",
    body: "To build the absolute most secure OS possible, open the **Ultimate Hardening** app (shield with user icon). Toggle **seL4 Verification** to mathematically prove the microkernel, and enable **Immutable Core** to make filesystems read-only.",
    highlight: "ultimate"
  }
];

function startTour() {
  systemState.tour.step = 0;
  systemState.tour.active = true;
  
  const overlay = document.getElementById('tour-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    updateTourStepUI();
  }
  logAudit("Interactive onboarding accessibility tour started.");
}

function closeTour() {
  systemState.tour.active = false;
  const overlay = document.getElementById('tour-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
  document.querySelectorAll('.dock-item').forEach(el => el.classList.remove('tour-highlight'));
  logAudit("Interactive onboarding accessibility tour closed.");
}

function nextTourStep() {
  if (systemState.tour.step < tourSteps.length - 1) {
    systemState.tour.step++;
    updateTourStepUI();
  } else {
    closeTour();
  }
}

function prevTourStep() {
  if (systemState.tour.step > 0) {
    systemState.tour.step--;
    updateTourStepUI();
  }
}

function updateTourStepUI() {
  const step = tourSteps[systemState.tour.step];
  
  document.getElementById('tour-title').textContent = step.title;
  document.getElementById('tour-body').innerHTML = step.body;
  document.getElementById('tour-step-indicator').textContent = `Step ${systemState.tour.step + 1} of ${tourSteps.length}`;
  
  document.querySelectorAll('.dock-item').forEach(el => el.classList.remove('tour-highlight'));
  
  const targetDock = document.querySelector(`.dock-item[data-app="${step.highlight}"]`);
  if (targetDock) {
    targetDock.classList.add('tour-highlight');
    
    const tourCard = document.querySelector('.tour-card');
    const rect = targetDock.getBoundingClientRect();
    
    tourCard.style.left = `${rect.right + 15}px`;
    tourCard.style.top = `${rect.top - 20}px`;
  }

  const nextBtn = document.getElementById('tour-next-btn');
  if (nextBtn) {
    nextBtn.textContent = systemState.tour.step === tourSteps.length - 1 ? "Finish Tour" : "Next Step";
  }
}

// OS Control Actions
function triggerOSAction(action) {
  if (action === 'restart') {
    location.reload();
  } else if (action === 'shutdown') {
    document.getElementById('desktop-wrapper').classList.add('hidden');
    document.body.innerHTML = `
      <div style="background:#000; width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#555; font-family:var(--font-mono); font-size:14px;">
        <span style="color:#dfdbd2; margin-bottom:10px;">[  OK  ] Deactivated target Local Security Services.</span>
        <span style="color:#dfdbd2; margin-bottom:10px;">[  OK  ] Stopped AppArmor MAC system framework.</span>
        <span style="color:#dfdbd2; margin-bottom:20px;">[  OK  ] Reached target System Power Off.</span>
        <h2 style="color:#fff; font-family:var(--font-ui); font-size:20px; font-weight:400;">Power Off. You can close this tab now.</h2>
      </div>
    `;
  }
}
