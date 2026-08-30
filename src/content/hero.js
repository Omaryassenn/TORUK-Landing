/**
 * Hero copy, lifted from the TORUK Studio Figma frame (node 10017-152334).
 * Components stay presentational — edit wording here.
 */
export const hero = {
  eyebrow: 'The adaptive AI ecosystem',
  /*
   * Two halves of one sentence, not two strings: same face, same size, and the
   * weight step on `emphasis` is the only thing that separates them. Split
   * here so the whole headline stays in the content file, which a `<strong>`
   * buried in the component would not.
   */
  headline: {
    lead: 'Build, deploy, and govern enterprise AI ',
    emphasis: 'from one platform.',
  },
  /*
   * The second half of what used to be one 140-character headline. It was
   * always two thoughts — what the platform does, then what it changes — and
   * as a single run it wrapped to four lines and read as neither.
   */
  body: 'Turn isolated AI experiments into connected, secure, production-ready systems.',
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
