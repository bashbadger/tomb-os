// ─────────────────────────────────────────────────────────────────────────────
// Tomb OS Multi-Agent — Task Agent
// Executes user tasks, applies learned shortcuts, and records results
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import { BaseAgent } from './BaseAgent';
import {
  AgentRole,
  MessageType,
  TaskDefinition,
  TaskStep,
  TaskStatus,
  AgentMessage,
} from '../types';

export class TaskAgent extends BaseAgent {
  private activeTasks: Map<string, TaskDefinition> = new Map();
  private taskHistory: TaskDefinition[] = [];

  constructor() {
    super(AgentRole.TASK);
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.on(MessageType.TASK_EXECUTE, async (msg: AgentMessage) => {
      const { name, description, steps } = msg.payload as {
        name: string;
        description: string;
        steps: Array<{ action: string; params: Record<string, unknown> }>;
      };

      const task = this.createTask(name, description, steps);
      const result = await this.executeTask(task);

      // Notify the orchestrator that the task is complete
      return this.createMessage(msg.from, MessageType.TASK_COMPLETE, {
        taskId: task.id,
        name: task.name,
        status: task.status,
        result: task.result,
        error: task.error,
        duration: (task.completedAt ?? Date.now()) - task.createdAt,
      }, msg.id);
    });

    this.on(MessageType.QUERY, async (msg: AgentMessage) => {
      const { action, taskId } = msg.payload as { action: string; taskId?: string };

      switch (action) {
        case 'status':
          if (taskId) {
            const task = this.activeTasks.get(taskId);
            return this.createMessage(msg.from, MessageType.RESPONSE, {
              task: task ?? null,
            }, msg.id);
          }
          return this.createMessage(msg.from, MessageType.RESPONSE, {
            activeTasks: Array.from(this.activeTasks.values()),
          }, msg.id);

        case 'history':
          return this.createMessage(msg.from, MessageType.RESPONSE, {
            history: this.taskHistory.slice(-50),
          }, msg.id);

        default:
          return this.createMessage(msg.from, MessageType.RESPONSE, {
            error: `Unknown action: ${action}`,
          }, msg.id);
      }
    });
  }

  // ── Task Lifecycle ──────────────────────────────────────────────────────

  private createTask(
    name: string,
    description: string,
    rawSteps: Array<{ action: string; params: Record<string, unknown> }>
  ): TaskDefinition {
    const steps: TaskStep[] = rawSteps.map((s, idx) => ({
      id: `step-${idx + 1}`,
      action: s.action,
      params: s.params,
      status: TaskStatus.PENDING,
      retryCount: 0,
      maxRetries: 3,
    }));

    const task: TaskDefinition = {
      id: uuidv4(),
      name,
      description,
      steps,
      priority: 1,
      status: TaskStatus.PENDING,
      createdAt: Date.now(),
    };

    this.activeTasks.set(task.id, task);
    return task;
  }

  private async executeTask(task: TaskDefinition): Promise<TaskDefinition> {
    task.status = TaskStatus.RUNNING;
    console.log(`[${this.id}] Executing task: ${task.name}`);

    const stepResults: unknown[] = [];

    for (const step of task.steps) {
      try {
        step.status = TaskStatus.RUNNING;
        const result = await this.executeStep(step);
        step.result = result;
        step.status = TaskStatus.COMPLETED;
        stepResults.push(result);
      } catch (err) {
        step.retryCount++;
        if (step.retryCount < step.maxRetries) {
          console.warn(`[${this.id}] Step ${step.id} failed, retrying (${step.retryCount}/${step.maxRetries})`);
          try {
            const retryResult = await this.executeStep(step);
            step.result = retryResult;
            step.status = TaskStatus.COMPLETED;
            stepResults.push(retryResult);
          } catch {
            step.status = TaskStatus.FAILED;
            task.status = TaskStatus.FAILED;
            task.error = `Step ${step.id} failed after ${step.retryCount} retries: ${(err as Error).message}`;
            task.completedAt = Date.now();
            this.archiveTask(task);
            return task;
          }
        } else {
          step.status = TaskStatus.FAILED;
          task.status = TaskStatus.FAILED;
          task.error = `Step ${step.id} failed: ${(err as Error).message}`;
          task.completedAt = Date.now();
          this.archiveTask(task);
          return task;
        }
      }
    }

    task.status = TaskStatus.COMPLETED;
    task.result = stepResults;
    task.completedAt = Date.now();
    this.archiveTask(task);
    console.log(`[${this.id}] Task completed: ${task.name} (${task.completedAt - task.createdAt}ms)`);
    return task;
  }

  private async executeStep(step: TaskStep): Promise<unknown> {
    // Dispatch step execution based on action type
    switch (step.action) {
      case 'log':
        console.log(`[TaskStep] ${step.params.message}`);
        return { logged: true };

      case 'transform':
        return { transformed: step.params };

      case 'validate':
        return { valid: true, params: step.params };

      case 'compute':
        return { computed: true, input: step.params };

      case 'notify':
        console.log(`[TaskStep] Notification: ${step.params.message}`);
        return { notified: true };

      case 'wait':
        const ms = (step.params.duration as number) ?? 100;
        await new Promise(resolve => setTimeout(resolve, ms));
        return { waited: ms };

      case 'read_file':
      case 'list_directory':
        const userGranted = (step.params.userGrantedFsAccess as boolean) ?? false;
        if (!userGranted) {
          throw new Error('PERMISSION_DENIED: Host filesystem access requires explicit user authorization.');
        }
        const targetPath = (step.params.path as string) ?? '/';
        console.log(`[TaskStep] [FS ACCESS GRANTED] Accessing host disk path: ${targetPath}`);
        return { accessed: true, path: targetPath, status: 'HOST_FILESYSTEM_INDEXED' };

      default:
        // Generic execution — extensible via plugin registration
        console.log(`[TaskStep] Executing generic action: ${step.action}`);
        return { action: step.action, params: step.params, executed: true };
    }
  }

  private archiveTask(task: TaskDefinition): void {
    this.activeTasks.delete(task.id);
    this.taskHistory.push(task);
    // Keep history bounded
    if (this.taskHistory.length > 500) {
      this.taskHistory = this.taskHistory.slice(-500);
    }
  }

  public async initialize(): Promise<void> {
    console.log(`[${this.id}] Task Agent initialized.`);
  }

  public async shutdown(): Promise<void> {
    // Cancel any remaining active tasks
    for (const [id, task] of this.activeTasks) {
      task.status = TaskStatus.CANCELLED;
      task.completedAt = Date.now();
      this.taskHistory.push(task);
    }
    this.activeTasks.clear();
    console.log(`[${this.id}] Task Agent shut down.`);
  }
}
