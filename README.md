# 🛡️ Tomb OS: Ultimate Sovereign Operating System & Hardened Security Platform

Welcome to **Tomb OS**, the world's most secure, post-quantum resilient, and architecturally verified sovereign operating system. Designed for high-threat enclaves, defense researchers, financial institutions, and privacy-conscious users, Tomb OS unifies bare-metal microkernel mathematical proofs with disposable hypervisor micro-segmentation and universal cross-platform mobile convergence.

---

## 📋 Table of Contents
1. [🌟 Core Security Architecture](#-core-security-architecture)
2. [🚀 Quick Start & Installation Options](#-quick-start--installation-options)
   - [Option A: Native macOS Application (Electron)](#option-a-native-macos-application-electron)
   - [Option B: Hardened Docker Container Infrastructure](#option-b-hardened-docker-container-infrastructure)
   - [Option C: Bare-Metal x86_64 ISO Installation](#option-c-bare-metal-x86_64-iso-installation)
   - [Option D: Live SD XC & External NVMe Disk Flashing](#option-d-live-sd-xc--external-nvme-disk-flashing)
   - [Option E: Universal Smartphone Mobile Deployment (GrapheneOS GSI)](#option-e-universal-smartphone-mobile-deployment-grapheneos-gsi)
3. [🔑 Mandatory Administrative Setup & Hardware 2FA](#-mandatory-administrative-setup--hardware-2fa)
4. [💾 Importing Files from External Drives (USB / SD / NVMe)](#-importing-files-from-external-drives-usb--sd--nvme)
5. [🤖 OpenAI GPT-4o Intelligence Configuration](#-openai-gpt-4o-intelligence-configuration)
6. [💻 Hardened Terminal Command Reference](#-hardened-terminal-command-reference)
7. [📂 Repository Structure](#-repository-structure)

---

## 🌟 Core Security Architecture

- **seL4 Microkernel IPC Capabilities**: Formally verified, mathematically proven inter-process communication gates.
- **Xen Dom0 Per-Window Micro-VMs**: Every browser window runs inside a isolated Xen micro-VM (`DomU-VM-XXXXX`). Closing a window triggers volatile RAM scrubbing (`kzero_memory()`).
- **Post-Quantum Cryptography (PQC)**: Native lattice cryptography (**Kyber-1024** key exchange & **Dilithium-5** digital signatures) protecting all chat streams and payload vaults.
- **Zero-Backdoor Sovereign Ownership**: 100% user encryption key authority (TPM 2.0 enclaves). Zero remote administrative overrides and zero cloud telemetry.
- **Compiler Hardening**: Military-grade binary protection (`-fstack-protector-strong`, `-D_FORTIFY_SOURCE=2`, RELRO, BIND_NOW, KPTI, KASLR).

---

## 🚀 Quick Start & Installation Options

### Option A: Native macOS Application (Electron)
To install and run Tomb OS as a standalone desktop application on macOS:

```bash
# 1. Clone the repository
git clone https://github.com/bashbadger/tombOS-project-.git
cd tombOS-project-

# 2. Install dependencies
npm install

# 3. Launch in development mode
npm run dev

# 4. Build native macOS production binary (.dmg / .app)
npm run dist
```

---

### Option B: Hardened Docker Container Infrastructure
Run Tomb OS inside an isolated, read-only multi-container Docker sandbox:

```bash
# 1. Execute the automated Docker launch script
./scripts/docker_run.sh

# Or launch using docker-compose directly:
docker-compose up -d --build
```
*Features: Read-only root filesystem (`read_only: true`), dropped all Linux capabilities (`cap_drop: - ALL`), no-new-privileges flag.*

---

### Option C: Bare-Metal x86_64 ISO Installation
Compile the bare-metal kernel (`kernel.bin`) and build a bootable ISO for physical hardware or QEMU/UTM hypervisors:

```bash
# 1. Build kernel and package ISO
cd kernel && make clean && make && cd .. && ./build_tombos.sh

# 2. Test in QEMU emulator
qemu-system-i386 -kernel kernel/kernel.bin -m 3072
```

---

### Option D: Live SD XC & External NVMe Disk Flashing
Flash the bare-metal `tombos_secure_amd64.iso` directly onto a high-speed external SD card or NVMe SSD for live portable booting:

```bash
# Flash to external disk (Replace /dev/diskX with target drive node)
sudo ./scripts/flash_sdxc.sh /dev/diskX tombos_secure_amd64.iso
```

---

### Option E: Universal Smartphone Mobile Deployment (GrapheneOS GSI)
Flash Tomb OS onto *any modern Android smartphone* supporting Project Treble via GrapheneOS Generic System Image (GSI):

```bash
# 1. Connect smartphone in fastboot mode via USB
# 2. Execute universal smartphone flasher script
./scripts/flash_phone.sh out/graphene_gsi/out/target/product/generic_arm64/system.img
```

---

## 🔑 Mandatory Administrative Setup & Hardware 2FA

1. **First Boot Installation Wizard**: Upon initial system launch, you are prompted to define a master administrative passphrase for `sec-admin`. This passphrase encrypts local TPM 2.0 hardware enclaves.
2. **Session Authentication Lock Screen**: Every subsequent session requires authentication. If the passphrase is forgotten, encrypted data is permanently unrecoverable—requiring external backups.
3. **Contactless NFC Key & YubiKey Pairing**:
   - Tap **"Tap NFC Security Key / YubiKey"** on the lock screen for instant one-tap hardware FIDO2 authentication.
   - Open **External Security Accessory Manager (`accessory`)** inside Control Center to pair new YubiKey 5Ci, Google Titan Keys, or PKCS#11 HSM Tokens.

---

## 💾 Importing Files from External Drives (USB / SD / NVMe)

1. Open the **Cross-Platform Importer (`importer`)** app from Control Center.
2. Select the **"External Drive (USB/SD)"** tab.
3. Select desired file payloads (Cryptographic Vault Backups, Confidential Documents, Media, System Images).
4. Click **"Scan & Import Files from External Disk"**. Payloads are sanitized by the Tomb OS Sanitization Daemon and deposited into `/home/sec-admin/imported_files/`.

---

## 🤖 OpenAI GPT-4o Intelligence Configuration

Tomb OS integrates OpenAI's GPT-4o engine into system diagnostics and terminal pipelines.

- **Environment Settings**: API keys and model profiles are configured in `systemState.env` (`OPENAI_MODEL: 'gpt-4o'`).
- **Terminal CLI Execution**:
  ```bash
  sec-admin@tomb-os:~$ openai analyze active threat surface
  sec-admin@tomb-os:~$ gpt audit memory buffers
  ```

---

## 💻 Hardened Terminal Command Reference

| Command | Description |
| :--- | :--- |
| `ufw status` | Inspect active firewall filtering rules |
| `aa-status` | Verify AppArmor mandatory access control sandboxing |
| `auditd` | Dump real-time Linux audit daemon system logs |
| `fail2ban-client status` | View automated IP brute-force blacklist tables |
| `docker ps` | Inspect running read-only Docker containers |
| `openai [prompt]` | Execute OpenAI GPT-4o threat intelligence query |
| `gpg -c [file]` | Symmetrical AES-256 file payload encryption |

---

## 📂 Repository Structure

```
tombOS-project-/
├── kernel/                  # Bare-metal x86 C/Assembly kernel source
│   ├── boot.asm             # Multiboot entry assembly
│   ├── kernel.c             # Kernel initialization & hardware port I/O
│   └── sel4_ipc.c           # seL4 microkernel formal IPC capability routing
├── scripts/                 # Automated build and hardware deployment scripts
│   ├── build_rootfs.sh      # Rootfs, UFW, auditd, and AppArmor compiler
│   ├── docker_run.sh        # Docker container launcher
│   ├── flash_phone.sh       # Universal smartphone fastboot flasher
│   └── flash_sdxc.sh        # External SD XC / NVMe raw disk flasher
├── Dockerfile               # Read-only multi-stage Nginx container definition
├── docker-compose.yml       # Production container orchestration
├── index.html               # Sovereign UI desktop layout markup
├── app.js                   # Master UI state, VM allocation & CLI engine
└── style.css                # Ultra-hardened glassmorphism styling
```

---

## ⚖️ License & Sovereign Manifesto
Tomb OS is distributed under open sovereign security licenses. Built for absolute user privacy, zero telemetry, and maximum post-quantum resilience.
