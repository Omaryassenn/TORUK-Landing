/**
 * Footer copy — Figma node 11112:111077.
 *
 * The frame is a two-half band over a full-width setting of the wordmark: a
 * statement on the left, link columns on the right, and one line of legal at
 * the foot of it. The statement is the page's closing line rather than a
 * heading, which is why it is a pair of short sentences and not a paragraph.
 *
 * Hrefs are the same in-page placeholders the rest of `content/` uses. Nothing
 * here points anywhere off-site yet; LinkedIn included, so no URL is invented.
 */
export const footer = {
  /* The left column's own label, a peer of the three below it. */
  label: 'TORUK',
  /*
   * Two sentences, read as one. The second is the payoff and is set in white
   * where the first is muted — that contrast is the only emphasis in the
   * block, so the two are stated separately rather than as one string.
   */
  statement: ['Build AI.', 'Put it to work.'],

  columns: [
    {
      label: 'Product',
      links: [
        { label: 'Studio', href: '#studio' },
        { label: 'Everyday', href: '#everyday' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Book a Demo', href: '#demo' },
      ],
    },
    {
      label: 'Resources',
      links: [
        { label: 'Documentation', href: '#docs' },
        { label: 'Security', href: '#security' },
        { label: 'Support', href: '#support' },
      ],
    },
    {
      label: 'Company',
      links: [
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
        { label: 'LinkedIn', href: '#linkedin' },
      ],
    },
  ],

  copyright: '© 2026 TORUK. All rights reserved.',

  legal: [
    { label: 'Privacy', href: '#privacy' },
    { label: 'Terms', href: '#terms' },
    { label: 'Cookies', href: '#cookies' },
  ],
}
