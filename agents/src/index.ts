// ─────────────────────────────────────────────────────────────────────────────
// Tomb OS Multi-Agent System — Main Entry Point
// Initializes all agents, wires peer connections, and exposes the public API
// ─────────────────────────────────────────────────────────────────────────────

import { OrchestratorAgent } from './agents/OrchestratorAgent';
import { MemoryAgent } from './agents/MemoryAgent';
import { LearningAgent } from './agents/LearningAgent';
import { TaskAgent } from './agents/TaskAgent';
import { AgentSystemConfig, DEFAULT_CONFIG } from './types';

export class AgentSystem {
  private orchestrator: OrchestratorAgent;
  private memoryAgent: MemoryAgent;
  private learningAgent: LearningAgent;
  private taskAgent: TaskAgent;
  private decayTimer: ReturnType<typeof setInterval> | null = null;
  private config: AgentSystemConfig;

  constructor(config?: Partial<AgentSystemConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Instantiate all agents
    this.memoryAgent = new MemoryAgent(this.config.persistencePath);
    this.learningAgent = new LearningAgent(
      this.memoryAgent.getStore(),
      this.config.learningThreshold
    );
    this.taskAgent = new TaskAgent();
    this.orchestrator = new OrchestratorAgent();

    // Wire peer-to-peer connections (full mesh)
    const allAgents = [
      this.orchestrator,
      this.memoryAgent,
      this.learningAgent,
      this.taskAgent,
    ];

    for (const agent of allAgents) {
      for (const peer of allAgents) {
        if (agent !== peer) {
          agent.registerPeer(peer);
        }
      }
    }
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  public async start(): Promise<void> {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║      Tomb OS Adaptive Multi-Agent System v1.0.0        ║');
    console.log('║  "Learn. Adapt. Remember. Execute."                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log();

    await this.memoryAgent.initialize();
    await this.learningAgent.initialize();
    await this.taskAgent.initialize();
    await this.orchestrator.initialize();

    // Start memory decay timer
    this.decayTimer = setInterval(() => {
      const decayed = this.memoryAgent.getStore().applyDecay();
      if (decayed > 0 && this.config.debugMode) {
        console.log(`[System] Memory decay: ${decayed} memories expired`);
      }
    }, this.config.memoryDecayInterval);

    console.log('\n[System] All agents online. System ready.\n');
  }

  public async stop(): Promise<void> {
    if (this.decayTimer) clearInterval(this.decayTimer);
    await this.orchestrator.shutdown();
    await this.taskAgent.shutdown();
    await this.learningAgent.shutdown();
    await this.memoryAgent.shutdown();
    console.log('[System] All agents shut down. Memory persisted.');
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /** Process a user request through the orchestrator pipeline */
  public async process(input: string): Promise<unknown> {
    const response = await this.orchestrator.processUserRequest(input);
    return response?.payload;
  }

  /** Get full system status */
  public getStatus(): Record<string, unknown> {
    return {
      agents: [
        this.orchestrator.getInfo(),
        this.memoryAgent.getInfo(),
        this.learningAgent.getInfo(),
        this.taskAgent.getInfo(),
      ],
      memory: this.memoryAgent.getStore().getStats(),
    };
  }
}

// Re-export all types and agents for external consumption
export * from './types';
export { OrchestratorAgent } from './agents/OrchestratorAgent';
export { MemoryAgent } from './agents/MemoryAgent';
export { LearningAgent } from './agents/LearningAgent';
export { TaskAgent } from './agents/TaskAgent';
export { MemoryStore } from './memory/MemoryStore';
export { BaseAgent } from './agents/BaseAgent';
