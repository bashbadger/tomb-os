// ─────────────────────────────────────────────────────────────────────────────
// Tomb OS Multi-Agent — Orchestrator Agent
// Central dispatcher that routes user requests to specialized agents,
// coordinates multi-agent workflows, and applies learned adaptations
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import { BaseAgent } from './BaseAgent';
import {
  AgentRole,
  MessageType,
  MemoryType,
  UserInteraction,
  AgentMessage,
} from '../types';

interface ParsedIntent {
  intent: string;
  entities: Record<string, string>;
  confidence: number;
}

export class OrchestratorAgent extends BaseAgent {
  private sessionId: string;
  private interactionCount = 0;

  constructor() {
    super(AgentRole.ORCHESTRATOR);
    this.sessionId = uuidv4();
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.on(MessageType.REQUEST, async (msg: AgentMessage) => {
      const { input } = msg.payload as { input: string };
      return this.processUserRequest(input, msg);
    });

    this.on(MessageType.QUERY, async (msg: AgentMessage) => {
      const { action } = msg.payload as { action: string };
      switch (action) {
        case 'system_status':
          return this.createMessage(msg.from, MessageType.RESPONSE, {
            sessionId: this.sessionId,
            interactionCount: this.interactionCount,
            agents: this.getAllPeers().map(p => p.getInfo()),
          }, msg.id);
        default:
          return this.createMessage(msg.from, MessageType.RESPONSE, {
            error: `Unknown query: ${action}`,
          }, msg.id);
      }
    });
  }

  // ── Request Processing Pipeline ─────────────────────────────────────────

  public async processUserRequest(
    input: string,
    originMessage?: AgentMessage
  ): Promise<AgentMessage | void> {
    const startTime = Date.now();
    this.interactionCount++;
    const agentChain: string[] = [this.id];

    console.log(`\n[${this.id}] ──── Processing request #${this.interactionCount} ────`);
    console.log(`[${this.id}] Input: "${input}"`);

    // Step 1: Parse intent from user input
    const parsed = this.parseIntent(input);
    console.log(`[${this.id}] Parsed intent: ${parsed.intent} (confidence: ${parsed.confidence})`);

    // Step 2: Check for learned adaptations
    const adaptResponse = await this.send(
      AgentRole.LEARNING,
      MessageType.ADAPT,
      { context: [parsed.intent, ...Object.values(parsed.entities)] }
    );
    const adaptations = (adaptResponse?.payload as { adaptations?: unknown[]; patterns?: unknown[] }) ?? {};
    if ((adaptations.adaptations as unknown[])?.length) {
      console.log(`[${this.id}] Applied ${(adaptations.adaptations as unknown[]).length} learned adaptations`);
    }

    // Step 3: Recall relevant memories
    const recallResponse = await this.send(
      AgentRole.MEMORY,
      MessageType.RECALL,
      { query: input, limit: 5 }
    );
    agentChain.push(AgentRole.MEMORY);
    const recalled = (recallResponse?.payload as { memories?: unknown[] })?.memories ?? [];
    if ((recalled as unknown[]).length) {
      console.log(`[${this.id}] Recalled ${(recalled as unknown[]).length} relevant memories`);
    }

    // Step 4: Route to the appropriate agent based on intent
    let responsePayload: unknown;
    switch (parsed.intent) {
      case 'execute_task':
        responsePayload = await this.routeToTaskAgent(input, parsed, agentChain);
        break;
      case 'recall_memory':
        responsePayload = recalled;
        break;
      case 'check_status':
        responsePayload = await this.getSystemStatus(agentChain);
        break;
      case 'set_preference':
        responsePayload = await this.handlePreferenceUpdate(parsed, agentChain);
        break;
      case 'analyze':
        responsePayload = await this.routeToLearningAnalysis(agentChain);
        break;
      default:
        responsePayload = await this.handleGenericRequest(input, parsed, agentChain);
        break;
    }

    // Step 5: Record this interaction in memory
    const interaction: UserInteraction = {
      id: uuidv4(),
      sessionId: this.sessionId,
      input,
      intent: parsed.intent,
      entities: parsed.entities,
      response: JSON.stringify(responsePayload).slice(0, 500),
      agentChain,
      timestamp: Date.now(),
      duration: Date.now() - startTime,
      context: { recalled: (recalled as unknown[]).length },
    };

    await this.send(AgentRole.MEMORY, MessageType.EVENT, interaction);

    // Step 6: Feed interaction to the Learning Agent for pattern detection
    const learningInsights = await this.send(
      AgentRole.LEARNING,
      MessageType.LEARN,
      { interaction }
    );
    agentChain.push(AgentRole.LEARNING);
    const insights = learningInsights?.payload as {
      newPatterns?: unknown[];
      newAdaptations?: unknown[];
    } ?? {};
    if (insights.newPatterns?.length) {
      console.log(`[${this.id}] Learning Agent detected ${insights.newPatterns.length} new pattern(s)`);
    }
    if (insights.newAdaptations?.length) {
      console.log(`[${this.id}] Learning Agent created ${insights.newAdaptations.length} new adaptation(s)`);
    }

    // Step 7: Store the raw interaction as a permanent memory
    await this.send(AgentRole.MEMORY, MessageType.LEARN, {
      content: `User requested: "${input}" → Intent: ${parsed.intent}`,
      category: 'user_request',
      type: MemoryType.INTERACTION,
      tags: [parsed.intent, ...Object.keys(parsed.entities)],
      weight: 0.6,
    });

    console.log(`[${this.id}] ──── Request #${this.interactionCount} completed (${Date.now() - startTime}ms) ────\n`);

    const from = originMessage?.from ?? 'user';
    return this.createMessage(from, MessageType.RESPONSE, {
      input,
      intent: parsed.intent,
      response: responsePayload,
      agentChain,
      memoriesRecalled: (recalled as unknown[]).length,
      patternsDetected: insights.newPatterns?.length ?? 0,
      duration: Date.now() - startTime,
    }, originMessage?.id);
  }

  // ── Intent Parser ───────────────────────────────────────────────────────

  private parseIntent(input: string): ParsedIntent {
    const lower = input.toLowerCase().trim();
    const entities: Record<string, string> = {};

    // Task execution patterns
    if (/^(run|execute|do|perform|start|launch)\b/i.test(lower)) {
      const taskName = input.replace(/^(run|execute|do|perform|start|launch)\s+/i, '').trim();
      entities['task_name'] = taskName;
      return { intent: 'execute_task', entities, confidence: 0.9 };
    }

    // Memory recall patterns
    if (/^(remember|recall|what did|show me|find|search|history)\b/i.test(lower)) {
      entities['query'] = input.replace(/^(remember|recall|what did|show me|find|search|history)\s*/i, '').trim();
      return { intent: 'recall_memory', entities, confidence: 0.85 };
    }

    // Status check patterns
    if (/^(status|health|check|info|stats|how are)\b/i.test(lower)) {
      return { intent: 'check_status', entities, confidence: 0.9 };
    }

    // Preference setting patterns
    if (/^(set|prefer|always|default|configure|change)\b/i.test(lower)) {
      const parts = lower.replace(/^(set|prefer|always|default|configure|change)\s+/i, '').split(/\s+to\s+|\s*=\s*/);
      if (parts.length >= 2) {
        entities['key'] = parts[0].trim();
        entities['value'] = parts.slice(1).join(' ').trim();
      }
      return { intent: 'set_preference', entities, confidence: 0.8 };
    }

    // Analysis patterns
    if (/^(analyze|learn|adapt|insights|patterns|report)\b/i.test(lower)) {
      return { intent: 'analyze', entities, confidence: 0.85 };
    }

    // Fallback: generic request
    entities['raw_input'] = input;
    return { intent: 'generic', entities, confidence: 0.5 };
  }

  // ── Route Handlers ──────────────────────────────────────────────────────

  private async routeToTaskAgent(
    input: string,
    parsed: ParsedIntent,
    agentChain: string[]
  ): Promise<unknown> {
    agentChain.push(AgentRole.TASK);
    const taskName = parsed.entities['task_name'] ?? input;
    const response = await this.send(AgentRole.TASK, MessageType.TASK_EXECUTE, {
      name: taskName,
      description: `User-initiated task: ${taskName}`,
      steps: [
        { action: 'log', params: { message: `Starting: ${taskName}` } },
        { action: 'compute', params: { input: taskName } },
        { action: 'notify', params: { message: `Completed: ${taskName}` } },
      ],
    });
    return response?.payload;
  }

  private async getSystemStatus(agentChain: string[]): Promise<unknown> {
    const memResponse = await this.send(AgentRole.MEMORY, MessageType.QUERY, { action: 'stats' });
    const learnResponse = await this.send(AgentRole.LEARNING, MessageType.QUERY, { action: 'analyze_all' });
    agentChain.push(AgentRole.MEMORY, AgentRole.LEARNING);
    return {
      session: this.sessionId,
      totalRequests: this.interactionCount,
      memory: memResponse?.payload,
      learning: learnResponse?.payload,
      agents: this.getAllPeers().map(p => p.getInfo()),
    };
  }

  private async handlePreferenceUpdate(
    parsed: ParsedIntent,
    agentChain: string[]
  ): Promise<unknown> {
    const { key, value } = parsed.entities;
    if (!key) return { error: 'No preference key specified' };

    await this.send(AgentRole.MEMORY, MessageType.LEARN, {
      content: `User preference: ${key} = ${value}`,
      category: 'preference',
      type: MemoryType.PREFERENCE,
      tags: ['preference', key],
      weight: 0.9,
      permanent: true,
    });
    agentChain.push(AgentRole.MEMORY);

    return { updated: true, key, value };
  }

  private async routeToLearningAnalysis(agentChain: string[]): Promise<unknown> {
    agentChain.push(AgentRole.LEARNING);
    const response = await this.send(AgentRole.LEARNING, MessageType.QUERY, { action: 'analyze_all' });
    return response?.payload;
  }

  private async handleGenericRequest(
    input: string,
    parsed: ParsedIntent,
    agentChain: string[]
  ): Promise<unknown> {
    // For generic requests, check if the Learning Agent can predict an intent
    const prediction = await this.send(AgentRole.LEARNING, MessageType.QUERY, {
      action: 'predict',
      input,
    });
    agentChain.push(AgentRole.LEARNING);

    return {
      message: `Processed generic request: "${input}"`,
      prediction: prediction?.payload,
      hint: 'Try starting with: run, remember, status, set, or analyze',
    };
  }

  public async initialize(): Promise<void> {
    console.log(`[${this.id}] Orchestrator Agent initialized (session: ${this.sessionId})`);
  }

  public async shutdown(): Promise<void> {
    console.log(`[${this.id}] Orchestrator Agent shut down.`);
  }
}
