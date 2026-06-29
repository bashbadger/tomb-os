// ─────────────────────────────────────────────────────────────────────────────
// Tomb OS Multi-Agent — Learning Agent
// Analyzes user interaction history, detects behavioral patterns,
// infers preferences, and generates adaptation rules
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import { BaseAgent } from './BaseAgent';
import { MemoryStore } from '../memory/MemoryStore';
import {
  AgentRole,
  MessageType,
  MemoryType,
  BehaviorPattern,
  UserPreference,
  AdaptationRule,
  UserInteraction,
  AgentMessage,
} from '../types';

export class LearningAgent extends BaseAgent {
  private store: MemoryStore;
  private learningThreshold: number;

  constructor(store: MemoryStore, learningThreshold = 3) {
    super(AgentRole.LEARNING);
    this.store = store;
    this.learningThreshold = learningThreshold;
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.on(MessageType.LEARN, async (msg: AgentMessage) => {
      const { interaction } = msg.payload as { interaction: UserInteraction };
      const insights = this.analyzeInteraction(interaction);
      return this.createMessage(msg.from, MessageType.RESPONSE, insights, msg.id);
    });

    this.on(MessageType.ADAPT, async (msg: AgentMessage) => {
      const { context } = msg.payload as { context: string[] };
      const adaptations = this.generateAdaptations(context);
      return this.createMessage(msg.from, MessageType.RESPONSE, {
        adaptations,
        patterns: this.store.findMatchingPatterns(context),
      }, msg.id);
    });

    this.on(MessageType.QUERY, async (msg: AgentMessage) => {
      const { action } = msg.payload as { action: string };
      switch (action) {
        case 'analyze_all':
          return this.createMessage(msg.from, MessageType.RESPONSE,
            this.runFullAnalysis(), msg.id);
        case 'predict':
          const { input } = msg.payload as { action: string; input: string };
          return this.createMessage(msg.from, MessageType.RESPONSE,
            this.predictUserIntent(input), msg.id);
        default:
          return this.createMessage(msg.from, MessageType.RESPONSE,
            { error: `Unknown action: ${action}` }, msg.id);
      }
    });
  }

  // ── Pattern Detection ───────────────────────────────────────────────────

  private analyzeInteraction(interaction: UserInteraction): {
    newPatterns: BehaviorPattern[];
    updatedPreferences: UserPreference[];
    newAdaptations: AdaptationRule[];
  } {
    const newPatterns: BehaviorPattern[] = [];
    const updatedPreferences: UserPreference[] = [];
    const newAdaptations: AdaptationRule[] = [];

    // 1. Detect intent frequency patterns
    const intentHistory = this.store.getInteractionsByIntent(interaction.intent);
    if (intentHistory.length >= this.learningThreshold) {
      const existingPatterns = this.store.getPatterns();
      const alreadyTracked = existingPatterns.some(
        p => p.triggerConditions.includes(interaction.intent)
      );

      if (!alreadyTracked) {
        const pattern: BehaviorPattern = {
          id: uuidv4(),
          description: `User frequently performs "${interaction.intent}" actions`,
          triggerConditions: [interaction.intent],
          actions: [interaction.input],
          frequency: intentHistory.length,
          confidence: Math.min(1, intentHistory.length / 10),
          lastOccurred: Date.now(),
        };
        this.store.addPattern(pattern);
        newPatterns.push(pattern);
      }
    }

    // 2. Detect time-of-day preferences
    const hour = new Date(interaction.timestamp).getHours();
    const timeSlot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const timePref = this.store.getPreference('preferred_time_slot');
    const timeMap: Record<string, number> = timePref?.value as Record<string, number> ?? {};
    timeMap[timeSlot] = (timeMap[timeSlot] ?? 0) + 1;
    const totalObserved = Object.values(timeMap).reduce((a, b) => a + b, 0);
    const dominantSlot = Object.entries(timeMap).sort((a, b) => b[1] - a[1])[0];

    const updatedTimePref: UserPreference = {
      key: 'preferred_time_slot',
      value: timeMap,
      confidence: dominantSlot[1] / totalObserved,
      observedCount: totalObserved,
      lastObserved: Date.now(),
      source: 'inferred',
    };
    this.store.setPreference(updatedTimePref);
    updatedPreferences.push(updatedTimePref);

    // 3. Detect repeated sequential actions (A → B patterns)
    const recent = this.store.getRecentInteractions(20);
    if (recent.length >= 2) {
      const lastTwo = recent.slice(-2);
      const sequenceKey = `${lastTwo[0].intent}→${lastTwo[1].intent}`;
      const sequencePref = this.store.getPreference(`sequence_${sequenceKey}`);
      const count = (sequencePref?.observedCount ?? 0) + 1;

      if (count >= this.learningThreshold) {
        const adaptation: AdaptationRule = {
          id: `adapt-seq-${sequenceKey}`,
          condition: `After user performs "${lastTwo[0].intent}"`,
          action: `Proactively suggest "${lastTwo[1].intent}"`,
          priority: count,
          enabled: true,
          appliedCount: 0,
          successRate: 0,
          createdAt: Date.now(),
        };
        this.store.addAdaptation(adaptation);
        newAdaptations.push(adaptation);
      }

      this.store.setPreference({
        key: `sequence_${sequenceKey}`,
        value: sequenceKey,
        confidence: Math.min(1, count / 10),
        observedCount: count,
        lastObserved: Date.now(),
        source: 'inferred',
      });
    }

    // 4. Extract entity preferences (e.g., preferred file types, tools)
    for (const [key, value] of Object.entries(interaction.entities)) {
      const entityPref = this.store.getPreference(`entity_${key}`);
      const entityMap: Record<string, number> = entityPref?.value as Record<string, number> ?? {};
      entityMap[value] = (entityMap[value] ?? 0) + 1;
      const entityTotal = Object.values(entityMap).reduce((a, b) => a + b, 0);
      const dominant = Object.entries(entityMap).sort((a, b) => b[1] - a[1])[0];

      this.store.setPreference({
        key: `entity_${key}`,
        value: entityMap,
        confidence: dominant[1] / entityTotal,
        observedCount: entityTotal,
        lastObserved: Date.now(),
        source: 'inferred',
      });
    }

    return { newPatterns, updatedPreferences, newAdaptations };
  }

  // ── Prediction ──────────────────────────────────────────────────────────

  private predictUserIntent(input: string): {
    predictedIntent: string | null;
    confidence: number;
    suggestedActions: string[];
    relevantPatterns: BehaviorPattern[];
  } {
    const keywords = input.toLowerCase().split(/\s+/);
    const patterns = this.store.getPatterns();
    const matchedPatterns = patterns.filter(p =>
      p.triggerConditions.some(trigger =>
        keywords.some(kw => trigger.toLowerCase().includes(kw))
      )
    );

    // Use the highest-confidence pattern
    matchedPatterns.sort((a, b) => b.confidence - a.confidence);
    const bestMatch = matchedPatterns[0];

    // Check active adaptation rules
    const adaptations = this.store.getActiveAdaptations();
    const suggestedActions = adaptations
      .filter(a => keywords.some(kw => a.condition.toLowerCase().includes(kw)))
      .map(a => a.action);

    return {
      predictedIntent: bestMatch?.description ?? null,
      confidence: bestMatch?.confidence ?? 0,
      suggestedActions,
      relevantPatterns: matchedPatterns.slice(0, 5),
    };
  }

  // ── Full Analysis ───────────────────────────────────────────────────────

  private runFullAnalysis(): {
    totalPatterns: number;
    totalPreferences: number;
    totalAdaptations: number;
    topPatterns: BehaviorPattern[];
    insights: string[];
  } {
    const patterns = this.store.getPatterns();
    const preferences = this.store.getAllPreferences();
    const adaptations = this.store.getActiveAdaptations();
    const insights: string[] = [];

    // Generate human-readable insights
    const timePref = this.store.getPreference('preferred_time_slot');
    if (timePref && timePref.confidence > 0.4) {
      const slots = timePref.value as Record<string, number>;
      const top = Object.entries(slots).sort((a, b) => b[1] - a[1])[0];
      insights.push(`User is most active during ${top[0]} hours (${Math.round(timePref.confidence * 100)}% confidence)`);
    }

    for (const pattern of patterns.filter(p => p.confidence > 0.5)) {
      insights.push(`Recurring pattern: ${pattern.description} (observed ${pattern.frequency} times)`);
    }

    if (adaptations.length > 0) {
      insights.push(`${adaptations.length} proactive adaptation rules are active`);
    }

    return {
      totalPatterns: patterns.length,
      totalPreferences: preferences.length,
      totalAdaptations: adaptations.length,
      topPatterns: patterns.sort((a, b) => b.confidence - a.confidence).slice(0, 10),
      insights,
    };
  }

  private generateAdaptations(context: string[]): AdaptationRule[] {
    return this.store.getActiveAdaptations().filter(a =>
      context.some(ctx => a.condition.toLowerCase().includes(ctx.toLowerCase()))
    );
  }

  public async initialize(): Promise<void> {
    console.log(`[${this.id}] Learning Agent initialized (threshold: ${this.learningThreshold} observations)`);
  }

  public async shutdown(): Promise<void> {
    console.log(`[${this.id}] Learning Agent shut down.`);
  }
}
