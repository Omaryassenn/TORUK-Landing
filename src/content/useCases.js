/**
 * Stacked-card sequence. `tone` picks the card's surface so the deck alternates
 * as it stacks — an all-identical stack reads as a rendering bug rather than a
 * deliberate pile.
 */
export const useCases = {
  index: '05',
  label: 'Use cases',
  title: 'Where the chain is already load-bearing',
  lede: 'Five places teams put a first agent into production — each one shipped behind the same policy engine.',
  cta: { label: 'All 14 use cases', href: '#use-cases' },
  cards: [
    {
      id: 'claims',
      number: '01',
      sector: 'Insurance · Banking',
      title: 'Claims and underwriting',
      body: 'Agents read the file, cite the policy clause they relied on, and route anything outside tolerance to a named approver with the reasoning attached.',
      metric: '68% of files cleared without a second touch',
      tone: 'image',
    },
    {
      id: 'cx',
      number: '02',
      sector: 'Customer operations',
      title: 'Tier-one resolution',
      body: 'Resolve the routine contact end to end, and hand the rest to a person with the full transcript, the customer record, and the step it stopped on.',
      metric: 'Median handling time down 41%',
      tone: 'raised',
    },
    {
      id: 'backoffice',
      number: '03',
      sector: 'Finance · Operations',
      title: 'Back-office automation',
      body: 'Reconciliation and document flow across the systems that never had an API — driven through the same connectors, logged the same way.',
      metric: '12k documents a day, one reviewer',
      tone: 'flat',
    },
    {
      id: 'engineering',
      number: '04',
      sector: 'Engineering',
      title: 'Scoped engineering copilots',
      body: 'Repository access narrowed to the service in question, review gates before anything merges, and an audit line per commit the agent touched.',
      metric: 'Zero unscoped repo reads since rollout',
      tone: 'raised',
    },
    {
      id: 'research',
      number: '05',
      sector: 'Legal · Regulated research',
      title: 'Defensible research',
      body: 'Synthesis across internal and licensed sources where every claim carries a citation an auditor can open — and nothing is asserted without one.',
      metric: '100% of claims source-linked',
      tone: 'image',
    },
  ],
}
