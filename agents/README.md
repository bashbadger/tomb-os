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

### 💬 Slack Incoming Webhooks
To push notifications and security summaries to Slack channels:
1. Create a Slack App in your workspace and enable Incoming Webhooks.
2. Generate and copy the Webhook URL for the target channel.
3. Start the agent:
   ```bash
   SLACK_WEBHOOK_URL="https://hooks.slack.com/services/Txxx/Bxxx/xxxx" npm start
   ```

### 💬 Microsoft Teams Incoming Webhooks
To relay logs and alerts into MS Teams channels:
1. Add the "Incoming Webhook" connector to your Microsoft Teams channel.
2. Copy the generated Webhook URL.
3. Launch the agent:
   ```bash
   TEAMS_WEBHOOK_URL="https://yourdomain.webhook.office.com/webhookb2/xxxx" npm start
   ```

### 💬 Google Chat Webhook Integration
To send messages to Google Chat Spaces:
1. Open the target Space, click Space Settings -> Apps & Integrations -> Webhooks.
2. Add a new webhook and copy its URL.
3. Start the agent:
   ```bash
   GOOGLE_CHAT_WEBHOOK_URL="https://chat.googleapis.com/v1/spaces/xxxx/webhooks/xxxx" npm start
   ```

### 💬 Twist Integration
To post security logs as Twist threads:
1. Add a Twist Integration to your target Twist channel.
2. Copy the Twist Webhook URL.
3. Start the agent:
   ```bash
   TWIST_WEBHOOK_URL="https://twist.com/api/v1/integration/incoming_webhook/xxxx" npm start
   ```

### 💬 Basecamp Chatbot Integration
To post automated updates to a Basecamp campfire:
1. In the target Basecamp project Campfire, click Set Up Chatbot.
2. Copy the Chatbot URL.
3. Start the agent:
   ```bash
   BASECAMP_WEBHOOK_URL="https://3.basecamp.com/xxxx/integrations/xxxx/buckets/xxxx/chats/xxxx/lines" npm start
   ```

### 💬 Mattermost Webhooks
To dispatch threat response notifications into Mattermost channels:
1. Go to Mattermost -> Integrations -> Incoming Webhook -> Add Incoming Webhook.
2. Copy the Webhook URL.
3. Launch the agent:
   ```bash
   MATTERMOST_WEBHOOK_URL="https://your-mattermost.com/hooks/xxxx" npm start
   ```

### 💬 Rocket.Chat Webhooks
To post logs directly to Rocket.Chat rooms:
1. Go to Rocket.Chat -> Administration -> Integrations -> New Integration -> Incoming Webhook.
2. Copy the Webhook URL.
3. Launch the agent:
   ```bash
   ROCKETCHAT_WEBHOOK_URL="https://your-rocketchat.com/hooks/xxxx" npm start
   ```

### 💬 Wire Messenger Bot
To send end-to-end encrypted alert messages over Wire:
1. Register a developer bot on the Wire Developer Portal.
2. Obtain your Bot Token and Bot ID.
3. Launch the agent:
   ```bash
   WIRE_BOT_TOKEN="wire_token_xxxx" WIRE_BOT_ID="wire_id_xxxx" npm start
   ```

### 🔐 AWS Wickr Enterprise Bot
To dispatch secure, zero-trust notifications over AWS Wickr:
1. Create a Wickr Bot account inside AWS Wickr Admin Console.
2. Generate client token and config files.
3. Start the agent:
   ```bash
   WICKR_BOT_TOKEN="aws_wickr_token_xxxx" WICKR_KEY_PATH="/opt/tombos/wickr_keys.json" npm start
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

### 💬 Apple iMessage (macOS Daemon / BlueBubbles Bridge)
Since Apple iMessage lacks a direct public HTTP API, agents interface via macOS AppleScript polling of the local messages SQLite database or through a BlueBubbles server bridge API:
1. **Option A: Local macOS Daemon (SQLite chat.db)**:
   - Provide read access to `~/Library/Messages/chat.db` (Full Disk Access permission on macOS host) to listen for incoming messages.
   - Start the agent:
     ```bash
     IMESSAGE_SQLITE_PATH="/Users/tombos/Library/Messages/chat.db" npm start
     ```
2. **Option B: BlueBubbles API Gateway**:
   - Install the BlueBubbles server on an active macOS host to act as a bridge.
   - Provide your BlueBubbles server URL and API password:
     ```bash
     BLUEBUBBLES_SERVER_URL="http://192.168.1.15:8567" BLUEBUBBLES_PASSWORD="your_secure_password" npm start
     ```

### 💬 Signal Private Messenger Integration
Signal requires a local helper daemon (like `signal-cli` or `signal-cli-rest-api`) running as an HTTP REST bridge on your server:
1. **Run the Signal REST API container**:
   ```bash
   docker run -d \
     --name signal-api \
     -p 8080:8080 \
     -v ~/.local/share/signal-cli:/var/lib/signal-cli \
     bbernhard/signal-cli-rest-api:latest
   ```
2. **Register/Link your Signal account** via the REST API endpoint (refer to signal-cli docs to link as a secondary device).
3. **Configure the agent** with the Signal REST API endpoints:
   ```bash
   SIGNAL_API_URL="http://localhost:8080" SIGNAL_SENDER_NUMBER="+1234567890" SIGNAL_RECIPIENT_NUMBER="+1987654321" npm start
   ```

### 💬 Snapchat Business Messaging API
To schedule and broadcast updates to your Snapchat business subscriber feeds:
1. Go to Snapchat Business Manager -> Developer Portal -> Create App.
2. Obtain your Client ID and Client Secret.
3. Start the agent:
   ```bash
   SNAPCHAT_CLIENT_ID="snap_client_id_xxxx" SNAPCHAT_CLIENT_SECRET="snap_secret_xxxx" npm start
   ```

### 💬 Tencent QQ Messenger API
To broadcast system telemetry summaries to QQ groups:
1. Register an open application at the Tencent Open Platform.
2. Retrieve your App ID and App Key.
3. Start the agent:
   ```bash
   QQ_APP_ID="qq_appid_xxxx" QQ_APP_KEY="qq_appkey_xxxx" npm start
   ```

### 💬 Viber Business Bot
To dispatch automated Viber message alerts:
1. Go to Viber Admin Panel -> Create Bot Account.
2. Copy your Viber Bot API Token.
3. Start the agent:
   ```bash
   VIBER_BOT_TOKEN="viber_token_xxxx" npm start
   ```

### 💬 Line Messaging API
To trigger messages to Line users and groups:
1. Register a developer account at Line Developers Console.
2. Under Messaging API settings, generate a Channel Access Token and obtain the Channel Secret.
3. Start the agent:
   ```bash
   LINE_CHANNEL_ACCESS_TOKEN="line_token_xxxx" LINE_CHANNEL_SECRET="line_secret_xxxx" npm start
   ```

### 💬 Skype Bot (Microsoft Bot Framework)
To relay system alarms into Skype group chats:
1. Go to Azure Portal -> Bot Services -> Register a new Skype Bot.
2. Copy the App ID and App Password.
3. Start the agent:
   ```bash
   SKYPE_APP_ID="skype_appid_xxxx" SKYPE_APP_PASSWORD="skype_apppass_xxxx" npm start
   ```

### 💬 Session Messenger (Decentralized Onion Network)
Session uses decentralized onion routing. To send alerts over Session:
1. Establish a connection to a local/remote Session public swarm node.
2. Start the daemon with the target Session ID:
   ```bash
   SESSION_NODE_URL="http://localhost:2856" SESSION_RECIPIENT_ID="05xxxxxxxx..." npm start
   ```

### 💬 Briar Messenger (Tor Onion Service API)
Briar runs over local Tor connections. To communicate with Briar:
1. Enable the Briar REST API in your Briar desktop/mobile client settings.
2. Copy the auth token and local Tor endpoint.
3. Start the agent:
   ```bash
   BRIAR_API_URL="http://localhost:8082" BRIAR_AUTH_TOKEN="briar_secret_token" npm start
   ```

### 💬 Pumble Chat Webhooks
To dispatch threat updates into Pumble channels:
1. Navigate to Pumble Workspace Administration -> Integrations -> Incoming Webhooks.
2. Add a new integration and copy the Webhook URL.
3. Launch the agent:
   ```bash
   PUMBLE_WEBHOOK_URL="https://api.pumble.com/workspaces/xxxx/webhooks/xxxx" npm start
   ```

### 💬 Chanty Webhooks
To broadcast security logs to Chanty team spaces:
1. Open Chanty -> Manage Integrations -> Webhooks.
2. Generate a custom Webhook URL.
3. Start the agent:
   ```bash
   CHANTY_WEBHOOK_URL="https://api.chanty.com/webhooks/xxxx" npm start
   ```

### 💬 Element & Matrix Client-Server API
To relay alerts into Matrix end-to-end encrypted rooms via Element:
1. Create a Matrix bot account on your homeserver (e.g., matrix.org).
2. Retrieve the Access Token and the target Room ID.
3. Launch the agent:
   ```bash
   MATRIX_HOMESERVER_URL="https://matrix.org" MATRIX_ACCESS_TOKEN="matrix_token_xxxx" MATRIX_ROOM_ID="!room_id:matrix.org" npm start
   ```

### 💬 Freshchat Web SDK API
To trigger automated agent chat sessions over Freshchat:
1. Go to Freshchat Admin settings -> API Tokens.
2. Generate an API Key and copy your App ID.
3. Start the agent:
   ```bash
   FRESHCHAT_APP_ID="fresh_appid_xxxx" FRESHCHAT_API_KEY="fresh_key_xxxx" npm start
   ```

### 💬 Wimi Project Webhooks
To publish incident reporting status directly to Wimi spaces:
1. Go to Wimi Admin settings -> Integrations -> Webhooks.
2. Set the target room endpoint URL.
3. Start the agent:
   ```bash
   WIMI_WEBHOOK_URL="https://your-wimi-workspace.wimi.pro/api/webhooks/xxxx" npm start
   ```

### 💬 Brosix Private Communication Network
To relay alerts over Brosix enterprise lines:
1. Log into your Brosix Web Control Panel and generate an API Integration Key.
2. Start the service:
   ```bash
   BROSIX_API_KEY="brosix_key_xxxx" npm start
   ```

### 💬 Ryver Enterprise Chat Webhooks
To push real-time threat analysis directly to Ryver forum channels:
1. Go to Ryver Admin settings -> Integrations -> Inbound Webhooks.
2. Copy the Webhook URL.
3. Start the agent:
   ```bash
   RYVER_WEBHOOK_URL="https://your-ryver-org.ryver.com/api/webhooks/xxxx" npm start
   ```

### 💬 Flock Chat Webhooks
To push automated summaries to Flock chat channels:
1. Go to Flock Admin panel -> Integrations -> Incoming Webhooks.
2. Copy the Webhook URL.
3. Launch the agent:
   ```bash
   FLOCK_WEBHOOK_URL="https://api.flock.com/hooks/xxxx" npm start
   ```

### 💬 Zangi Business Messaging API
To relay high-priority voice/text alert pings over Zangi private networks:
1. Register for a Zangi Business Account.
2. Generate your API Key and Secret parameters.
3. Start the service:
   ```bash
   ZANGI_API_KEY="zangi_key_xxxx" ZANGI_API_SECRET="zangi_secret_xxxx" npm start
   ```

---

## 🔌 5. Generic Custom Webhook API Structure

To connect **any custom platform, application, or webhook provider** to the Tomb OS Multi-Agent Mesh, use our standardized generic endpoint. This structure allows anybody to integrate new channels without modifying agent codebase logic.

### 🌐 Webhook Endpoint Specifications

* **Endpoint URL**: `https://your-agent-domain.com/webhooks/generic`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <your_agent_api_token>`

### 📥 Request Body Schema (JSON)
```json
{
  "channelId": "string (optional - identifies the origin platform, e.g. Slack, Matrix)",
  "senderId": "string (required - uniquely identifies the user sending the query)",
  "messageText": "string (required - the query text to process)",
  "metadata": {
    "key": "value"
  }
}
```

### 📤 Response Body Schema (JSON)
```json
{
  "status": "success",
  "responseText": "string (the direct processing response generated by the OrchestratorAgent)"
}
```

### 💻 Sample curl Implementation
```bash
curl -X POST https://your-agent-domain.com/webhooks/generic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer my_secret_token_123" \
  -d '{
    "channelId": "custom-app",
    "senderId": "user_4901",
    "messageText": "Check active TPM key validation logs"
  }'
```

---

## 📶 6. Offline Capabilities & Network Sync Manager

Tomb OS is engineered for maximum resilience under network-constrained, air-gapped, or zero-connectivity scenarios. The agent mesh runs completely offline, caching events locally and utilizing local hardware models.

### 💾 Local SQLite / Outbox Cache (`local_outbox.json`)
If Wi-Fi or Ethernet connectivity is lost:
1. All outgoing alerts and chat updates are intercepted by the `NetworkSyncStore` class.
2. Messages are serialized and saved locally to the persistent outbox store at `agents/data/local_outbox.json`.
3. System memory is secured, preventing data loss during extended blackouts.

### 🤖 Local AI Model Fallback (Ollama / Llama3)
When cloud LLM API servers are unreachable:
1. The orchestrator automatically routes prompt inference queries to a locally hosted Ollama server or local ONNX inference engine.
2. To enable local fallback:
   - Ensure Ollama is running locally: `ollama run llama3`
   - Start the agent mesh with the fallback flag:
     ```bash
     OFFLINE_FALLBACK_URL="http://localhost:11434" OFFLINE_MODEL="llama3" npm start
     ```

### 📶 Wi-Fi Restored Synchronization
Once internet connectivity is restored:
1. The network sync daemon automatically detects a live connection.
2. The local outbox cache is systematically read and sent sequentially to the target webhooks (Slack, MS Teams, Google Chat, Discord, etc.).
3. Once successfully delivered, cached items are securely scrubbed from local storage.

---

## 📶 7. Cellular Backup Alerting (Twilio SMS/MMS)

To guarantee message delivery when localized Wi-Fi or Ethernet internet connects fail but cellular towers are operational, configure the **Twilio SMS Outbound gateway** as a fallback mechanism:

1. Register a Twilio Developer Account and acquire a Twilio Cellular Phone Number.
2. Retrieve your Account SID and Auth Token.
3. Launch the agent with the cellular configuration parameters:
   ```bash
   TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxx" TWILIO_AUTH_TOKEN="your_auth_token" TWILIO_PHONE_NUMBER="+1234567890" CELLULAR_ALERT_RECIPIENT="+1987654321" npm start
   ```

---

## ☁️ 8. Cloud Hosting & High-Availability Deployment

To deploy the Tomb OS Agent mesh as a highly available, persistent cloud microservice:

### ☁️ AWS (Amazon Web Services) ECS / Fargate
Deploy the Docker container serverless on AWS ECS without managing server nodes:
1. Push the container to AWS ECR:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com
   docker tag tombos-agent-mesh:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/tombos-agent-mesh:latest
   docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/tombos-agent-mesh:latest
   ```
2. Create an ECS Task Definition utilizing the image and set appropriate memory/CPU sizes (e.g. 0.5 vCPU and 1GB RAM) with secure secret parameters for platform tokens.

### ☁️ GCP (Google Cloud Platform) Cloud Run
Run the agent mesh serverless in GCP:
1. Deploy directly to Cloud Run:
   ```bash
   gcloud run deploy tomb-agent-mesh \
     --image gcr.io/<gcp_project_id>/tombos-agent-mesh \
     --platform managed \
     --allow-unauthenticated \
     --region us-central1
   ```

### ☁️ Azure Container Instances (ACI)
Quickly launch container groups on Azure:
```bash
az container create \
  --resource-group tombosGroup \
  --name tomb-agent-mesh \
  --image <registry_url>/tombos-agent-mesh:latest \
  --cpu 1 \
  --memory 1.5 \
  --environment-variables NODE_ENV=production
```

---

## 🔌 9. Cross-Platform Message Relays (e.g., Discord ↔ Snapchat)

Tomb OS features a highly configurable message routing router (`CrossPlatformRelay`). This component enables incoming messages from one platform (e.g., Discord) to be automatically processed by the agents and forwarded to another platform (e.g., Snapchat) or vice versa.

### ⚙️ How It Works
1. When a message is received at a configured webhook (e.g., Discord webhook stream), the source agent intercepts the message.
2. The `CrossPlatformRelay` checks if the relay config is active.
3. If active, it invokes the target API client (using the target platform's configured tokens) to re-transmit/relay the message payloads to the destination thread.

### 🚀 Configuration Environment Variables

To activate a specific cross-platform relay channel, start the agent mesh with the following environment configurations:

* **Enable Relay**: `RELAY_ENABLED="true"`
* **Source Platform**: `RELAY_SOURCE="discord"` (Supported: `discord`, `whatsapp`, `signal`, `imessage`, `slack`, etc.)
* **Destination Platform**: `RELAY_DEST="snapchat"` (Supported: `snapchat`, `telegram`, `wechat`, `teams`, etc.)

### 💻 Start Daemon Commands

* **Relay from Discord to Snapchat**:
  ```bash
  RELAY_ENABLED="true" RELAY_SOURCE="discord" RELAY_DEST="snapchat" DISCORD_WEBHOOK_URL="https://discord.com/..." SNAPCHAT_CLIENT_ID="xxx" SNAPCHAT_CLIENT_SECRET="xxx" npm start
  ```

* **Relay from Snapchat to Discord**:
  ```bash
  RELAY_ENABLED="true" RELAY_SOURCE="snapchat" RELAY_DEST="discord" SNAPCHAT_CLIENT_ID="xxx" SNAPCHAT_CLIENT_SECRET="xxx" DISCORD_WEBHOOK_URL="https://discord.com/..." npm start
  ```

---

## 🤖 10. Large Language Model (LLM) Engine Integrations

Tomb OS utilizes state-of-the-art LLMs to power the autonomous multi-agent mesh planning, code analysis, and system auditing processes. Configure your preferred model engine using the credentials below.

### ♊ Google Gemini API (Recommended)
Excellent for quick tool calling, multi-agent mesh coordination, and complex planning logic:
1. Obtain an API Key from Google AI Studio.
2. Launch the agent mesh:
   ```bash
   LLM_PROVIDER="gemini" GEMINI_API_KEY="AIzaSy..." GEMINI_MODEL="gemini-1.5-pro" npm start
   ```

### 🦉 Anthropic Claude API
Recommended for safety verification, security heuristics, and reviewing code before promoting it from the isolated VM sandbox to the core system:
1. Obtain an API Key from Anthropic Console.
2. Launch the agent mesh:
   ```bash
   LLM_PROVIDER="anthropic" ANTHROPIC_API_KEY="sk-ant-..." ANTHROPIC_MODEL="claude-3-5-sonnet" npm start
   ```

### 🧠 OpenAI Codex / GPT API
Recommended for raw code auto-generation, system patching, and microkernel scripting:
1. Obtain an API Key from OpenAI Platform.
2. Launch the agent mesh:
   ```bash
   LLM_PROVIDER="openai" OPENAI_API_KEY="sk-proj-..." OPENAI_MODEL="gpt-4o" npm start
   ```











