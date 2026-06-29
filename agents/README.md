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

---

## 🔌 4. Enterprise & Social Communication Integrations

Tomb OS agents support automated notification alerting, threat feeds, and workflow automation across various external platforms. Configure these options using environment variables when starting the agent mesh.

### 💬 Discord API Relay
To relay system alarms and intrusion logs directly to a Discord channel:
1. Go to your Discord server Settings -> Integrations -> Webhooks -> Create Webhook.
2. Copy the Webhook URL.
3. Start the agent with the environment variable:
   ```bash
   DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/xxxx/xxxx" npm start
   ```

### ✈️ Telegram Broadcast Bot
To broadcast post-quantum encrypted alerts to security admin channels:
1. Message `@BotFather` on Telegram to generate a new bot and obtain a Bot Token.
2. Add your bot to the target channel as an administrator.
3. Start the agent with:
   ```bash
   TELEGRAM_BOT_TOKEN="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ" TELEGRAM_CHAT_ID="-100xxxxxxx" npm start
   ```

### 🟢 WhatsApp Business API Integration
To send critical notification alerts directly to system owners via WhatsApp Business:
1. Set up a Meta Developer Account and create a WhatsApp Business App.
2. Retrieve your Temporary/Permanent Access Token and Phone Number ID.
3. Start the agent with:
   ```bash
   WHATSAPP_ACCESS_TOKEN="EAAGxx..." WHATSAPP_PHONE_NUMBER_ID="109xxxxxxxx" npm start
   ```

### 🟢 WeChat Enterprise & Mini Program Alerting
To dispatch alerts to enterprise WeChat networks (WeCom):
1. Register a WeCom corporate account and create an integration Bot.
2. Copy the Webhook Key from the Bot settings.
3. Run the service:
   ```bash
   WECHAT_WECOM_WEBHOOK="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxx-xxxx" npm start
   ```

### 📋 Jira Ticket Automation Linker
To auto-create high-priority bug reports when security anomalies are detected:
1. Generate an API Token from your Atlassian account security settings.
2. Provide target project key and credentials:
   ```bash
   JIRA_HOST="your-domain.atlassian.net" JIRA_EMAIL="admin@domain.com" JIRA_API_TOKEN="ATATT3xF..." JIRA_PROJECT_KEY="SEC" npm start
   ```

### ☘️ Clover POS Merchant API Webhooks
To monitor point-of-sale merchant networks and alert on transaction anomalies:
1. Create a Clover Developer Account and navigate to Webhooks under App Settings.
2. Mount the webhook endpoint pointing to your deployed agent API: `https://your-agent-domain.com/webhooks/clover`.
3. Set the Clover verification token:
   ```bash
   CLOVER_WEBHOOK_VERIFICATION_TOKEN="clover_sec_verify_key" npm start
   ```

### 🔴 Reddit NetSec Threat Feed client
To pull real-time threat intelligence and zero-day advisories from security subreddits:
1. Register a script application in Reddit App Preferences to obtain Client ID and Secret.
2. Start the client daemon:
   ```bash
   REDDIT_CLIENT_ID="your_client_id" REDDIT_CLIENT_SECRET="your_client_secret" REDDIT_USER_AGENT="tombOS:v1.0.0 (by /u/bashbadger)" npm start
   ```

### 🔵 Facebook Messenger Threads Integration
To interact with users and dispatch alert responses directly via Facebook Messenger threads:
1. Create a Facebook Page and register an App in Meta App Dashboard.
2. Under Messenger settings, generate a Page Access Token and configure a Webhook callback endpoint (`https://your-agent-domain.com/webhooks/messenger`).
3. Start the agent with the Meta credentials:
   ```bash
   FB_PAGE_ACCESS_TOKEN="EAAGxx..." FB_VERIFY_TOKEN="messenger_secret_verify_token" npm start
   ```

### 📸 Instagram Direct Messaging (DM) Threads
To listen and respond to security advisories and query status via Instagram DMs:
1. Link your Instagram Professional/Business Account to a Facebook Page.
2. Enable "Allow Access to Messages" in your Instagram Account Settings -> Privacy -> Messages.
3. Configure the webhook subscriptions for `instagram_messages` on your Meta App Dashboard.
4. Launch the agent mesh:
   ```bash
   INSTAGRAM_ACCOUNT_ID="178xxxxxxxxxx" INSTAGRAM_PAGE_ACCESS_TOKEN="EAAGxx..." INSTAGRAM_VERIFY_TOKEN="instagram_secret_verify_token" npm start
   ```

### 📹 Google Meet Scheduling & Integration
To auto-schedule and launch Google Meet video rooms for security incident war-rooms:
1. Go to Google Cloud Console, create a new project, and enable the Google Calendar API.
2. Create a Service Account, generate a JSON Key File, and place it in your workspace.
3. Share your calendar or grant domain-wide delegation permissions.
4. Launch the agent mesh:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS="/opt/tombos/agents/google-service-account.json" GOOGLE_MEET_ORGANIZER_EMAIL="admin@domain.com" npm start
   ```

### 📹 Zoom Meeting Scheduling & API
To auto-create Zoom meeting spaces and security war-rooms during critical threat incidents:
1. Register a Server-to-Server OAuth App in the Zoom App Marketplace.
2. Retrieve your Account ID, Client ID, and Client Secret.
3. Start the agent mesh with the credentials:
   ```bash
   ZOOM_ACCOUNT_ID="your_account_id" ZOOM_CLIENT_ID="your_client_id" ZOOM_CLIENT_SECRET="your_client_secret" npm start
   ```




