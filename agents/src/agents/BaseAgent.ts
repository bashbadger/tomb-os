// ─────────────────────────────────────────────────────────────────────────────
// Tomb OS Multi-Agent — Abstract Base Agent
// All specialized agents inherit from this class
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import {
  AgentId,
  AgentRole,
  AgentStatus,
  AgentMessage,
  MessageType,
} from '../types';

export type MessageHandler = (message: AgentMessage) => Promise<AgentMessage | void>;

export abstract class BaseAgent {
  public readonly id: AgentId;
  public readonly role: AgentRole;
  public status: AgentStatus = AgentStatus.IDLE;

  private messageHandlers: Map<MessageType, MessageHandler> = new Map();
  private messageQueue: AgentMessage[] = [];
  private peers: Map<AgentId, BaseAgent> = new Map();

  constructor(role: AgentRole, id?: string) {
    this.id = id ?? `${role}-${uuidv4().slice(0, 8)}`;
    this.role = role;
  }

  // ── Peer Registration ───────────────────────────────────────────────────

  public registerPeer(agent: BaseAgent): void {
    this.peers.set(agent.id, agent);
  }

  public getPeer(id: AgentId): BaseAgent | undefined {
    return this.peers.get(id);
  }

  public getAllPeers(): BaseAgent[] {
    return Array.from(this.peers.values());
  }

  // ── Message Handling ────────────────────────────────────────────────────

  protected on(type: MessageType, handler: MessageHandler): void {
    this.messageHandlers.set(type, handler);
  }

  public async receive(message: AgentMessage): Promise<AgentMessage | void> {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      this.status = AgentStatus.PROCESSING;
      try {
        const response = await handler(message);
        this.status = AgentStatus.IDLE;
        return response;
      } catch (err) {
        this.status = AgentStatus.ERROR;
        console.error(`[${this.id}] Error processing message:`, err);
        return this.createMessage(
          message.from,
          MessageType.RESPONSE,
          { error: (err as Error).message },
          message.id
        );
      }
    }
    return undefined;
  }

  /** Send a message to a peer agent and await its response */
  protected async send(
    to: AgentId,
    type: MessageType,
    payload: unknown,
    correlationId?: string
  ): Promise<AgentMessage | void> {
    const peer = this.peers.get(to);
    if (!peer) {
      // Try to find by role prefix
      for (const [, agent] of this.peers) {
        if (agent.role === to || agent.id.startsWith(to)) {
          const msg = this.createMessage(agent.id, type, payload, correlationId);
          return agent.receive(msg);
        }
      }
      console.warn(`[${this.id}] No peer found for target: ${to}`);
      return undefined;
    }
    const msg = this.createMessage(to, type, payload, correlationId);
    return peer.receive(msg);
  }

  /** Broadcast a message to all peers */
  protected async broadcast(
    type: MessageType,
    payload: unknown
  ): Promise<(AgentMessage | void)[]> {
    const promises = Array.from(this.peers.values()).map(peer => {
      const msg = this.createMessage(peer.id, type, payload);
      return peer.receive(msg);
    });
    return Promise.all(promises);
  }

  protected createMessage(
    to: AgentId,
    type: MessageType,
    payload: unknown,
    correlationId?: string
  ): AgentMessage {
    return {
      id: uuidv4(),
      from: this.id,
      to,
      type,
      payload,
      timestamp: Date.now(),
      correlationId,
    };
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  public abstract initialize(): Promise<void>;
  public abstract shutdown(): Promise<void>;

  public getInfo(): Record<string, unknown> {
    return {
      id: this.id,
      role: this.role,
      status: this.status,
      peers: Array.from(this.peers.keys()),
    };
  }
}
