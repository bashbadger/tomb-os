#!/bin/bash
# Tomb OS Kernel Compilation and Assembly Automator
# Verifies build compartments and compiles physical x86 operating system files together.

set -e

echo "=== Tomb OS Kernel Build Automator ==="
echo "Checking build environment compartments..."

MISSING_DEPS=false

# Check assembler
if ! command -v nasm &> /dev/null; then
    echo "[-] Error: 'nasm' assembler is not installed."
    MISSING_DEPS=true
else
    echo "[+] Found nasm: $(nasm --version | head -n 1)"
fi

# Check cross-compiler
if ! command -v i386-elf-gcc &> /dev/null; then
    # Fallback check for standard gcc/clang with 32-bit target
    if ! command -v gcc &> /dev/null && ! command -v clang &> /dev/null; then
        echo "[-] Error: No C compiler found (i386-elf-gcc, gcc, or clang)."
        MISSING_DEPS=true
    else
        echo "[!] Warning: 'i386-elf-gcc' cross-compiler not found. Falling back to host compiler (limited compatibility on macOS)."
    fi
else
    echo "[+] Found i386-elf-gcc: $(i386-elf-gcc --version | head -n 1)"
fi

# Check emulator
if ! command -v qemu-system-i386 &> /dev/null; then
    echo "[!] Warning: 'qemu-system-i386' emulator is not installed (needed to run the kernel)."
else
    echo "[+] Found QEMU: $(qemu-system-i386 --version | head -n 1)"
fi

if [ "$MISSING_DEPS" = true ]; then
    echo ""
    echo "[!] Missing core compilation dependencies."
    echo "To compile the x86 bare-metal kernel compartments on macOS, please run:"
    echo "    brew install nasm i386-elf-gcc qemu"
    echo ""
    exit 1
fi

echo "[+] Environment verified. Assembling and compiling compartments..."
make clean
make
echo "[+] Assembly completed successfully! Created: kernel.bin"
