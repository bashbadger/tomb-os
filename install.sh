#!/usr/bin/env bash
# Exit on error
set -e

# Determine install prefix
PREFIX="/usr/local"
TARGET_DIR="$PREFIX/share/tomb-os"
BIN_DIR="$PREFIX/bin"

# Ensure Node.js is installed
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Installing via package manager..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install node
  elif [[ -f /etc/debian_version ]]; then
    sudo apt-get update && sudo apt-get install -y nodejs npm
  elif [[ -f /etc/redhat-release ]]; then
    sudo dnf install -y nodejs npm
  else
    echo "Unsupported Linux distro. Install Node.js manually." && exit 1
  fi
fi

# Install serve globally
npm install -g serve

# Copy files
sudo mkdir -p "$TARGET_DIR"
sudo cp -r "$PWD"/* "$TARGET_DIR/"

# Create wrapper script
sudo tee "$BIN_DIR/tomb-os" > /dev/null <<'EOF'
#!/usr/bin/env bash
serve -s "$TARGET_DIR" -l 8080
EOF
sudo chmod +x "$BIN_DIR/tomb-os"

# Register systemd service (Linux only)
if [[ -f /run/systemd/system ]]; then
  SERVICE_FILE="/etc/systemd/system/tomb-os.service"
  sudo tee "$SERVICE_FILE" > /dev/null <<EOL
[Unit]
Description=Tomb-OS Hypervisor UI
After=network.target

[Service]
ExecStart=$BIN_DIR/tomb-os
Restart=always
User=root
Environment=PATH=/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=multi-user.target
EOL
  sudo systemctl daemon-reload
  sudo systemctl enable tomb-os.service
  sudo systemctl start tomb-os.service
fi

# macOS launchd plist (optional)
if [[ "$OSTYPE" == "darwin"* ]]; then
  PLIST="$HOME/Library/LaunchAgents/com.tombos.server.plist"
  cat > "$PLIST" <<EOL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.tombos.server</string>
  <key>ProgramArguments</key><array><string>$BIN_DIR/tomb-os</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>
EOL
  launchctl load "$PLIST"
fi

echo "Installation complete. Access the UI at http://localhost:8080"
