// ─────────────────────────────────────────────────────────────────────────────
// Tomb OS Multi-Agent — Memory Agent
// Responsible for storing, recalling, and managing all persistent memories
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import { BaseAgent } from './BaseAgent';
import { MemoryStore } from '../memory/MemoryStore';
import {
  AgentRole,
  MessageType,
  Memory,
  MemoryType,
  UserInteraction,
  AgentMessage,
} from '../types';

export class MemoryAgent extends BaseAgent {
  private store: MemoryStore;

  constructor(storagePath: string) {
    super(AgentRole.MEMORY);
    this.store = new MemoryStore(storagePath);
    this.registerHandlers();
  }

  private registerHandlers(): void {
    // Store a new memory
    this.on(MessageType.LEARN, async (msg: AgentMessage) => {
      const { content, category, type, tags, weight, permanent } =
        msg.payload as {
          content: string;
          category: string;
          type?: MemoryType;
          tags?: string[];
          weight?: number;
          permanent?: boolean;
        };

      const memory: Memory = {
        id: uuidv4(),
        type: type ?? MemoryType.INTERACTION,
        category,
        content,
        metadata: {},
        weight: weight ?? 0.5,
        accessCount: 0,
        createdAt: Date.now(),
        lastAccessedAt: Date.now(),
        decayRate: permanent ? 0 : 0.02,
        tags: tags ?? [],
      };

      this.store.addMemory(memory);

      return this.createMessage(msg.from, MessageType.RESPONSE, {
        success: true,
        memoryId: memory.id,
      }, msg.id);
    });

    // Recall memories by query
    this.on(MessageType.RECALL, async (msg: AgentMessage) => {
      const { query, type, category, tags, limit } = msg.payload as {
        query?: string;
        type?: MemoryType;
        category?: string;
        tags?: string[];
        limit?: number;
      };

      let results: Memory[];
      if (query) {
        results = this.store.searchMemories(query, limit ?? 10);
      } else {
        results = this.store.queryMemories({ type, category, tags, limit });
      }

      return this.createMessage(msg.from, MessageType.RESPONSE, {
        memories: results,
        count: results.length,
      }, msg.id);
    });

    // Log a user interaction
    this.on(MessageType.EVENT, async (msg: AgentMessage) => {
      const interaction = msg.payload as UserInteraction;
      this.store.logInteraction(interaction);

      return this.createMessage(msg.from, MessageType.RESPONSE, {
        success: true,
        totalInteractions: this.store.getStats().totalInteractions,
      }, msg.id);
    });

    // General queries
    this.on(MessageType.QUERY, async (msg: AgentMessage) => {
      const { action } = msg.payload as { action: string };

      switch (action) {
        case 'stats':
          return this.createMessage(msg.from, MessageType.RESPONSE,
            this.store.getStats(), msg.id);

        case 'recent_interactions':
          return this.createMessage(msg.from, MessageType.RESPONSE, {
            interactions: this.store.getRecentInteractions(20),
          }, msg.id);

        case 'preferences':
          return this.createMessage(msg.from, MessageType.RESPONSE, {
            preferences: this.store.getAllPreferences(),
          }, msg.id);

        case 'patterns':
          return this.createMessage(msg.from, MessageType.RESPONSE, {
            patterns: this.store.getPatterns(),
          }, msg.id);

        case 'decay':
          const decayed = this.store.applyDecay();
          return this.createMessage(msg.from, MessageType.RESPONSE, {
            decayed,
          }, msg.id);

        default:
          return this.createMessage(msg.from, MessageType.RESPONSE, {
            error: `Unknown action: ${action}`,
          }, msg.id);
      }
    });
  }

  public getStore(): MemoryStore {
    return this.store;
  }

  public async initialize(): Promise<void> {
    console.log(`[${this.id}] Memory Agent initialized with ${this.store.getStats().totalMemories} memories`);
  }

  public async shutdown(): Promise<void> {
    this.store.shutdown();
    console.log(`[${this.id}] Memory Agent shut down, data persisted.`);
  }
}
