/**
 * krts.ui/agent — lets AI agents read and drive krts.ui components through
 * their own APIs: no screenshots, no guessing at pixels.
 *
 * ```ts
 * import { createKrtsAgent, krtsAgentTools, registerKrtsAgentTools } from 'krts.ui/agent';
 *
 * const agent = createKrtsAgent();
 * agent.snapshot();                 // what's on screen
 * agent.query({ text: 'country' }); // find things, list choices
 * await agent.act({ steps: [{ ref: 'Email', action: 'setValue', args: ['a@b.co'] }] });
 * agent.subscribe((e) => …);        // watch changes
 * ```
 */
export { createKrtsAgent, summarize, type KrtsAgent, type KrtsAgentOptions } from './agent';
export {
  getModelContext,
  krtsAgentTools,
  registerKrtsAgentTools,
  type KrtsAgentTool,
  type RegisterKrtsAgentToolsOptions,
} from './tools';
export { KrtsAgentApprovals, type KrtsAgentApprovalsProps } from './Approvals';
export {
  isKrtsAgentActing,
  useKrtsAgentComponent,
  type KrtsAgentAction,
  type KrtsAgentActions,
  type KrtsAgentComponentSpec,
} from './registry';
export { AgentError as KrtsAgentError } from './dom';
export type {
  KrtsAgentActResult,
  KrtsAgentApprovalRequest,
  KrtsAgentChangeSource,
  KrtsAgentComponent,
  KrtsAgentEvent,
  KrtsAgentItem,
  KrtsAgentMark,
  KrtsAgentProps,
  KrtsAgentQuery,
  KrtsAgentQueryResult,
  KrtsAgentStep,
  KrtsAgentStepResult,
} from './types';
