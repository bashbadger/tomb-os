# 🛡️ Tomb OS Official Project Wiki & Master Architecture Scope

Welcome to the official technical wiki for **Tomb OS**, the world's most advanced hardened operating system and cybersecurity architecture.

---

## 🏛️ Project Vision & Architectural Scope
Tomb OS is engineered to eliminate the systemic vulnerabilities of conventional operating systems (telemetry backdoors, global state compromise, unisolated browser zero-days, and legacy RSA/ECC cryptographic degradation). It provides a formally verified, multi-tiered security enclave designed for researchers, financial institutions, and privacy-conscious users.

### 🎯 Core Mission: Free High-Level Security
Our guiding principle is to democratize elite cybersecurity defense: **"To provide the highest level security framework for free to anyone that will responsibly use it."** 
- **100% Free & Open-Source**: Zero licensing fees, removing expensive vendor lock-in and hardware appliance tax.
- **Commodity Hardware Universal Boot**: Runs on existing laptops, PCs, live SD cards, and standard Android smartphones via universal GSI flashing.

---

## 🔬 Core Architectural Pillars

### 1. Formally Verified seL4 Microkernel IPC
- **IPC Capability Gates**: Eliminates shared kernel space risks by strictly enforcing capability-based access control.
- **Compiler Hardening**: Built with `-fstack-protector-strong`, `-D_FORTIFY_SOURCE=2`, full RELRO, BIND_NOW, Kernel Page Table Isolation (KPTI), and KASLR entropy.

### 2. Disposable Xen Dom0 Per-Window Micro-VMs
- **Per-Tab Hypervisor Isolation**: Every Chromium browser window operates inside an isolated micro virtual machine (`DomU-VM-XXXXX`).
- **Volatile RAM Scrubbing**: Window closure triggers an immediate 512MB RAM enclave purge (`kzero_memory()`), annihilating browser exploits before host storage contact.

### 3. Native Post-Quantum Cryptography (PQC)
- **Kyber-1024 Lattice Key Exchange**: Enforced across all internal messaging streams and storage vaults to defeat quantum decryption.
- **Dilithium-5 Digital Signatures**: Protects administrative payloads, GPG keys, and software package manifests.

### 4. Zero-Trust User Data Ownership
- **TPM 2.0 Enclave Sealing**: Administrative passphrases (`sec-admin`) encrypt local hardware security enclaves.
- **Contactless Hardware 2FA**: One-tap YubiKey NFC and Google Titan FIDO2 key authentication.
- **Zero Remote Overrides**: 100% user encryption key authority with zero telemetry and zero backdoors.

---

## 🎛️ Modular Enterprise Security Framework (`securityhub`)

Tomb OS partitions modern data security controls into standalone, toggleable modules:
- **Zero-Trust Network Architecture (ZTNA)**: Micro-segmentation & mTLS session verification.
- **Data Loss Prevention (DLP)**: Automated regex inspection blocking outbound credit cards, SSNs, and private keys.
- **Post-Quantum Cryptography (PQC)**: Native lattice encryption and signature validation.
- **Runtime Application Self-Protection (RASP)**: In-memory monitoring checking for stack corruption and buffer overflows.
- **Identity & Access Management (IAM / RBAC)**: Multi-factor hardware attestation and role-based access controls.
- **Endpoint Detection & Response (EDR)**: Threat hunting daemons with automated process isolation.

---

## 🤖 AI Intelligence & Automation Suite

- **OpenAI GPT-4o Security Engine**: Integrated directly into the Hardened Terminal CLI (`openai [query]`, `gpt`) for real-time vulnerability audits.
- **Autonomous AI Task Recorder & Macro Auto-Pilot (`taskrecorder`)**: Record complex workflows and let GPT-4o re-execute them autonomously.
- **Sensitive Content Filtering Daemon**: Automatically redacts administrative passphrases, SSH keys, and tokens before saving macros.
- **Real-Time Web Upload Sanitizer**: Intercepts web uploads, strips executable macros (`.docm`, `.xlsm`), scrubs EXIF tracking tags, and stores clean files in `/home/sec-admin/downloads/`.

---

## 🌐 Dynamic Anonymization & Ergonomics

- **Dynamic Rolling Task IP Rotator (`rotateTaskIp`)**: Automatically recalculates and encrypts a fresh egress IP (e.g., `185.220.101.42`) every single task execution.
- **Real-Time Typing Speed Monitor (`typespeed`)**: Optional WPM calculation, keystroke accuracy %, and ergonomics cadence tracking.

---

## 📱 Universal Cross-Platform Deployment & Public Downloads

Anyone can freely download pre-compiled packages for Windows, macOS, Linux, Docker, and Mobile:
- **🍎 Native macOS App (`.dmg` / `.pkg`)**: Compiled via Electron ([Download tombOS_v1.0.0_macOS_Universal.dmg](https://github.com/bashbadger/tombOS-project-/releases/download/v1.0.0/tombOS_v1.0.0_macOS_Universal.dmg)).
- **🪟 Windows Setup (`.exe` / `.msi`)**: Executable installer for Windows 10/11 ([Download tombOS_Setup_v1.0.0_x64.exe](https://github.com/bashbadger/tombOS-project-/releases/download/v1.0.0/tombOS_Setup_v1.0.0_x64.exe)).
- **🐧 Bare-Metal x86_64 ISO (`.iso` / `.deb`)**: Bootable live OS image `tombos_secure_amd64.iso` ([Download tombos_secure_amd64.iso](https://github.com/bashbadger/tombOS-project-/releases/download/v1.0.0/tombos_secure_amd64.iso)).
- **🐳 Hardened Docker Container**: Read-only root filesystem container (`docker pull ghcr.io/bashbadger/tomb-os:latest`).
- **📱 Standalone Mobile Package (`.apk` / `.zip`)**: Universal Android installer ([Download tombOS_v1.0.0_Android_Mobile.apk](https://github.com/bashbadger/tombOS-project-/releases/download/v1.0.0/tombOS_v1.0.0_Android_Mobile.apk) / [Download GSI.zip](https://github.com/bashbadger/tombOS-project-/releases/download/v1.0.0/GrapheneOS_tombOS_Universal_GSI.zip)).
- **💾 Live SD XC / NVMe Drive**: Portable bootable media flasher (`./scripts/flash_sdxc.sh`).
- **🖥️ Dedicated Bare-Metal Host OS**: Disk wiper & GRUB2 bootloader installer (`sudo ./scripts/install_baremetal.sh /dev/sda`).

---

## ⚖️ Legal Disclaimer & Responsible Use Notice
> **DISCLAIMER: Any and all illegal use of the content or contents of this page will be prosecuted to the fullest extent of the law.**

---

## 🕊️ Good Faith & Global Focused Action Charter
> **"Only good faith and world-focused action are to be taken with any appendix of the program, applications, compiler, assemblers, or software herein."**


---

## 📂 Repository File-by-File Technical Wiki Directory

Below is the complete architectural documentation index for every file in the Tomb OS repository:

- 📄 **[index.html & demo.html](./files/index_html.md)** — Desktop UI Environment, Lock Screens & Modals Markup
- ⚙️ **[app.js](./files/app_js.md)** — Master System Logic, Terminal CLI Engine, VM Dispatcher & Feature Modules
- 🎨 **[style.css](./files/style_css.md)** — Glassmorphism Design Tokens, Custom Properties & UI Stylesheet
- 🖥️ **[electron/main.js](./files/electron_main_js.md)** — Native macOS Desktop Application Launcher & WebAuthn Bridge
- 💻 **[kernel/kernel.c](./files/kernel_c.md)** — Bare-Metal C Microkernel Entry Point, Memory Paging & System Descriptors
- ⚡ **[kernel/sel4_ipc.c & sel4_ipc.h](./files/sel4_ipc.md)** — Formally Verified Capability Gates & Synchronous IPC Dispatcher
- 🚀 **[kernel/boot.asm & linker.ld](./files/boot_asm.md)** — Multiboot x86_64 Assembly Bootloader & ELF Linker Script
- 🌐 **[kernel/xen_dom0.cfg](./files/xen_dom0.cfg.md)** — Xen Hypervisor Control Domain & Micro-VM Isolation Config
- 🐳 **[Dockerfile & docker-compose.yml](./files/docker_infrastructure.md)** — Read-Only Container Infrastructure & Microservices
- 🌐 **[nginx.conf & kong.yml](./files/network_gateways.md)** — Reverse Proxy Security Headers & Zero-Trust API Gateway Rules
- ⚡ **[Deployment & Flashing Scripts](./files/flashing_scripts.md)** — Smartphone Fastboot Flasher (`flash_phone.sh`), SD Card Flasher (`flash_sdxc.sh`), Docker Runner & Installer Scripts
- 🤖 **[Services, Config & Documentation](./files/services_and_config.md)** — ML Threat Hunter Sidecar, `package.json`, `README.md` & Compliance Audits
