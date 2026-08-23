export const pricing = {
  title: 'Simple, predictable pricing',
  subtitle: 'Start free. Upgrade when the page starts paying for itself.',
  plans: [
    {
      id: 'starter',
      name: 'Starter',
      price: '$0',
      period: '/mo',
      description: 'For side projects and validation.',
      features: ['1 landing page', 'Community support', 'Basic analytics'],
      cta: { label: 'Start free', href: '#' },
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: '/mo',
      description: 'For teams shipping continuously.',
      features: [
        'Unlimited pages',
        'A/B testing',
        'Custom domains',
        'Priority support',
      ],
      cta: { label: 'Start 14-day trial', href: '#' },
      featured: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For organisations with review processes.',
      features: ['SSO & SAML', 'SLA & DPA', 'Dedicated support', 'Onboarding'],
      cta: { label: 'Talk to sales', href: '#' },
    },
  ],
}
