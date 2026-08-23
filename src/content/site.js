/**
 * Site-wide copy and configuration.
 * Everything a marketer might want to tweak lives in `src/content/` —
 * components stay presentational.
 */
export const site = {
  name: 'TORUK',
  tagline: 'Ship your product story in an afternoon',
  description:
    'A fast, accessible landing page starter with design tokens, section components and content separated from presentation.',
  url: 'https://example.com',
  email: 'hello@example.com',
}

export const nav = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
]

export const footerNav = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
]

export const socials = [
  { label: 'X', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'LinkedIn', href: '#' },
]
