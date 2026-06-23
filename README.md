# Tomb OS: Hardened Security Simulator & Bootable Kernel Core

Welcome to **Tomb OS**, a dual‑layer operating‑system project featuring a bootable kernel and a web‑based desktop simulator.

---

## 📂 Project Structure

```
tomb-os/
├── index.html         # Desktop simulator markup
├── style.css          # Styling and layout
├── app.js             # Core UI logic
├── package.json       # Project configuration
├── .gitignore         # Ignored files
└── kernel/            # Bare‑metal kernel source
    ├── boot.asm       # Bootloader
    ├── kernel.c       # Kernel implementation
    ├── linker.ld      # Memory layout
    ├── build.sh       # Build helper script
    └── Makefile       # Build rules
```

---

## 🌐 Layer 1: Desktop Simulator (Web)

The web dashboard provides an interactive desktop environment optimized for both desktop browsers and touch devices.

### Features
1. Application windows are organized within visual zones.
2. Remote terminal access is available.
3. System transactions generate integrity hashes.
4. Automatic update module for optional components.
5. Interactive teaching interface for automation rules.

### How to Run Locally

Install the development dependencies:
```bash
npm install
```
Start the Vite development server:
```bash
npm run dev
```

### 📱 Testing from your Phone
Vite will display a local and network URL. Connect your phone to the same network and open the network URL in a browser.

---

## 💻 Layer 2: Bootable x86 Minimal Kernel (Bare Metal)

Located in the `kernel/` folder, this is a simple C/Assembly kernel that boots on virtual hardware.

### Step 1: Install Build Toolchains
On macOS, install the required tools using Homebrew:
```bash
brew install nasm i386-elf-gcc qemu
```

### Step 2: Compile the Binaries
```bash
cd kernel
make
```

### Step 3: Run inside QEMU
```bash
make run
```

### Step 4: Build a Bootable ISO Image
```bash
make iso
```
*(Requires `grub-mkrescue` and `xorriso`.)*
