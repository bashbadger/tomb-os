// ─────────────────────────────────────────────────────────────────────────────
// Tomb OS Multi-Agent — Interactive Demo Runner
// Demonstrates learning, adaptation, memory persistence, and task execution
// ─────────────────────────────────────────────────────────────────────────────

import { AgentSystem } from './index';

async function demo() {
  const system = new AgentSystem({
    persistencePath: './data/agent_memory',
    learningThreshold: 2,
    debugMode: true,
  });

  await system.start();

  // ── Simulate a series of user interactions ────────────────────────────

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  DEMO: Simulating User Interactions');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 1. Execute tasks — the system learns the user likes to run scans
  await system.process('run security scan');
  await system.process('run network audit');
  await system.process('run security scan');

  // 2. Set explicit preferences
  await system.process('set theme to dark');
  await system.process('set default_browser to chromium');

  // 3. Ask the system to remember something
  await system.process('remember that the staging server IP is 10.0.1.50');

  // 4. Recall a memory
  await system.process('recall staging server');

  // 5. Check system status (shows learned patterns)
  const status = await system.process('status');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SYSTEM STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(JSON.stringify(status, null, 2));

  // 6. Request a learning analysis
  const analysis = await system.process('analyze patterns');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  LEARNING ANALYSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(JSON.stringify(analysis, null, 2));

  // 7. Generic request — system should predict intent based on history
  await system.process('scan the perimeter firewall');

  // 8. Final memory stats
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FINAL MEMORY STATS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(JSON.stringify(system.getStatus(), null, 2));

  await system.stop();
}

demo().catch(console.error);
