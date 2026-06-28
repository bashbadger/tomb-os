#!/usr/bin/env bash
# Enforce strict error handling, unset variable catching, and pipefailure monitoring
set -euo pipefail
IFS=$'\n\t'

# Define logging wrappers
log_info() { echo -e "\033[0;32m[INFO]\033[0m $1"; }
log_error() { echo -e "\033[0;31m[ERROR]\033[0m $1" >&2; }

# Establish deterministic cleanup trap
cleanup() {
  log_info "Executing cleanup tasks..."
  # Remove temporary ISO staging artifacts if they exist
  rm -rf /tmp/tombos_staging_* 2>/dev/null || true
}
trap cleanup EXIT ERR INT TERM

# Dependency Validation
for cmd in npm docker; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log_error "Required dependency '$cmd' is not installed. Aborting."
    exit 1
  fi
done

main() {
  log_info "Building the kernel and creating ISO..."
  ./kernel/build.sh

  log_info "Building Universal GrapheneOS integrations..."
  ./scripts/build_graphene.sh

  log_info "Packaging the ISO..."
  ./scripts/package.sh

  # Safely check if FLASH_DEVICE is set, utilizing quotes to prevent word splitting
  if [[ -n "${FLASH_DEVICE:-}" ]]; then
    log_info "Flashing ISO to ${FLASH_DEVICE}..."
    ./scripts/flash_sdxc.sh "$FLASH_DEVICE" "tombos_secure_amd64.iso"
  fi

  log_info "Build, package, and flash processes complete."
}

# Execute main logic block
main "$@"
