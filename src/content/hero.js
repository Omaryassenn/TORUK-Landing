/**
 * Hero copy, lifted from the TORUK Studio Figma frame (node 10017-152334).
 * Components stay presentational — edit wording here.
 */
export const hero = {
  eyebrow: 'The adaptive AI ecosystem',
  // The frame sets a hyphen here, not an em dash — kept as designed.
  headline:
    'Build, orchestrate, deploy, and govern enterprise AI agents from one platform - from isolated experiments to secure, production-ready systems.',
  primaryCta: { label: 'Book a Demo', href: '#demo' },
  secondaryCta: { label: 'Explore the Platform', href: '#platform' },
  capabilities: [
    'Build · Orchestrate',
    'Visual low-code canvas',
    'Deploy · Govern',
    'Cloud · On-prem · Hybrid',
  ],
  /** Chain render exported from node 10017:152382 and committed as WebP. */
  artwork: {
    src: '/hero-chain.webp',
    alt: '',
  },
}
