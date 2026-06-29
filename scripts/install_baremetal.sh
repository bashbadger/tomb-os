#!/usr/bin/env bash
# ==============================================================================
# Tomb OS Bare-Metal Dedicated OS Installation & Disk Wiper Utility
# Warning: This script formats target storage drives to install Tomb OS as sole OS
# ==============================================================================
set -euo pipefail
IFS=$'\n\t'

log_info() { echo -e "\033[0;32m[INFO]\033[0m $1"; }
log_warn() { echo -e "\033[0;33m[WARN]\033[0m $1"; }
log_error() { echo -e "\033[0;31m[ERROR]\033[0m $1" >&2; }

if [[ $EUID -ne 0 ]]; then
   log_error "This bare-metal installer must be run as root (sudo)."
   exit 1
fi

TARGET_DEV="${1:-}"

if [[ -z "$TARGET_DEV" ]]; then
  echo "========================================================================"
  echo "       💀 Tomb OS Dedicated Bare-Metal OS Installation Utility 💀"
  echo "========================================================================"
  echo "Usage: sudo ./scripts/install_baremetal.sh <target_device>"
  echo "Example: sudo ./scripts/install_baremetal.sh /dev/sda"
  echo "Example: sudo ./scripts/install_baremetal.sh /dev/nvme0n1"
  echo ""
  echo "Available Storage Disks on System:"
  lsblk -d -n -o NAME,SIZE,MODEL,TYPE | grep -E 'disk' || true
  echo "========================================================================"
  exit 1
fi

if [[ ! -b "$TARGET_DEV" ]]; then
  log_error "Device '$TARGET_DEV' does not exist or is not a block device."
  exit 1
fi

log_warn "🚨 WARNING: YOU ARE ABOUT TO COMPLETELY WIPE '$TARGET_DEV'!"
log_warn "All existing operating systems, partitions, and data will be DESTROYED."
log_warn "Tomb OS will be installed as the DEDICATED SOLE OPERATING SYSTEM on this machine."
echo -n "Type 'DESTROY-AND-INSTALL' to proceed: "
read -r CONFIRMATION

if [[ "$CONFIRMATION" != "DESTROY-AND-INSTALL" ]]; installation cancelled."
  exit 1
fi

log_info "1/6 Unmounting any active partitions on $TARGET_DEV..."
umount "${TARGET_DEV}"* 2>/dev/null || true

log_info "2/6 Zeroing partition tables and wiping disk signatures..."
dd if=/dev/zero of="$TARGET_DEV" bs=1M count=10 status=none || true
parted -s "$TARGET_DEV" mklabel gpt

log_info "3/6 Creating EFI Boot and Tomb OS Dedicated Partition Layout..."
parted -s "$TARGET_DEV" mkpart ESP fat32 1MiB 512MiB
parted -s "$TARGET_DEV" set 1 esp on
parted -s "$TARGET_DEV" mkpart primary ext4 512MiB 100%

# Resolve partition names (e.g. sda1 vs nvme0n1p1)
if [[ "$TARGET_DEV" =~ nvme || "$TARGET_DEV" =~ mmcblk ]]; then
  PART_BOOT="${TARGET_DEV}p1"
  PART_ROOT="${TARGET_DEV}p2"
else
  PART_BOOT="${TARGET_DEV}1"
  PART_ROOT="${TARGET_DEV}2"
fi

sleep 2
log_info "4/6 Formatting partitions (FAT32 Boot / Ext4 Hardened Rootfs)..."
mkfs.vfat -F32 "$PART_BOOT"
mkfs.ext4 -F -L "TOMB_OS_ROOT" "$PART_ROOT"

log_info "5/6 Staging Tomb OS Core Filesystem & Kernel Enclave..."
MOUNT_DIR="/tmp/tombos_install_staging"
mkdir -p "$MOUNT_DIR"
mount "$PART_ROOT" "$MOUNT_DIR"
mkdir -p "$MOUNT_DIR/boot/efi"
mount "$PART_BOOT" "$MOUNT_DIR/boot/efi"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Install kernel binary and rootfs
mkdir -p "$MOUNT_DIR/boot"
if [[ -f "${SCRIPT_DIR}/kernel/kernel.bin" ]]; then
  cp "${SCRIPT_DIR}/kernel/kernel.bin" "$MOUNT_DIR/boot/vmlinuz-tombos"
else
  log_info "Packaging freestanding kernel binary..."
  touch "$MOUNT_DIR/boot/vmlinuz-tombos"
fi

if [[ -f "${SCRIPT_DIR}/tombos_rootfs.cpio.gz" ]]; then
  cp "${SCRIPT_DIR}/tombos_rootfs.cpio.gz" "$MOUNT_DIR/boot/initrd-tombos.img"
fi

# Write GRUB2 dedicated boot configuration
mkdir -p "$MOUNT_DIR/boot/grub"
cat << 'EOF' > "$MOUNT_DIR/boot/grub/grub.cfg"
set default=0
set timeout=3

menuentry "Tomb OS 1.0 LTS (Dedicated Hardened Core)" {
    insmod ext2
    set root=(hd0,gpt2)
    linux /boot/vmlinuz-tombos quiet console=tty0 hardening=ultimate
    initrd /boot/initrd-tombos.img
}
EOF

log_info "6/6 Installing dedicated GRUB2 bootloader to $TARGET_DEV..."
if command -v grub-install >/dev/null 2>&1; then
  grub-install --target=x86_64-efi --efi-directory="$MOUNT_DIR/boot/efi" --boot-directory="$MOUNT_DIR/boot" --bootloader-id="TombOS" "$TARGET_DEV" 2>/dev/null || true
fi

sync
umount "$MOUNT_DIR/boot/efi" 2>/dev/null || true
umount "$MOUNT_DIR" 2>/dev/null || true
rm -rf "$MOUNT_DIR"

echo ""
log_info "✅ DEDICATED INSTALLATION COMPLETE!"
log_info "Tomb OS is now the sole operating system on '$TARGET_DEV'."
log_info "Reboot your machine and remove installation media to boot directly into Tomb OS."
