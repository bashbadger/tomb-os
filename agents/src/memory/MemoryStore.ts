// ─────────────────────────────────────────────────────────────────────────────
// Tomb OS Multi-Agent — Persistent Memory Store
// Handles disk-backed storage, retrieval, similarity search, and decay
// ─────────────────────────────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import {
  Memory,
  MemoryId,
  MemoryType,
  UserPreference,
  BehaviorPattern,
  UserInteraction,
  AdaptationRule,
} from '../types';

interface MemoryStoreData {
  memories: Memory[];
  preferences: UserPreference[];
  patterns: BehaviorPattern[];
  interactions: UserInteraction[];
  adaptations: AdaptationRule[];
  metadata: {
    createdAt: number;
    lastSaved: number;
    totalInteractions: number;
    version: string;
  };
}

export class MemoryStore {
  private data: MemoryStoreData;
  private storagePath: string;
  private dirty = false;
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null;

  constructor(storagePath: string) {
    this.storagePath = storagePath;
    this.data = this.loadFromDisk();
    this.startAutoSave();
  }

  // ── Persistence ─────────────────────────────────────────────────────────

  private loadFromDisk(): MemoryStoreData {
    const filePath = path.join(this.storagePath, 'memory.json');
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as MemoryStoreData;
      }
    } catch (err) {
      console.error('[MemoryStore] Failed to load memory from disk:', err);
    }
    return this.createEmptyStore();
  }

  private createEmptyStore(): MemoryStoreData {
    return {
      memories: [],
      preferences: [],
      patterns: [],
      interactions: [],
      adaptations: [],
      metadata: {
        createdAt: Date.now(),
        lastSaved: Date.now(),
        totalInteractions: 0,
        version: '1.0.0',
      },
    };
  }

  public saveToDisk(): void {
    const dir = this.storagePath;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.data.metadata.lastSaved = Date.now();
    const filePath = path.join(dir, 'memory.json');
    fs.writeFileSync(filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    this.dirty = false;
  }

  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      if (this.dirty) {
        this.saveToDisk();
      }
    }, 30000); // Auto-save every 30 seconds if dirty
  }

  public shutdown(): void {
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    if (this.dirty) this.saveToDisk();
  }

  // ── Memory CRUD ─────────────────────────────────────────────────────────

  public addMemory(memory: Memory): void {
    this.data.memories.push(memory);
    this.dirty = true;
  }

  public getMemory(id: MemoryId): Memory | undefined {
    const mem = this.data.memories.find(m => m.id === id);
    if (mem) {
      mem.accessCount++;
      mem.lastAccessedAt = Date.now();
      this.dirty = true;
    }
    return mem;
  }

  public queryMemories(filter: {
    type?: MemoryType;
    category?: string;
    tags?: string[];
    minWeight?: number;
    limit?: number;
  }): Memory[] {
    let results = this.data.memories;

    if (filter.type) {
      results = results.filter(m => m.type === filter.type);
    }
    if (filter.category) {
      results = results.filter(m => m.category === filter.category);
    }
    if (filter.tags?.length) {
      results = results.filter(m =>
        filter.tags!.some(tag => m.tags.includes(tag))
      );
    }
    if (filter.minWeight !== undefined) {
      results = results.filter(m => m.weight >= filter.minWeight!);
    }

    // Sort by weight (descending), then by recency
    results.sort((a, b) => {
      const weightDiff = b.weight - a.weight;
      if (Math.abs(weightDiff) > 0.01) return weightDiff;
      return b.lastAccessedAt - a.lastAccessedAt;
    });

    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  /** Simple keyword-based similarity search across memory content */
  public searchMemories(query: string, limit = 10): Memory[] {
    const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = this.data.memories.map(mem => {
      const content = mem.content.toLowerCase();
      const tagStr = mem.tags.join(' ').toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (content.includes(kw)) score += 2;
        if (tagStr.includes(kw)) score += 1;
      }
      // Boost by weight and recency
      score *= mem.weight;
      const ageDays = (Date.now() - mem.lastAccessedAt) / 86400000;
      score *= Math.max(0.1, 1 - ageDays * mem.decayRate);
      return { memory: mem, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.memory);
  }

  // ── Memory Decay ────────────────────────────────────────────────────────

  public applyDecay(): number {
    const now = Date.now();
    let decayed = 0;
    this.data.memories = this.data.memories.filter(mem => {
      if (mem.decayRate === 0) return true; // Permanent memory
      const ageDays = (now - mem.lastAccessedAt) / 86400000;
      const effectiveWeight = mem.weight * Math.max(0, 1 - ageDays * mem.decayRate);
      if (effectiveWeight < 0.01) {
        decayed++;
        return false;
      }
      mem.weight = effectiveWeight;
      return true;
    });
    if (decayed > 0) this.dirty = true;
    return decayed;
  }

  // ── Preferences ─────────────────────────────────────────────────────────

  public setPreference(pref: UserPreference): void {
    const idx = this.data.preferences.findIndex(p => p.key === pref.key);
    if (idx >= 0) {
      this.data.preferences[idx] = pref;
    } else {
      this.data.preferences.push(pref);
    }
    this.dirty = true;
  }

  public getPreference(key: string): UserPreference | undefined {
    return this.data.preferences.find(p => p.key === key);
  }

  public getAllPreferences(): UserPreference[] {
    return [...this.data.preferences];
  }

  // ── Patterns ────────────────────────────────────────────────────────────

  public addPattern(pattern: BehaviorPattern): void {
    const idx = this.data.patterns.findIndex(p => p.id === pattern.id);
    if (idx >= 0) {
      this.data.patterns[idx] = pattern;
    } else {
      this.data.patterns.push(pattern);
    }
    this.dirty = true;
  }

  public getPatterns(): BehaviorPattern[] {
    return [...this.data.patterns];
  }

  public findMatchingPatterns(context: string[]): BehaviorPattern[] {
    return this.data.patterns.filter(p =>
      p.triggerConditions.some(trigger =>
        context.some(ctx => ctx.toLowerCase().includes(trigger.toLowerCase()))
      )
    );
  }

  // ── Interactions ────────────────────────────────────────────────────────

  public logInteraction(interaction: UserInteraction): void {
    this.data.interactions.push(interaction);
    this.data.metadata.totalInteractions++;
    // Keep only last 5000 interactions to prevent unbounded growth
    if (this.data.interactions.length > 5000) {
      this.data.interactions = this.data.interactions.slice(-5000);
    }
    this.dirty = true;
  }

  public getRecentInteractions(limit = 50): UserInteraction[] {
    return this.data.interactions.slice(-limit);
  }

  public getInteractionsByIntent(intent: string): UserInteraction[] {
    return this.data.interactions.filter(i => i.intent === intent);
  }

  // ── Adaptations ─────────────────────────────────────────────────────────

  public addAdaptation(rule: AdaptationRule): void {
    const idx = this.data.adaptations.findIndex(a => a.id === rule.id);
    if (idx >= 0) {
      this.data.adaptations[idx] = rule;
    } else {
      this.data.adaptations.push(rule);
    }
    this.dirty = true;
  }

  public getActiveAdaptations(): AdaptationRule[] {
    return this.data.adaptations.filter(a => a.enabled);
  }

  // ── Statistics ──────────────────────────────────────────────────────────

  public getStats(): Record<string, number> {
    return {
      totalMemories: this.data.memories.length,
      totalPreferences: this.data.preferences.length,
      totalPatterns: this.data.patterns.length,
      totalInteractions: this.data.metadata.totalInteractions,
      totalAdaptations: this.data.adaptations.length,
    };
  }
}
