/**
 * Site-wide copy and configuration.
 * Everything a marketer might want to tweak lives in `src/content/` —
 * components stay presentational.
 */
export const site = {
  name: 'TORUK',
  tagline: 'The adaptive AI ecosystem',
  description:
    'Build, orchestrate, deploy, and govern enterprise AI agents from one platform.',
  url: 'https://toruk.studio',
  email: 'hello@toruk.studio',
}

/*
 * The nav mirrors the page's own argument rather than a site map — every entry
 * is an anchor into a band below, so the header doubles as a table of contents
 * for a single-page story.
 */
export const nav = [
  { label: 'Platform', href: '#platform' },
  { label: 'Lifecycle', href: '#lifecycle' },
  { label: 'Governance', href: '#governance' },
  { label: 'Pricing', href: '#pricing' },
]

export const headerCta = { label: 'Book a Demo', href: '#demo' }
