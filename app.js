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
    zerotrust: false,
    sdcardMode: false
  },
  tour: {
    step: 0,
    active: false
  },
  render: {
    isPlaying: false,
    playProgress: 0,
    isRendering: false,
    renderProgress: 0,
    activeScene: "Scene 1: System Boot & Kernel Audits",
    intervalId: null
  },
  teacher: {
    activeTab: 'translator',
    rules: [
      "When firewall blocks an IP, log target to IDS console.",
      "Always restrict USB driver loading on system VMs."
    ],
    translations: []
  },
  hypervisor: {
    zones: {
      terminal: 'work',
      ids: 'work',
      apparmor: 'secure',
      cis: 'secure',
      soc2: 'secure',
      globalcom: 'secure',
      vault: 'personal',
      ultimate: 'secure',
      readme: 'personal',
      hypervisor: 'secure',
      render: 'work',
      teacher: 'secure'
    },
    rules: {
      interAppDnd: true,
      crossCopy: true,
      vaultExport: true
    },
    logs: [
      "Xen hypervisor v4.17 initialized.",
      "Domain-0 control panel loaded.",
      "Security isolation policy loaded: App containment strict."
    ],
    pendingAction: null
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
  
  // Cross-system security framework logic integration
  if (!ufwActive && systemState.features.ips) {
    addHypervisorLog("FIREWALL_OFF: Enforcing local VM-level egress limits to compensate for disabled UFW.");
  }
  
  if (!aaActive && systemState.ultimate.sel4) {
    logAudit("[seL4 core] System protection downgraded: AppArmor sandboxing is inactive. Mathematical formal proofs compromised.");
  }
  
  if (!auditActive) {
    logAudit("[WARNING] Audit logging daemon is stopped. Administrative compliance integrity lost.");
  }
  
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
  const hash = generateInteractionHash();
  auditLogs.push(`${timeStr} tomb-os admin-events: ${message} | INTEGRITY_KEY: [${hash}]`);
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
          <div class="terminal-chip-label">Quick Commands:</div>
          <button class="terminal-chip" onclick="runTerminalChipCommand('ufw status')">ufw status</button>
          <button class="terminal-chip" onclick="runTerminalChipCommand('aa-status')">aa-status</button>
          <button class="terminal-chip" onclick="runTerminalChipCommand('fail2ban-client status')">fail2ban status</button>
          <button class="terminal-chip" onclick="runTerminalChipCommand('auditd')">auditd</button>
          <button class="terminal-chip" onclick="runTerminalChipCommand('sysctl -a')">sysctl -a</button>
          <button class="terminal-chip" onclick="runTerminalChipCommand('help')">help</button>
          <button class="terminal-chip" style="background: rgba(255, 204, 0, 0.15); border-color: var(--sec-yellow);" onclick="pasteTerminalFromVMClipboard()">Paste VM Clipboard</button>
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
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label style="margin: 0;">Ciphertext Result</label>
              <button class="vault-btn-action" style="font-size: 10px; padding: 2px 6px; background: rgba(0, 122, 255, 0.2); border: 1px solid #007AFF; margin: 0; width: auto;" onclick="copyVaultToVMClipboard()">Copy to VM Clipboard</button>
            </div>
            <div class="vault-result-panel" id="vault-ciphertext-output">Payload will appear here...</div>
          </div>
        </div>

        <div class="vault-body hidden" id="vault-panel-decrypt">
          <div class="vault-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label for="vault-ciphertext-input" style="margin: 0;">Ciphertext Payload</label>
              <button class="vault-btn-action" style="font-size: 10px; padding: 2px 6px; background: rgba(0, 122, 255, 0.2); border: 1px solid #007AFF; margin: 0; width: auto;" onclick="pasteVaultFromVMClipboard()">Paste from VM Clipboard</button>
            </div>
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
  },
  hypervisor: {
    title: "Tomb Hypervisor VM Manager",
    width: 650,
    height: 460,
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="#E95420" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    getContent: () => getHypervisorContent()
  },
  render: {
    title: "Tomb Render (Video Production Studio)",
    width: 700,
    height: 520,
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="#E95420"/></svg>`,
    getContent: () => getRenderContent()
  },
  teacher: {
    title: "Tomb AI Teacher & Translator Hub",
    width: 650,
    height: 500,
    icon: `<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.83 0-1.5-.67-1.5-1.5S11.17 14 12 14s1.5.67 1.5 1.5S12.83 17 12 17zm1-5.5h-2v-4h2v4z" fill="#E95420"/></svg>`,
    getContent: () => getTeacherContent()
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
  
  // Qubes zone styling setup
  const currentZone = systemState.hypervisor.zones[appId] || 'personal';
  win.className = `os-window active zone-${currentZone}`;
  
  const desktopWidth = document.getElementById('desktop').clientWidth;
  const desktopHeight = document.getElementById('desktop').clientHeight;
  const left = Math.max(80, (desktopWidth - config.width) / 2 + (systemState.windowCount * 20) % 100);
  const top = Math.max(40, (desktopHeight - config.height) / 2 + (systemState.windowCount * 20) % 100);
  
  win.style.width = `${config.width}px`;
  win.style.height = `${config.height}px`;
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
  
  win.innerHTML = `
    <div class="window-titlebar" onmousedown="dragStart(event, '${appId}')" ontouchstart="dragStart(event, '${appId}')" ondblclick="maximizeWindow('${appId}')">
      <div class="window-title">
        <span class="window-title-icon">${config.icon}</span>
        <span>${config.title}</span>
        <select class="window-zone-select sel-${currentZone}" onchange="changeWindowZone('${appId}', this)" onmousedown="event.stopPropagation()" ontouchstart="event.stopPropagation()">
          <option value="untrusted" ${currentZone === 'untrusted' ? 'selected' : ''}>[Red] Untrusted</option>
          <option value="work" ${currentZone === 'work' ? 'selected' : ''}>[Yellow] Work</option>
          <option value="personal" ${currentZone === 'personal' ? 'selected' : ''}>[Blue] Personal</option>
          <option value="secure" ${currentZone === 'secure' ? 'selected' : ''}>[Green] Secure System</option>
        </select>
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
  win.addEventListener('touchstart', () => focusWindow(win));
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
  
  if (appId === 'render') {
    resetRenderPlay();
  }
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

// Drag & Drop (Touch and Mouse compatible)
let dragElement = null;
let dragX = 0;
let dragY = 0;

function dragStart(e, appId) {
  const win = document.getElementById(`window-${appId}`);
  if (win.classList.contains('maximized')) return;

  focusWindow(win);
  dragElement = win;
  
  const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
  
  dragX = clientX - win.offsetLeft;
  dragY = clientY - win.offsetTop;

  if (e.type === 'touchstart') {
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('touchend', dragEnd);
  } else {
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
  }
}

function dragMove(e) {
  if (!dragElement) return;
  const desktopWidth = document.getElementById('desktop').clientWidth;
  const desktopHeight = document.getElementById('desktop').clientHeight;
  
  const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
  
  let left = clientX - dragX;
  let top = clientY - dragY;
  
  left = Math.max(58, Math.min(left, desktopWidth - 100));
  top = Math.max(28, Math.min(top, desktopHeight - 40));

  dragElement.style.left = `${left}px`;
  dragElement.style.top = `${top}px`;
  
  if (e.cancelable) {
    e.preventDefault(); // Prevent scrolling the browser window while dragging
  }
}

function dragEnd() {
  dragElement = null;
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', dragEnd);
  document.removeEventListener('touchmove', dragMove);
  document.removeEventListener('touchend', dragEnd);
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
    
    const runCmd = () => {
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
    };

    const args = rawVal.split(' ');
    const cmd = args[0].toLowerCase();
    const isSensitive = ['ufw', 'aa-enforce', 'auditd', 'fail2ban-client', 'gpg'].includes(cmd);

    if (isSensitive) {
      interceptAction(
        'terminal',
        cmd === 'gpg' ? 'vault' : 'ultimate',
        `run_command_${cmd}`,
        runCmd,
        () => {
          history.innerHTML += `<div class="terminal-line error">[XEN BLOCK] Hypervisor interdiction: Permission denied. Command execution blocked.</div>`;
          const terminalContainer = input.parentElement.parentElement;
          terminalContainer.scrollTop = terminalContainer.scrollHeight;
        }
      );
    } else {
      runCmd();
    }
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

function triggerIntegratedDefense(event) {
  // Fail2Ban detects high-risk alerts and acts
  if (systemState.features.fail2ban && event.tag === 'alert') {
    if (!systemState.blockedIPs.includes(event.src) && event.src !== 'localhost') {
      systemState.blockedIPs.push(event.src);
      
      logAudit(`[Fail2Ban IPS] Intercepted signature '${event.type}' from IP: ${event.src}. Adding host to blacklist.`);
      addHypervisorLog(`IPS BAN: Fail2Ban blocked malicious IP ${event.src} on ports 22, 80, 443`);
      
      // If UFW is active, sync the block rule directly to UFW logs!
      if (systemState.features.ufw) {
        logAudit(`[UFW Firewall] Loaded active REJECT packet filter rule for banned IP: ${event.src}`);
      }
    }
  }

  // AppArmor sandbox violations logged to auditd
  if (systemState.features.apparmor && event.type === 'MAC Policy') {
    logAudit(`[AppArmor sandbox violation] Blocked unauthorized resource query by chromium-browser`);
    addHypervisorLog(`MAC AUDIT: AppArmor blocked Chromium browser accessing secure directory '/etc/shadow'`);
  }
}

function setupIDSFeed() {
  if (idsAttackInterval) clearInterval(idsAttackInterval);

  idsAttackInterval = setInterval(() => {
    const triggerChance = Math.random();
    if (triggerChance > 0.45) {
      const template = idsEventTemplates[Math.floor(Math.random() * idsEventTemplates.length)];
      
      let alertMsg = template.msg;
      let alertTag = template.tag;
      
      // Invoke integrated defense framework bridge
      triggerIntegratedDefense(template);
      
      // Translate incoming system messages dynamically
      if (template.tag === 'alert' || template.tag === 'warn') {
        if (typeof translateIncomingMessage === 'function') {
          translateIncomingMessage(template);
        }
      }
      
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

  interceptAction(
    'vault',
    'ultimate',
    `seal_crypt_payload_${algo.toUpperCase()}`,
    () => {
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
    },
    () => {
      outputPanel.textContent = "[XEN BLOCK] Hypervisor interdiction: Encryption action denied.";
      outputPanel.className = "vault-result-panel";
    }
  );
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

  interceptAction(
    'vault',
    'ultimate',
    `unseal_crypt_payload_${algo.toUpperCase()}`,
    () => {
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
    },
    () => {
      outputPanel.textContent = "[XEN BLOCK] Hypervisor interdiction: Decryption action denied.";
      outputPanel.className = "vault-result-panel";
    }
  );
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
        <div class="ultimate-card">
          <div class="ultimate-card-header">
            <span class="ultimate-card-tag">SD-CARD</span>
            <span class="ultimate-card-status ${systemState.ultimate.sdcardMode ? 'enforced' : 'inactive'}" id="ultimate-status-sdcardMode">${systemState.ultimate.sdcardMode ? 'LIVE SD BOOT' : 'HARD DRIVE BOOT'}</span>
          </div>
          <span class="ultimate-card-title">Live SD Card Storage Containment</span>
          <span class="ultimate-card-desc">Lock and run all operating system components directly from external SD card media. Zero write-caching to main disks.</span>
          <div class="ultimate-card-action">
            <span class="ultimate-action-lbl">Run from Live SD Card</span>
            <label class="aa-switch">
              <input type="checkbox" ${systemState.ultimate.sdcardMode ? 'checked' : ''} onchange="toggleUltimateControl('sdcardMode', this)" aria-label="Activate SD Card Live boot containment">
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
    } else if (key === 'sdcardMode') {
      statusBadge.textContent = checkbox.checked ? 'LIVE SD BOOT' : 'HARD DRIVE BOOT';
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
    } else if (key === 'sdcardMode') {
      msg = checkbox.checked
        ? `[Live SD Boot] Isolated systems storage containment active on block /dev/sdb1. Zero disk caching enabled.`
        : `[Live SD Boot Warning] Storage shifted back to internal monolithic hard disk. Live containment disabled.`;
    }
    
    const hash = generateInteractionHash();
    row.textContent = `[${time}] ${msg} | Verification Key: ${hash}`;
    logs.appendChild(row);
    logs.scrollTop = logs.scrollHeight;
  }

  syncComplianceDials();
}

// XEN HYPERVISOR SANDBOXING ENGINE
function interceptAction(sourceApp, targetApp, actionType, onAllow, onDeny) {
  const sourceZone = systemState.hypervisor.zones[sourceApp] || 'personal';
  const targetZone = systemState.hypervisor.zones[targetApp] || 'personal';
  
  let shouldIntercept = false;
  
  if (sourceZone === 'untrusted') {
    shouldIntercept = true;
  } else if (sourceZone !== targetZone) {
    shouldIntercept = true;
  } else if (actionType === 'crypt_export' || actionType === 'admin_cmd') {
    shouldIntercept = true;
  }
  
  if (!shouldIntercept) {
    onAllow();
    return;
  }
  
  // Setup pending action queue
  systemState.hypervisor.pendingAction = {
    sourceApp,
    targetApp,
    actionType,
    onAllow,
    onDeny,
    sourceZone,
    targetZone
  };
  
  // Show prompt overlay
  const overlay = document.getElementById('hypervisor-overlay');
  const body = document.getElementById('hypervisor-body');
  
  if (overlay && body) {
    const srcLabel = `[${sourceApp.toUpperCase()} (${sourceZone.toUpperCase()})]`;
    const tgtLabel = `[${targetApp.toUpperCase()} (${targetZone.toUpperCase()})]`;
    
    let description = `<strong>Security Alert:</strong> The application ${srcLabel} is requesting to perform a cross-domain action: <strong>${actionType}</strong> on ${tgtLabel}.<br><br>`;
    
    if (sourceZone === 'untrusted') {
      description += `<span style="color: var(--sec-red);">⚠️ Warning: Source domain is UNTRUSTED (Red). Executing this action could compromise other zones.</span>`;
    } else {
      description += `<span style="color: var(--sec-yellow);">ℹ️ Notice: The hypervisor requires administrator permission to bridge these zones.</span>`;
    }
    
    body.innerHTML = description;
    overlay.classList.remove('hidden');
    
    addHypervisorLog(`INTERCEPT: ${sourceApp} (${sourceZone}) -> ${targetApp} (${targetZone}) [${actionType}] - Prompting Administrator`);
  } else {
    // Fallback if overlay not found
    onAllow();
  }
}

function allowHypervisorAccess() {
  const overlay = document.getElementById('hypervisor-overlay');
  if (overlay) overlay.classList.add('hidden');
  
  const pending = systemState.hypervisor.pendingAction;
  if (pending) {
    addHypervisorLog(`ALLOW: Authorized action [${pending.actionType}] from ${pending.sourceApp} to ${pending.targetApp}`);
    logAudit(`Hypervisor approved cross-domain action [${pending.actionType}] from ${pending.sourceApp} (${pending.sourceZone}) to ${pending.targetApp} (${pending.targetZone})`);
    
    if (pending.onAllow) pending.onAllow();
    systemState.hypervisor.pendingAction = null;
  }
}

function denyHypervisorAccess() {
  const overlay = document.getElementById('hypervisor-overlay');
  if (overlay) overlay.classList.add('hidden');
  
  const pending = systemState.hypervisor.pendingAction;
  if (pending) {
    addHypervisorLog(`BLOCK: Rejected action [${pending.actionType}] from ${pending.sourceApp} to ${pending.targetApp}`);
    logAudit(`Hypervisor BLOCKED cross-domain action [${pending.actionType}] from ${pending.sourceApp} (${pending.sourceZone}) to ${pending.targetApp} (${pending.targetZone})`);
    
    if (pending.onDeny) pending.onDeny();
    systemState.hypervisor.pendingAction = null;
  }
}

function addHypervisorLog(msg) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  const logMsg = `[${timeStr}] ${msg}`;
  systemState.hypervisor.logs.push(logMsg);
  
  const logsPanel = document.getElementById('hypervisor-logs-list');
  if (logsPanel) {
    const isAlert = msg.includes('BLOCK') || msg.includes('INTERCEPT');
    const isAllow = msg.includes('ALLOW');
    const cssClass = isAlert ? 'alert' : (isAllow ? 'allow' : 'info');
    
    logsPanel.innerHTML += `<div class="hyp-log-row ${cssClass}">${logMsg}</div>`;
    logsPanel.scrollTop = logsPanel.scrollHeight;
  }
}

function changeWindowZone(appId, selectElement) {
  const zone = selectElement.value;
  systemState.hypervisor.zones[appId] = zone;
  
  const win = document.getElementById(`window-${appId}`);
  if (win) {
    win.classList.remove('zone-untrusted', 'zone-work', 'zone-personal', 'zone-secure');
    win.classList.add(`zone-${zone}`);
  }
  
  selectElement.className = `window-zone-select sel-${zone}`;
  
  logAudit(`Hypervisor shifted domain context for window [${appId}] to [${zone.toUpperCase()}]`);
  addHypervisorLog(`DOMAIN_SHIFT: Window [${appId}] moved to zone [${zone.toUpperCase()}]`);
  
  const managerPanel = document.getElementById('hypervisor-vm-list-container');
  if (managerPanel) {
    updateHypervisorManagerUI();
  }
}

function toggleHypRule(key, checkbox) {
  systemState.hypervisor.rules[key] = checkbox.checked;
  addHypervisorLog(`RULE_UPDATE: Inter-VM policy '${key}' set to ${checkbox.checked ? 'ENABLED' : 'DISABLED'}`);
  logAudit(`Xen hypervisor policy update: '${key}' set to ${checkbox.checked ? 'ENABLED' : 'DISABLED'}`);
}

function copyVaultToVMClipboard() {
  const ciphertext = document.getElementById('vault-ciphertext-output').textContent;
  if (!ciphertext || ciphertext.startsWith('Payload will appear') || ciphertext.includes('Error') || ciphertext.includes('BLOCK')) {
    return;
  }
  
  const zone = systemState.hypervisor.zones['vault'] || 'personal';
  
  systemState.hypervisor.clipboard = {
    text: ciphertext,
    sourceZone: zone,
    sourceApp: 'vault'
  };
  
  addHypervisorLog(`COPY: Saved Vault output to hypervisor clipboard (Zone: ${zone.toUpperCase()})`);
  logAudit(`Copied secure text from Crypt Vault in zone ${zone.toUpperCase()} to VM clipboard.`);
  
  // Flash feedback in Vault
  const outputPanel = document.getElementById('vault-ciphertext-output');
  const oldText = outputPanel.textContent;
  outputPanel.textContent = "COPIED TO VM CLIPBOARD SUCCESSFULLY!";
  setTimeout(() => {
    outputPanel.textContent = oldText;
  }, 1000);
}

function pasteVaultFromVMClipboard() {
  const clipboard = systemState.hypervisor.clipboard;
  if (!clipboard || !clipboard.text) {
    alert("VM Clipboard is empty.");
    return;
  }
  
  const targetZone = systemState.hypervisor.zones['vault'] || 'personal';
  
  interceptAction(
    clipboard.sourceApp || 'unknown',
    'vault',
    'clipboard_paste',
    () => {
      const input = document.getElementById('vault-ciphertext-input');
      if (input) {
        input.value = clipboard.text;
        addHypervisorLog(`PASTE: Transferred clipboard data from ${clipboard.sourceZone.toUpperCase()} to VAULT (${targetZone.toUpperCase()})`);
      }
    },
    () => {
      addHypervisorLog(`PASTE_BLOCKED: Clipboard data transfer rejected.`);
    }
  );
}

function pasteTerminalFromVMClipboard() {
  const clipboard = systemState.hypervisor.clipboard;
  if (!clipboard || !clipboard.text) {
    const win = document.getElementById('window-terminal');
    if (win) {
      const history = win.querySelector('.terminal-history');
      history.innerHTML += `<div class="terminal-line warning">[Hypervisor Info] VM Clipboard is empty.</div>`;
      const terminalContainer = win.querySelector('.terminal-input').parentElement.parentElement;
      terminalContainer.scrollTop = terminalContainer.scrollHeight;
    }
    return;
  }
  
  const targetZone = systemState.hypervisor.zones['terminal'] || 'work';
  
  interceptAction(
    clipboard.sourceApp || 'unknown',
    'terminal',
    'clipboard_paste_to_terminal',
    () => {
      const win = document.getElementById('window-terminal');
      if (win) {
        const input = win.querySelector('.terminal-input');
        if (input) {
          input.value += clipboard.text;
          addHypervisorLog(`PASTE: Transferred clipboard data from ${clipboard.sourceZone.toUpperCase()} to TERMINAL (${targetZone.toUpperCase()})`);
        }
      }
    },
    () => {
      const win = document.getElementById('window-terminal');
      if (win) {
        const history = win.querySelector('.terminal-history');
        history.innerHTML += `<div class="terminal-line error">[XEN BLOCK] Hypervisor paste interdiction: Clipboard data transfer denied.</div>`;
        const terminalContainer = win.querySelector('.terminal-input').parentElement.parentElement;
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
      }
    }
  );
}

function getHypervisorContent() {
  setTimeout(updateHypervisorManagerUI, 100);
  return `
    <div class="app-hypervisor-container">
      <div class="hypervisor-header">
        <div class="hypervisor-title-block">
          <h3>Tomb Hypervisor VM Manager</h3>
          <p>Xen hypervisor sandboxing controls. Manage security zones, view VM telemetry, and enforce Dom0 isolation policies.</p>
        </div>
        <div class="hypervisor-stats">
          <div class="hypervisor-stat-pill">
            <div class="val">4</div>
            <div class="lbl">Active VMs</div>
          </div>
          <div class="hypervisor-stat-pill">
            <div class="val">3.0 GB</div>
            <div class="lbl">Total VM RAM</div>
          </div>
          <div class="hypervisor-stat-pill">
            <div class="val" id="hyp-cpu-usage">12%</div>
            <div class="lbl">Hypervisor CPU</div>
          </div>
        </div>
      </div>
      
      <div class="hypervisor-main">
        <div class="hypervisor-panel">
          <h4>Security Isolation Domains (VMs)</h4>
          <div class="vm-list" id="hypervisor-vm-list-container">
          </div>
        </div>
        
        <div class="hypervisor-panel">
          <h4>Inter-VM Security Policies</h4>
          <div class="hypervisor-rules">
            <div class="rule-row">
              <div class="rule-info">
                <span class="rule-name">Inter-Domain Drag & Drop</span>
                <span class="rule-desc">Intercept any file drag and drop events across color zones</span>
              </div>
              <label class="aa-switch">
                <input type="checkbox" id="hyp-rule-dnd" ${systemState.hypervisor.rules.interAppDnd ? 'checked' : ''} onchange="toggleHypRule('interAppDnd', this)">
                <span class="aa-slider"></span>
              </label>
            </div>
            
            <div class="rule-row">
              <div class="rule-info">
                <span class="rule-name">Cross-Zone Clipboard Copy</span>
                <span class="rule-desc">Require authorization to copy text out of a secure zone</span>
              </div>
              <label class="aa-switch">
                <input type="checkbox" id="hyp-rule-copy" ${systemState.hypervisor.rules.crossCopy ? 'checked' : ''} onchange="toggleHypRule('crossCopy', this)">
                <span class="aa-slider"></span>
              </label>
            </div>
            
            <div class="rule-row">
              <div class="rule-info">
                <span class="rule-name">Keys and Crypt Export Protection</span>
                <span class="rule-desc">Block exporting vault keys to red/untrusted domains</span>
              </div>
              <label class="aa-switch">
                <input type="checkbox" id="hyp-rule-keys" ${systemState.hypervisor.rules.vaultExport ? 'checked' : ''} onchange="toggleHypRule('vaultExport', this)">
                <span class="aa-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div class="hypervisor-logs" id="hypervisor-logs-list">
      </div>
    </div>
  `;
}

function updateHypervisorManagerUI() {
  const container = document.getElementById('hypervisor-vm-list-container');
  if (!container) return;
  
  const vms = [
    { id: 'untrusted', name: 'untrusted (Red Zone)', desc: 'Web browser, unverified downloads, networking open', zone: 'untrusted', cpu: '6%', ram: '0.5 GB / 1.0 GB' },
    { id: 'work', name: 'work (Yellow Zone)', desc: 'Terminal, developer workspaces, local networks', zone: 'work', cpu: '4%', ram: '0.8 GB / 1.0 GB' },
    { id: 'personal', name: 'personal (Blue Zone)', desc: 'Crypt Vault, files, password manager', zone: 'personal', cpu: '1%', ram: '0.4 GB / 0.6 GB' },
    { id: 'secure', name: 'secure (Green Zone)', desc: 'Auditors, seL4 Microkernel root control panel', zone: 'secure', cpu: '1%', ram: '0.2 GB / 0.4 GB' }
  ];
  
  container.innerHTML = vms.map(vm => {
    const isOpen = Object.entries(systemState.hypervisor.zones).some(([appId, zone]) => {
      return zone === vm.zone && document.getElementById(`window-${appId}`) !== null;
    });
    
    return `
      <div class="vm-card ${vm.zone}">
        <div class="vm-info">
          <span class="vm-name">${vm.name}</span>
          <span class="vm-desc">${vm.desc}</span>
        </div>
        <div class="vm-status">
          <span class="vm-badge ${isOpen ? 'running' : 'stopped'}">${isOpen ? 'RUNNING' : 'STOPPED'}</span>
          <span class="vm-resources">${isOpen ? `CPU: ${vm.cpu} | RAM: ${vm.ram}` : 'Idle'}</span>
        </div>
      </div>
    `;
  }).join('');
  
  const logsList = document.getElementById('hypervisor-logs-list');
  if (logsList) {
    logsList.innerHTML = systemState.hypervisor.logs.map(log => {
      const isAlert = log.includes('BLOCK') || log.includes('INTERCEPT');
      const isAllow = log.includes('ALLOW');
      const cssClass = isAlert ? 'alert' : (isAllow ? 'allow' : 'info');
      return `<div class="hyp-log-row ${cssClass}">${log}</div>`;
    }).join('');
    logsList.scrollTop = logsList.scrollHeight;
  }
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

// Mobile Viewport and Gesture optimization (Android & iOS)
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// ==========================================
// 150-CHARACTER CRYPTOGRAPHIC HASH GENERATOR
// ==========================================
function generateInteractionHash() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 150; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ==========================================
// TOMB RENDER (VIDEO PRODUCTION STUDIO)
// ==========================================
function getRenderContent() {
  const isPlaying = systemState.render.isPlaying;
  const playProgress = systemState.render.playProgress;
  const isRendering = systemState.render.isRendering;
  const renderProgress = systemState.render.renderProgress;
  const activeScene = systemState.render.activeScene;

  return `
    <div class="app-render-container">
      <div class="render-preview-box">
        <div class="render-canvas-sim">
          <div style="font-size: 13px; font-weight: bold; margin-bottom: 5px; color: #fff; letter-spacing: 1px;">TOMB PRODUCTION STUDIO PREVIEW</div>
          <div id="render-preview-scene" style="font-size: 11.5px; color: var(--sec-yellow); font-family: var(--font-mono); margin-bottom: 8px; font-weight: bold; height: 16px;">
            ${activeScene}
          </div>
          <div id="render-preview-timer" style="font-size: 11px; color: var(--ubuntu-light-grey); font-family: var(--font-mono);">
            Time: ${(playProgress * 0.15).toFixed(1)}s / 15.0s
          </div>
          <div style="display: flex; gap: 6px; margin-top: 12px; font-size: 9px; color: rgba(255,255,255,0.4); text-transform: uppercase;">
            <span>1080p Stream</span> • <span>60 FPS</span> • <span>VM Zone: Work</span>
          </div>
        </div>

        ${isRendering ? `
        <div class="render-progress-overlay" id="render-progress-overlay">
          <div style="font-size: 12px; font-weight: bold; color: var(--sec-green); font-family: var(--font-mono); letter-spacing: 1px; animation: pulse 1s infinite alternate;">COMPILING VIDEO STREAMS...</div>
          <div class="render-bar">
            <div class="render-bar-fill" id="render-bar-fill" style="width: ${renderProgress}%"></div>
          </div>
          <div id="render-progress-text" style="font-size: 11px; color: #fff; font-family: var(--font-mono);">${renderProgress}% Complete</div>
        </div>
        ` : ''}
      </div>

      <div class="render-timeline">
        <div style="position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center;">
          <div class="timeline-tracks" style="position: relative; overflow-x: hidden;">
            <!-- Vertical Playhead -->
            <div id="render-playhead" style="position: absolute; top: 0; bottom: 0; width: 2px; background: var(--ubuntu-orange); left: calc(60px + (100% - 70px) * (${playProgress} / 100)); pointer-events: none; z-index: 5; box-shadow: 0 0 6px var(--ubuntu-orange);"></div>
            
            <div class="timeline-track" style="margin-bottom: 4px;">
              <div class="track-label">VIDEO</div>
              <div class="track-bar">
                <div class="track-clip" style="left: 0%; width: 25%;" title="Intro Scene: Kernel Boot">Intro</div>
                <div class="track-clip" style="left: 25%; width: 35%; background: linear-gradient(90deg, #b00020, #e95420);" title="Scene 2: Cyber Attack Sim">Threat Sim</div>
                <div class="track-clip" style="left: 60%; width: 40%; background: linear-gradient(90deg, #33d17a, #3584e4);" title="Scene 3: Crypt Shield & Mitigation">Mitigation</div>
              </div>
            </div>

            <div class="timeline-track" style="margin-bottom: 4px;">
              <div class="track-label">AUDIO</div>
              <div class="track-bar">
                <div class="track-clip audio" style="left: 0%; width: 50%;" title="Theme Music Track">Soundtrack</div>
                <div class="track-clip audio" style="left: 50%; width: 50%;" title="IDS Alarm Effects">Alarm.fx</div>
              </div>
            </div>

            <div class="timeline-track">
              <div class="track-label">FX/TEXT</div>
              <div class="track-bar">
                <div class="track-clip fx" style="left: 10%; width: 20%;" title="Title Card overlay">Title Text</div>
                <div class="track-clip fx" style="left: 30%; width: 20%;" title="Alert overlay">Alert.Overlay</div>
                <div class="track-clip fx" style="left: 60%; width: 30%;" title="Success overlay">Success.Overlay</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="render-controls">
        <div>
          <button class="render-btn-play" onclick="toggleRenderPlay()" id="render-play-btn">
            ${isPlaying ? '❚❚ Pause' : '▶ Play'}
          </button>
          <button class="render-btn-play" style="margin-left: 5px;" onclick="resetRenderPlay()">
            Stop / Reset
          </button>
        </div>
        <div>
          <button class="render-btn-build" onclick="startMovieRendering()">
            Render Production Movie
          </button>
        </div>
      </div>
    </div>
  `;
}

function toggleRenderPlay() {
  const isPlaying = systemState.render.isPlaying;
  
  if (isPlaying) {
    // Pause
    systemState.render.isPlaying = false;
    if (systemState.render.intervalId) {
      clearInterval(systemState.render.intervalId);
      systemState.render.intervalId = null;
    }
    const playBtn = document.getElementById('render-play-btn');
    if (playBtn) playBtn.textContent = '▶ Play';
  } else {
    // Play
    systemState.render.isPlaying = true;
    const playBtn = document.getElementById('render-play-btn');
    if (playBtn) playBtn.textContent = '❚❚ Pause';
    
    systemState.render.intervalId = setInterval(() => {
      systemState.render.playProgress += 1;
      if (systemState.render.playProgress > 100) {
        systemState.render.playProgress = 0;
      }
      updateRenderPlayUI();
    }, 150);
  }
}

function resetRenderPlay() {
  systemState.render.isPlaying = false;
  systemState.render.playProgress = 0;
  systemState.render.activeScene = "Scene 1: System Boot & Kernel Audits";
  
  if (systemState.render.intervalId) {
    clearInterval(systemState.render.intervalId);
    systemState.render.intervalId = null;
  }
  
  const playBtn = document.getElementById('render-play-btn');
  if (playBtn) playBtn.textContent = '▶ Play';
  
  updateRenderPlayUI();
}

function updateRenderPlayUI() {
  const playhead = document.getElementById('render-playhead');
  const timer = document.getElementById('render-preview-timer');
  const scene = document.getElementById('render-preview-scene');
  const playProgress = systemState.render.playProgress;

  if (playhead) {
    playhead.style.left = `calc(60px + (100% - 70px) * (${playProgress} / 100))`;
  }
  if (timer) {
    timer.textContent = `Time: ${(playProgress * 0.15).toFixed(1)}s / 15.0s`;
  }
  if (scene) {
    let activeScene = "Scene 1: System Boot & Kernel Audits";
    if (playProgress >= 25 && playProgress < 60) {
      activeScene = "⚠️ Scene 2: Firewall Breach & Port Scan Intrusion";
    } else if (playProgress >= 60) {
      activeScene = "🛡️ Scene 3: Crypt Shield Isolation & seL4 Hardening Proof";
    }
    scene.textContent = activeScene;
    systemState.render.activeScene = activeScene;
  }
}

function startMovieRendering() {
  if (systemState.render.isRendering) return;
  
  // Pause playback first
  if (systemState.render.isPlaying) {
    toggleRenderPlay();
  }

  systemState.render.isRendering = true;
  systemState.render.renderProgress = 0;

  // Append overlay programmatically
  const container = document.querySelector('.app-render-container');
  const previewBox = document.querySelector('.render-preview-box');
  
  if (!previewBox) return;

  const overlay = document.createElement('div');
  overlay.className = 'render-progress-overlay';
  overlay.id = 'render-progress-overlay';
  overlay.innerHTML = `
    <div style="font-size: 12px; font-weight: bold; color: var(--sec-green); font-family: var(--font-mono); letter-spacing: 1px; animation: pulse 1s infinite alternate;">COMPILING VIDEO STREAMS...</div>
    <div class="render-bar">
      <div class="render-bar-fill" id="render-bar-fill" style="width: 0%"></div>
    </div>
    <div id="render-progress-text" style="font-size: 11px; color: #fff; font-family: var(--font-mono);">0% Complete</div>
  `;
  previewBox.appendChild(overlay);

  const renderTimer = setInterval(() => {
    systemState.render.renderProgress += 5;
    
    const fill = document.getElementById('render-bar-fill');
    const txt = document.getElementById('render-progress-text');
    
    if (fill) fill.style.width = `${systemState.render.renderProgress}%`;
    if (txt) txt.textContent = `${systemState.render.renderProgress}% Complete`;

    if (systemState.render.renderProgress >= 100) {
      clearInterval(renderTimer);
      systemState.render.isRendering = false;

      // Generate verification key of 150 characters
      const key = generateInteractionHash();

      // Intercept file write using Qubes Hypervisor security borders
      interceptAction(
        'render',
        'vault',
        'write_rendered_video_file',
        () => {
          // Allowed by hypervisor
          const overlayEl = document.getElementById('render-progress-overlay');
          if (overlayEl) overlayEl.remove();
          
          let alertMsg = `SUCCESS: Production Movie 'tomb_production_movie.mp4' compiled.\n\n`;
          if (systemState.ultimate.sdcardMode) {
            alertMsg += `Storage: live sd-card (/media/sdcard/movies/)\n`;
          } else {
            alertMsg += `Storage: crypt-vault (/home/sec-admin/vault/)\n`;
          }
          alertMsg += `Integrity Verification Key:\n${key}`;
          
          alert(alertMsg);
          logAudit(`Saved production movie to Vault. Size: 412 MB. SHA-256 Verified.`);
        },
        () => {
          // Blocked by hypervisor
          const overlayEl = document.getElementById('render-progress-overlay');
          if (overlayEl) overlayEl.remove();
          
          alert(`BLOCKED: Hypervisor denied permission to write output movie file to secure storage.`);
          logAudit(`XEN Intercept Blocked Movie Maker exporting video file to Vault.`);
        }
      );
    }
  }, 150);
}

// ==========================================
// AI TEACHER & TRANSLATOR HUB
// ==========================================
const translationTemplates = [
  {
    lang: "🇷🇺 Russian",
    original: "Обнаружена атака методом подбора пароля SSH с IP-адреса 91.240.118.66",
    english: "SSH brute-force attack detected from IP 91.240.118.66",
    src: "91.240.118.66"
  },
  {
    lang: "🇨🇳 Chinese",
    original: "检测到端口扫描，扫描端口范围：21, 22, 23, 80",
    english: "Port scan detected, scanned ports: 21, 22, 23, 80",
    src: "45.143.203.14"
  },
  {
    lang: "🇪🇸 Spanish",
    original: "Intento de inyección SQL detectado en HTTP GET /login",
    english: "SQL Injection attempt detected in HTTP GET /login",
    src: "185.220.101.5"
  },
  {
    lang: "🇫🇷 French",
    original: "AppArmor a bloqué la lecture non autorisée de /etc/shadow par chromium-browser",
    english: "AppArmor blocked unauthorized read on /etc/shadow by chromium-browser",
    src: "localhost"
  },
  {
    lang: "🇩🇪 German",
    original: "ICMP-Flood-Paketvolumen hat den Grenzwert überschritten",
    english: "ICMP flood packet volume has exceeded the limit",
    src: "192.168.1.102"
  },
  {
    lang: "🇯🇵 Japanese",
    original: "IPアドレス 185.220.101.5 からの SQL インジェクション攻撃を検出しました",
    english: "SQL Injection attack detected from IP address 185.220.101.5",
    src: "185.220.101.5"
  },
  {
    lang: "🇰🇷 Korean",
    original: "SSH 무차별 대입 공격 감지: IP 91.240.118.66",
    english: "SSH brute-force attack detected: IP 91.240.118.66",
    src: "91.240.118.66"
  }
];

function getTeacherContent() {
  const activeTab = systemState.teacher.activeTab || 'translator';
  
  return `
    <div class="app-teacher-container">
      <div class="teacher-tabs">
        <button class="teacher-tab ${activeTab === 'translator' ? 'active' : ''}" onclick="switchTeacherTab('translator')">
          🌐 Live Language Translator
        </button>
        <button class="teacher-tab ${activeTab === 'teacher' ? 'active' : ''}" onclick="switchTeacherTab('teacher')">
          🧠 Interactive Agent Teacher
        </button>
      </div>

      ${activeTab === 'translator' ? `
        <div class="teacher-panel" id="teacher-translator-panel">
          <div style="font-size: 11px; color: var(--ubuntu-light-grey); margin-bottom: 2px;">
            Incoming international alerts and message streams translated into English in real-time.
          </div>
          <div class="translate-feed" id="translate-feed">
            ${renderTranslationFeed()}
          </div>
        </div>
      ` : `
        <div class="teacher-panel" id="teacher-agent-panel">
          <div style="font-size: 11px; color: var(--ubuntu-light-grey); margin-bottom: 2px;">
            Submit custom rules, behavior guidelines, or command automation preferences to train your Tomb OS agent.
          </div>
          
          <div class="teacher-input-area">
            <label for="teacher-rule-input" style="font-weight: 600; margin-bottom: 4px; display: block;">Rule / Instruction to Teach Agent:</label>
            <textarea class="teacher-textarea" id="teacher-rule-input" placeholder="e.g. When Port 22 is scanned, immediately toggle AppArmor sandbox on SSH..."></textarea>
            <button class="teacher-btn-action" style="margin-top: 6px;" onclick="submitAgentRule()">Teach Rules to Agent</button>
          </div>

          <div style="font-size: 11px; font-weight: bold; color: var(--sec-yellow); margin-top: 4px;">Active Learned Rules Brain Database:</div>
          <div class="teacher-logs" id="teacher-rules-logs">
            ${renderLearnedRules()}
          </div>
        </div>
      `}
    </div>
  `;
}

function switchTeacherTab(tab) {
  systemState.teacher.activeTab = tab;
  const win = document.getElementById('window-teacher');
  if (win) {
    const content = win.querySelector('.window-content');
    if (content) {
      content.innerHTML = getTeacherContent();
    }
  }
}

function submitAgentRule() {
  const textarea = document.getElementById('teacher-rule-input');
  if (!textarea) return;
  
  const ruleText = textarea.value.trim();
  if (!ruleText) {
    alert("Please enter a rule to teach the agent.");
    return;
  }

  // Generate unique validation hash of 150 characters
  const hash = generateInteractionHash();
  
  // Format the learned rule with its 150-char validation hash
  const formattedRule = `"${ruleText}" | Verification Hash: [${hash}]`;
  systemState.teacher.rules.unshift(formattedRule);
  
  // Clear textarea
  textarea.value = '';
  
  // Log to auditd
  logAudit(`Trained agent with new behavior rule: "${ruleText.substring(0, 40)}..."`);
  
  // Update view
  const rulesLogs = document.getElementById('teacher-rules-logs');
  if (rulesLogs) {
    rulesLogs.innerHTML = renderLearnedRules();
  }
}

function renderLearnedRules() {
  if (systemState.teacher.rules.length === 0) {
    return `<div style="color: rgba(255,255,255,0.4); font-style: italic; font-size: 11px;">No rules loaded. Submit a rule above to teach the agent.</div>`;
  }
  return systemState.teacher.rules.map((rule, idx) => {
    return `
      <div style="margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px; font-size: 11px; line-height: 1.4;">
        <span style="color: var(--sec-green); font-weight: bold; display: block; margin-bottom: 2px;">[LEARNED RULE #${systemState.teacher.rules.length - idx}]</span>
        <div style="color: #fff; margin-bottom: 4px;">${rule.split(' | ')[0]}</div>
        <div style="color: rgba(255,255,255,0.3); font-size: 9.5px; word-break: break-all; font-family: var(--font-mono);">Hash: ${rule.split(' | ')[1].replace('Verification Hash: [', '').replace(']', '')}</div>
      </div>
    `;
  }).join('');
}

function renderTranslationFeed() {
  if (systemState.teacher.translations.length === 0) {
    return `<div style="color: rgba(255,255,255,0.3); font-style: italic; text-align: center; margin-top: 50px; font-size: 12px;">
      Waiting for incoming traffic alerts in foreign languages...
    </div>`;
  }
  return systemState.teacher.translations.map(t => {
    return `
      <div class="translate-row" style="margin-bottom: 8px;">
        <div class="translate-source" style="display: flex; justify-content: space-between; align-items: center;">
          <span>${t.lang} Alert (IP: ${t.src})</span>
          <span style="color: var(--sec-green); font-family: var(--font-mono); font-size: 9px;">VERIFIED</span>
        </div>
        <div class="translate-text-original">${t.original}</div>
        <div class="translate-text-english">${t.english}</div>
        <div style="font-size: 9px; color: rgba(255,255,255,0.25); margin-top: 5px; word-break: break-all; font-family: var(--font-mono);">
          Hash: ${t.hash}
        </div>
      </div>
    `;
  }).join('');
}

function translateIncomingMessage(template) {
  // Find a matching translation template or fallback
  const matchingTrans = translationTemplates.filter(t => 
    t.english.toLowerCase().includes(template.type.toLowerCase()) || 
    template.msg.toLowerCase().includes(t.english.split(' ')[0].toLowerCase())
  );
  
  const trans = matchingTrans.length > 0 
    ? matchingTrans[Math.floor(Math.random() * matchingTrans.length)] 
    : translationTemplates[Math.floor(Math.random() * translationTemplates.length)];
  
  const original = trans.original.replace('91.240.118.66', template.src).replace('185.220.101.5', template.src).replace('45.143.203.14', template.src);
  const english = trans.english.replace('91.240.118.66', template.src).replace('185.220.101.5', template.src).replace('45.143.203.14', template.src);

  // Generate 150-char validation hash for this specific translation interaction
  const hash = generateInteractionHash();

  systemState.teacher.translations.unshift({
    lang: trans.lang,
    original: original,
    english: english,
    src: template.src,
    hash: hash
  });

  if (systemState.teacher.translations.length > 20) {
    systemState.teacher.translations.pop();
  }

  // Update DOM if it's currently open
  const feed = document.getElementById('translate-feed');
  if (feed) {
    feed.innerHTML = renderTranslationFeed();
  }
}
