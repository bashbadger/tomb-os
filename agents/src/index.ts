/**
 * Tomb OS TypeScript Autonomous Multi-Agent Mesh Core
 * Exporting all autonomous agents: Orchestrator, Memory, Learning, Task, and ImmuneSystem.
 */

export * from './types';
export * from './agents/BaseAgent';
export * from './agents/OrchestratorAgent';
export * from './agents/MemoryAgent';
export * from './agents/LearningAgent';
export * from './agents/TaskAgent';
export * from './agents/ImmuneSystemAgent';
export * from './memory/MemoryStore';

import { OrchestratorAgent } from './agents/OrchestratorAgent';
import { ImmuneSystemAgent } from './agents/ImmuneSystemAgent';

export async function bootstrapMultiAgentMesh(): Promise<void> {
  console.log("🚀 [TYPESCRIPT MESH] Bootstrapping autonomous multi-agent mesh...");
  const orchestrator = new OrchestratorAgent();
  const immune = new ImmuneSystemAgent();
  
  await immune.scanSystemForPathogens();
  console.log("✅ [TYPESCRIPT MESH] Autonomous multi-agent mesh active and synchronized!");
}
