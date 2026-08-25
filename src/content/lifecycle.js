/**
 * The pinned lifecycle sequence. Order is the argument — each stage inherits
 * from the one above it — so this array is also the scroll order.
 */
export const lifecycle = {
  index: '03',
  label: 'Agent lifecycle',
  title: 'Five stages. One unbroken chain.',
  lede: 'Each stage inherits the identity, policy, and lineage of the stage before it. Nothing is re-declared, nothing drifts.',
  stages: [
    {
      id: 'design',
      title: 'Design',
      summary: 'Frame the job before a line of glue code',
      body: 'Describe the outcome, the systems in play, and the decisions a human keeps. TORUK turns that into a typed agent contract the rest of the lifecycle reads from.',
    },
    {
      id: 'build',
      title: 'Build',
      summary: 'Compose on the canvas',
      body: 'Drag tools, models, and data sources into a graph. Every node declares the permissions it needs inline, and the runtime enforces exactly that later — nothing broader.',
    },
    {
      id: 'orchestrate',
      title: 'Orchestrate',
      summary: 'Route work across agents, humans, and queues',
      body: 'Chain agents into workflows with retries, fallbacks, and human checkpoints. State is durable, so a run survives a restart and picks up where it stopped.',
    },
    {
      id: 'deploy',
      title: 'Deploy',
      summary: 'Ship to cloud, on-prem, or hybrid',
      body: 'Promote through environments with the same artifact. Runners execute inside your boundary; the control plane never sees a payload it was not granted.',
    },
    {
      id: 'govern',
      title: 'Govern',
      summary: 'Prove what ran, and why',
      body: 'Every call, decision, and redaction lands in an immutable log with the policy version that produced it. Auditors get a record, not a reconstruction.',
    },
  ],
}
