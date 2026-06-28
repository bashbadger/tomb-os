# 🛡️ Tomb OS Official Project Wiki & Master Architecture Scope

Welcome to the official technical wiki for **Tomb OS**, the world's most advanced hardened operating system and cybersecurity architecture.

---

## 🏛️ Project Vision & Architectural Scope
Tomb OS is engineered to eliminate the systemic vulnerabilities of conventional operating systems (telemetry backdoors, global state compromise, unisolated browser zero-days, and legacy RSA/ECC cryptographic degradation). It provides a formally verified, multi-tiered security enclave designed for researchers, financial institutions, and privacy-conscious users.

### 🎯 Core Mission: Maximum Security at Lowest Cost
Our guiding principle is to democratize elite cybersecurity defense: **provide the absolute best, formally verified security protection at the lowest financial cost.** 
- **Zero Licensing Fees**: 100% open-source software, removing expensive vendor lock-in and hardware appliance tax.
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

## 📱 Universal Cross-Platform Deployment

- **Native macOS App**: Compiled via Electron (`npm run dist`).
- **Hardened Docker Sandbox**: Read-only root filesystem container infrastructure (`./scripts/docker_run.sh`).
- **Bare-Metal x86_64 ISO**: Bootable OS image (`tombos_secure_amd64.iso`).
- **Live SD XC / NVMe Drive**: Portable bootable media flasher (`./scripts/flash_sdxc.sh`).
- **Universal Smartphone Mobile GSI**: Project Treble GrapheneOS integration (`./scripts/flash_phone.sh`).
