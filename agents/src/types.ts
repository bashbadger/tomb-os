// ─────────────────────────────────────────────────────────────────────────────
// Tomb OS Multi-Agent System — Core Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

/** Unique identifier for agents, memories, and interactions */
export type AgentId = string;
export type MemoryId = string;
export type InteractionId = string;

// ── Agent Lifecycle ─────────────────────────────────────────────────────────

export enum AgentRole {
  ORCHESTRATOR = 'orchestrator',
  MEMORY       = 'memory',
  LEARNING     = 'learning',
  TASK         = 'task',
  SECURITY     = 'security',
}

export enum AgentStatus {
  IDLE       = 'idle',
  PROCESSING = 'processing',
  WAITING    = 'waiting',
  ERROR      = 'error',
}

export interface AgentMessage {
  id: string;
  from: AgentId;
  to: AgentId;
  type: MessageType;
  payload: unknown;
  timestamp: number;
  correlationId?: string;
}

export enum MessageType {
  REQUEST       = 'request',
  RESPONSE      = 'response',
  EVENT         = 'event',
  QUERY         = 'query',
  LEARN         = 'learn',
  RECALL        = 'recall',
  ADAPT         = 'adapt',
  TASK_EXECUTE  = 'task_execute',
  TASK_COMPLETE = 'task_complete',
}

// ── Memory & Learning ───────────────────────────────────────────────────────

export enum MemoryType {
  INTERACTION  = 'interaction',   // Raw user interaction log
  PREFERENCE   = 'preference',    // Learned user preference
  PATTERN      = 'pattern',       // Detected behavioral pattern
  SKILL        = 'skill',         // Learned capability / shortcut
  CONTEXT      = 'context',       // Contextual session state
  FEEDBACK     = 'feedback',      // Explicit user feedback
}

export interface Memory {
  id: MemoryId;
  type: MemoryType;
  category: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding?: number[];          // Semantic embedding vector for similarity search
  weight: number;                // Importance / relevance weight (0–1)
  accessCount: number;           // How many times this memory has been recalled
  createdAt: number;
  lastAccessedAt: number;
  decayRate: number;             // How quickly this memory fades (0 = permanent)
  tags: string[];
}

export interface UserPreference {
  key: string;
  value: unknown;
  confidence: number;            // 0–1 confidence score
  observedCount: number;         // How many times this preference was observed
  lastObserved: number;
  source: 'explicit' | 'inferred';
}

export interface BehaviorPattern {
  id: string;
  description: string;
  triggerConditions: string[];    // What triggers this pattern
  actions: string[];             // What the user typically does
  frequency: number;             // How often this pattern occurs
  confidence: number;
  lastOccurred: number;
  predictedNextAction?: string;
}

// ── User Interaction ────────────────────────────────────────────────────────

export interface UserInteraction {
  id: InteractionId;
  sessionId: string;
  input: string;
  intent: string;
  entities: Record<string, string>;
  response: string;
  agentChain: AgentId[];         // Which agents handled this interaction
  satisfaction?: number;          // User satisfaction score (1–5)
  timestamp: number;
  duration: number;               // Processing time in ms
  context: Record<string, unknown>;
}

// ── Task Execution ──────────────────────────────────────────────────────────

export enum TaskStatus {
  PENDING    = 'pending',
  RUNNING    = 'running',
  COMPLETED  = 'completed',
  FAILED     = 'failed',
  CANCELLED  = 'cancelled',
}

export interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  steps: TaskStep[];
  priority: number;
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
  result?: unknown;
  error?: string;
}

export interface TaskStep {
  id: string;
  action: string;
  params: Record<string, unknown>;
  status: TaskStatus;
  result?: unknown;
  retryCount: number;
  maxRetries: number;
}

// ── Adaptation ──────────────────────────────────────────────────────────────

export interface AdaptationRule {
  id: string;
  condition: string;             // When to apply this adaptation
  action: string;                // What to change
  priority: number;
  enabled: boolean;
  appliedCount: number;
  successRate: number;
  createdAt: number;
}

// ── System Configuration ────────────────────────────────────────────────────

export interface AgentSystemConfig {
  persistencePath: string;
  memoryDecayInterval: number;   // How often to run memory decay (ms)
  maxMemories: number;
  learningThreshold: number;     // Minimum observations before creating a pattern
  adaptationEnabled: boolean;
  debugMode: boolean;
}

export const DEFAULT_CONFIG: AgentSystemConfig = {
  persistencePath: './data/agent_memory',
  memoryDecayInterval: 3600000,  // 1 hour
  maxMemories: 10000,
  learningThreshold: 3,
  adaptationEnabled: true,
  debugMode: false,
};
