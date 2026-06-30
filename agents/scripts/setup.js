const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const config = {};

console.log("==================================================");
console.log("      Tomb OS Agent Mesh Interactive Setup        ");
console.log("==================================================\n");

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function runSetup() {
  // 1. LLM Provider Setup
  console.log("--- 1. LLM Provider Configuration ---");
  const provider = await askQuestion("Select LLM Provider (gemini / anthropic / openai / offline) [gemini]: ");
  config.LLM_PROVIDER = provider.trim() || 'gemini';

  if (config.LLM_PROVIDER !== 'offline') {
    const apiKey = await askQuestion(`Enter API Key for ${config.LLM_PROVIDER.toUpperCase()}: `);
    if (config.LLM_PROVIDER === 'gemini') {
      config.GEMINI_API_KEY = apiKey.trim();
      const model = await askQuestion("Enter Gemini Model [gemini-1.5-pro]: ");
      config.GEMINI_MODEL = model.trim() || 'gemini-1.5-pro';
    } else if (config.LLM_PROVIDER === 'anthropic') {
      config.ANTHROPIC_API_KEY = apiKey.trim();
      const model = await askQuestion("Enter Claude Model [claude-3-5-sonnet]: ");
      config.ANTHROPIC_MODEL = model.trim() || 'claude-3-5-sonnet';
    } else if (config.LLM_PROVIDER === 'openai') {
      config.OPENAI_API_KEY = apiKey.trim();
      const model = await askQuestion("Enter OpenAI Model [gpt-4o]: ");
      config.OPENAI_MODEL = model.trim() || 'gpt-4o';
    }
  } else {
    const fallbackUrl = await askQuestion("Enter local offline fallback URL [http://localhost:11434]: ");
    config.OFFLINE_FALLBACK_URL = fallbackUrl.trim() || 'http://localhost:11434';
    const model = await askQuestion("Enter local model name [llama3]: ");
    config.OFFLINE_MODEL = model.trim() || 'llama3';
  }

  // 2. Cross-Platform Webhook Relays
  console.log("\n--- 2. Cross-Platform Messaging Relays ---");
  const relayEnable = await askQuestion("Enable cross-platform message relays? (y/n) [n]: ");
  if (relayEnable.toLowerCase().startsWith('y')) {
    config.RELAY_ENABLED = 'true';
    const source = await askQuestion("Enter Source Platform (e.g. discord, whatsapp): ");
    config.RELAY_SOURCE = source.trim();
    const dest = await askQuestion("Enter Destination Platform (e.g. snapchat, telegram): ");
    config.RELAY_DEST = dest.trim();
  } else {
    config.RELAY_ENABLED = 'false';
  }

  // 3. Cellular Alert Gateway
  console.log("\n--- 3. Cellular Failover Alerting ---");
  const cellularEnable = await askQuestion("Enable Twilio SMS cellular failover alerting? (y/n) [n]: ");
  if (cellularEnable.toLowerCase().startsWith('y')) {
    const sid = await askQuestion("Enter Twilio Account SID: ");
    config.TWILIO_ACCOUNT_SID = sid.trim();
    const token = await askQuestion("Enter Twilio Auth Token: ");
    config.TWILIO_AUTH_TOKEN = token.trim();
    const number = await askQuestion("Enter Twilio Phone Number: ");
    config.TWILIO_PHONE_NUMBER = number.trim();
    const recipient = await askQuestion("Enter Recipient Mobile Number for alerts: ");
    config.CELLULAR_ALERT_RECIPIENT = recipient.trim();
  }

  // 4. Local Outbox Caching
  console.log("\n--- 4. Persistent Cache & Audit Settings ---");
  const cachePath = await askQuestion("Enter local MemoryStore storage directory [./data/agent_memory]: ");
  config.PERSISTENCE_PATH = cachePath.trim() || './data/agent_memory';

  // Generate .env file
  const envContent = Object.entries(config)
    .map(([key, val]) => `${key}="${val}"`)
    .join('\n');

  const envPath = path.join(process.cwd(), '.env');
  fs.writeFileSync(envPath, envContent, 'utf8');

  const { exec } = require('child_process');
  console.log("\n==================================================");
  console.log(`Setup complete! Configuration saved to: ${envPath}`);
  console.log("Opening Tomb OS Desktop page automatically...");
  console.log("==================================================");

  const desktopPath = path.resolve(process.cwd(), '../index.html');
  const platform = process.platform;
  let openCmd = '';
  if (platform === 'darwin') openCmd = `open "${desktopPath}"`;
  else if (platform === 'win32') openCmd = `start "" "${desktopPath}"`;
  else openCmd = `xdg-open "${desktopPath}"`;

  exec(openCmd, (err) => {
    if (err) {
      console.warn("Could not open desktop page automatically:", err.message);
    }
  });

  rl.close();
}

runSetup().catch(console.error);
