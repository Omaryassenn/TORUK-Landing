/** Questions the security review actually asks, in the order it asks them. */
export const faq = {
  index: '08',
  label: 'FAQ',
  title: 'Questions we get from security teams',
  lede: "If yours isn't here, our solutions engineers answer it directly — no gatekeeping, no form.",
  cta: { label: 'Talk to an engineer', href: '#contact' },
  items: [
    {
      id: 'data',
      question: 'Does our data ever leave our infrastructure?',
      answer:
        'No. Runners execute inside your VPC or on-premise cluster. The TORUK control plane sees metadata, policy decisions, and audit events — never payloads. An air-gapped install syncs nothing at all.',
    },
    {
      id: 'models',
      question: 'Which models can we route to?',
      answer:
        'Any hosted provider you hold a contract with, plus self-hosted open-weight models on your own GPUs. Routing is a policy decision, so you can pin a class of work to a specific model and prove later that it stayed there.',
    },
    {
      id: 'gates',
      question: 'How do human approval gates work?',
      answer:
        'A gate is a node in the workflow with an owner and a timeout. The run pauses durably, the approver sees the agent’s reasoning and the exact action awaiting sign-off, and their decision is written into the same audit record as the run.',
    },
    {
      id: 'audit',
      question: 'What does the audit log actually capture?',
      answer:
        'Every tool call, model invocation, policy evaluation, redaction, and human decision — each stamped with the agent version and the policy version in force at the time. Records are append-only and exportable to your own SIEM.',
    },
    {
      id: 'timeline',
      question: 'How long does a first deployment take?',
      answer:
        'Most teams have an agent handling real traffic in two to four weeks. The work is almost never the agent — it is agreeing the policy and the connectors, which is why we start there.',
    },
  ],
}
