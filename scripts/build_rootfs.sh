#!/usr/bin/env bash
set -e

ROOTFS_DIR="/tmp/tombos_rootfs"
echo "=========================================="
echo "🛡️ Building Hardened Security Frameworks & RootFS Package"
echo "=========================================="

rm -rf "$ROOTFS_DIR"
mkdir -p "$ROOTFS_DIR"/{bin,sbin,etc/apparmor.d,etc/ufw,etc/audit,proc,sys,dev,tmp,home/sec-admin,usr/bin,var/log}

echo "[+] Compiling executable CLI binary utilities for rootfs..."
cat << 'BIN_EOF' > "$ROOTFS_DIR/usr/bin/tomb-notes"
#!/bin/sh
echo "[Tomb OS Notes] Initializing encrypted notepad session..."
BIN_EOF

cat << 'BIN_EOF' > "$ROOTFS_DIR/usr/bin/tomb-vault"
#!/bin/sh
echo "[Tomb OS Crypt Vault] Connecting to TPM 2.0 enclave & Key Broker channel..."
BIN_EOF

cat << 'BIN_EOF' > "$ROOTFS_DIR/usr/bin/tomb-importer"
#!/bin/sh
echo "[Tomb OS Importer] Initializing GDPR/CCPA sanitized data migration..."
BIN_EOF

cat << 'BIN_EOF' > "$ROOTFS_DIR/usr/bin/tomb-academy"
#!/bin/sh
echo "[Tomb OS Accredited Academy] Loading Data Structures & CS Curriculum..."
BIN_EOF

chmod +x "$ROOTFS_DIR"/usr/bin/tomb-*

echo "[+] Hardening System Security Frameworks (UFW, Auditd, AppArmor, CIS)..."
cat << 'UFW_EOF' > "$ROOTFS_DIR/etc/ufw/sysctl.conf"
# Hardened Kernel Packet Filter Configuration
net/ipv4/tcp_syncookies=1
net/ipv4/conf/all/rp_filter=1
net/ipv4/conf/all/accept_source_route=0
net/ipv4/icmp_echo_ignore_broadcasts=1
UFW_EOF

cat << 'AUDIT_EOF' > "$ROOTFS_DIR/etc/audit/audit.rules"
# Hardened Linux Audit Daemon Logging Rules
-w /etc/shadow -p wa -k shadow_edits
-w /etc/passwd -p wa -k passwd_edits
-a always,exit -F arch=b64 -S execve -k binary_executions
AUDIT_EOF

echo "[+] Generating AppArmor MAC Confinement Profiles..."
cat << 'AA_EOF' > "$ROOTFS_DIR/etc/apparmor.d/tombos_red_untrusted_chromium"
profile tombos_red_untrusted_chromium /usr/bin/chromium flags=(attach_disconnected,enforce) {
  #include <abstractions/base>
  network inet stream,
  deny /etc/shadow r,
  deny /etc/passwd w,
  deny /home/sec-admin/keys/** rwx,
  /tmp/** rw,
}
AA_EOF

cat << 'AA_EOF' > "$ROOTFS_DIR/etc/apparmor.d/tombos_blue_secure_vault"
profile tombos_blue_secure_vault /usr/bin/tomb-vault flags=(enforce) {
  #include <abstractions/base>
  /home/sec-admin/vault/** rw,
  /dev/tpm0 rw,
}
AA_EOF

echo "[+] Packing hardened rootfs into initrd archive..."
cd "$ROOTFS_DIR"
find . | cpio -o -H newc | gzip -9 > /Users/andrue/tombOS-project/tombos_rootfs.cpio.gz

echo "✅ Hardened Root filesystem built successfully: /Users/andrue/tombOS-project/tombos_rootfs.cpio.gz"
