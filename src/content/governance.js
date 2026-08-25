/** The governance band — the page's proof section. */
export const governance = {
  index: '04',
  label: 'Governance',
  title: 'Every action leaves a record you can defend',
  lede: 'Policy is attached to the agent, not to the environment it happens to be running in. Approvals, redactions, and model routing are evaluated at call time and written down.',
  controls: [
    { id: 'rbac', title: 'Role-based access', standard: 'SOC 2' },
    { id: 'pii', title: 'PII redaction', standard: 'GDPR' },
    { id: 'hitl', title: 'Human-in-the-loop gates', standard: 'EU AI Act' },
    { id: 'audit', title: 'Immutable audit trail', standard: 'ISO 27001' },
    { id: 'routing', title: 'Model routing policy', standard: 'HIPAA' },
  ],
  cta: { label: 'Read the security brief', href: '#security' },
}
