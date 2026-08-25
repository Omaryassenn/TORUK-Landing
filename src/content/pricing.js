/**
 * Priced per environment rather than per seat — which is the actual argument
 * of this band, so it is the subtitle rather than a footnote.
 */
export const pricing = {
  index: '07',
  label: 'Pricing',
  title: 'Priced per environment, not per seat',
  lede: 'Add the whole team to a plan. You pay for where agents run, not for who is watching them.',
  note: 'Every plan includes the full lifecycle — build, orchestrate, deploy, govern.',
  plans: [
    {
      id: 'starter',
      name: 'Starter',
      price: '$1,200',
      period: '/ mo',
      description: 'One environment, for a first agent in production.',
      features: [
        '1 production environment',
        'Up to 5 agents',
        'Standard connectors',
        '90-day audit retention',
        'Email support',
      ],
      cta: { label: 'Start a trial', href: '#trial' },
    },
    {
      id: 'scale',
      name: 'Scale',
      price: '$4,800',
      period: '/ mo',
      description: 'Multi-environment with policy, SSO, and hybrid runners.',
      features: [
        'Unlimited environments',
        'Unlimited agents',
        'On-prem and hybrid runners',
        'SSO · RBAC · approval gates',
        '2-year audit retention',
        'Shared Slack channel',
      ],
      cta: { label: 'Book a Demo', href: '#demo' },
      featured: true,
      badge: 'Most teams',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Air-gapped deployment and custom policy packs.',
      features: [
        'Everything in Scale',
        'Air-gapped or VPC install',
        'Custom policy packs',
        '99.95% SLA',
        'Named technical account manager',
      ],
      cta: { label: 'Talk to sales', href: '#contact' },
    },
  ],
}
