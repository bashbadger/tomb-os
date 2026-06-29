# 🤖 Autonomous Multi-Agent Mesh Execution & Deployment Guide

Tomb OS features an adaptive TypeScript multi-agent orchestration mesh consisting of 5 specialized autonomous agents:
- **OrchestratorAgent**: Master task coordinator and goal planner.
- **MemoryAgent**: Vector & graph persistent memory storage daemon.
- **LearningAgent**: User preference learning and adaptive behavior optimizer.
- **TaskAgent**: Autonomous background worker and script executor.
- **ImmuneSystemAgent**: Biological threat hunter monitoring RAM memory spaces.

---

## 🚀 1. Local Development & Execution

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Execution
```bash
# Navigate to the agents directory
cd agents

# Install dependencies
npm install

# Run in development mode with live TS execution
npm run dev

# Or build and execute compiled production JS
npm run build
npm start
```

---

## 🐳 2. Production Docker Microservice Deployment

To deploy the multi-agent mesh as a standalone, zero-trust read-only container:

```bash
# Build the agent mesh container image
docker build -t tombos-agent-mesh ./agents

# Run isolated container with restricted capabilities
docker run -d \
  --name tomb-agent-mesh \
  --restart unless-stopped \
  --read-only \
  --memory 512m \
  tombos-agent-mesh
```

---

## ⚙️ 3. Linux Systemd Background Service Deployment

To run the agent mesh as a persistent background daemon on Linux servers:

1. Create `/etc/systemd/system/tomb-agents.service`:
```ini
[Unit]
Description=Tomb OS Autonomous Multi-Agent Mesh Daemon
After=network.target

[Service]
Type=simple
User=tombos
WorkingDirectory=/opt/tombos/agents
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

2. Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable tomb-agents
sudo systemctl start tomb-agents
```
