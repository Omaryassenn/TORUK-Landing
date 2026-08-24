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

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Studio', href: '#studio' },
  { label: 'Projects', href: '#projects' },
  { label: 'Blogs', href: '#blogs' },
]

export const headerCta = { label: 'Book a Demo', href: '#demo' }
