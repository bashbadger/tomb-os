#!/usr/bin/env bash

# tombOS Master Installer
# This script builds the tombOS image using Buildroot and allows the user to
# select which development packages/services to include (individual packages
# or all).
#
# Usage examples:
#   ./install.sh                # builds with all packages (default)
#   ./install.sh --packages=git,python3,nodejs
#   ./install.sh --packages=all

set -euo pipefail

#--- Configuration ----------------------------------------------------------
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.. && pwd)"
BUILDROOT_DIR="$WORKSPACE_DIR/buildroot"
OVERLAY_DIR="$WORKSPACE_DIR/overlay"
OUTPUT_DIR="$WORKSPACE_DIR/output"
DEFCONFIG_PATH="$WORKSPACE_DIR/configs/tombos_defconfig"
RELEASE_DIR="$WORKSPACE_DIR/release"
# -------------------------------------------------------------------------

# List of all supported packages (as they appear in the Buildroot defconfig)
ALL_PACKAGES=(
  git
  vscodium
  python3
  nodejs
  gcc13
  openjdk
  chromium
  mysql_client
  postgresql
  mongodb
  redis
  cassandra
  sqlite
  ceph
)

# Helper: display usage
function usage() {
  echo "Usage: $0 [--packages=comma,separated,list|all]"
  echo "If omitted, all packages are included."
  exit 1
}

# Parse arguments
SELECTED_PACKAGES=(${ALL_PACKAGES[@]})  # default to all
if [[ $# -gt 0 ]]; then
  for arg in "$@"; do
    case $arg in
      --packages=*)
        pkgs="${arg#--packages=}"
        if [[ "$pkgs" == "all" ]]; then
          SELECTED_PACKAGES=(${ALL_PACKAGES[@]})
        else
          IFS=',' read -ra SELECTED_PACKAGES <<< "$pkgs"
        fi
        ;;
      -h|--help) usage ;;
      *) echo "Unknown argument: $arg"; usage ;;
    esac
  done
fi

# Ensure required tools are available
command -v make >/dev/null 2>&1 || { echo "make is required but not installed"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "git is required but not installed"; exit 1; }

# Clean previous output if any
if [[ -d "$OUTPUT_DIR" ]]; then
  echo "Cleaning previous output..."
  rm -rf "$OUTPUT_DIR"
fi
mkdir -p "$OUTPUT_DIR"

# Generate a temporary defconfig that enables only the selected packages
# Copy base defconfig then enable/disable entries.
TMP_DEFCONFIG="$OUTPUT_DIR/tmp_defconfig"
cp "$DEFCONFIG_PATH" "$TMP_DEFCONFIG"
# First, disable all known package options
for pkg in "${ALL_PACKAGES[@]}"; do
  case $pkg in
    gcc13) opt="BR2_TOOLCHAIN_BUILDROOT_GCC" ;;
    mysql_client) opt="BR2_PACKAGE_MYSQL_CLIENT" ;;
    postgresql) opt="BR2_PACKAGE_POSTGRESQL" ;;
    sqlite) opt="BR2_PACKAGE_SQLITE" ;;
    redis) opt="BR2_PACKAGE_REDIS" ;;
    cassandra) opt="BR2_PACKAGE_APACHE_CASSANDRA" ;;
    mongodb) opt="BR2_PACKAGE_MONGODB" ;;
    vscodium) opt="BR2_PACKAGE_VSCODIUM" ;;
    chromium) opt="BR2_PACKAGE_CHROMIUM" ;;
    openjdk) opt="BR2_PACKAGE_OPENJDK" ;;
    python3) opt="BR2_PACKAGE_PYTHON3" ;;
    nodejs) opt="BR2_PACKAGE_NODEJS" ;;
    git) opt="BR2_PACKAGE_GIT" ;;
    *) opt="" ;;
  esac
  if [[ -n "$opt" ]]; then
    # Disable by ensuring no "=y" line exists
    sed -i "/^${opt}=y/d" "$TMP_DEFCONFIG"
  fi
done
# Now enable the selected packages
for sel in "${SELECTED_PACKAGES[@]}"; do
  case $sel in
    gcc13) opt="BR2_TOOLCHAIN_BUILDROOT_GCC" ;;
    mysql_client) opt="BR2_PACKAGE_MYSQL_CLIENT" ;;
    postgresql) opt="BR2_PACKAGE_POSTGRESQL" ;;
    sqlite) opt="BR2_PACKAGE_SQLITE" ;;
    redis) opt="BR2_PACKAGE_REDIS" ;;
    cassandra) opt="BR2_PACKAGE_APACHE_CASSANDRA" ;;
    mongodb) opt="BR2_PACKAGE_MONGODB" ;;
    vscodium) opt="BR2_PACKAGE_VSCODIUM" ;;
    chromium) opt="BR2_PACKAGE_CHROMIUM" ;;
    openjdk) opt="BR2_PACKAGE_OPENJDK" ;;
    python3) opt="BR2_PACKAGE_PYTHON3" ;;
    nodejs) opt="BR2_PACKAGE_NODEJS" ;;
    git) opt="BR2_PACKAGE_GIT" ;;
    *) echo "Warning: unknown package $sel – skipping"; continue ;;
  esac
  echo "${opt}=y" >> "$TMP_DEFCONFIG"
done

# Build tombOS using Buildroot with the temporary defconfig
cd "$BUILDROOT_DIR"
make O="$OUTPUT_DIR" BR2_EXTERNAL="$OVERLAY_DIR" "${TMP_DEFCONFIG##*/}"  # Use file name as config target
make O="$OUTPUT_DIR"

# Package the resulting images (ISO, IMG, DMG) if they exist
if [[ -d "$OUTPUT_DIR/images" ]]; then
  mkdir -p "$RELEASE_DIR"
  for img in "$OUTPUT_DIR/images"/*.{iso,img,dmg}; do
    [ -e "$img" ] && cp "$img" "$RELEASE_DIR/"
  done
  echo "Artifacts are available in $RELEASE_DIR"
else
  echo "No image directory found – build may have failed."
fi

echo "Installer finished successfully."
