import { site, nav, headerCta } from './site'

/**
 * Footer copy — Figma node 11112:111077, with the band's content replaced.
 *
 * The frame's own composition is kept: a band of columns over a deliberate
 * hole, one line of legal at the foot of it, and the wordmark set full width
 * beneath. The left half is still the frame's closing statement, with the
 * company's contact details under it; the three link columns are now two.
 *
 * The addresses are `site.offices` joined into one line each rather than
 * stated again here. The footer runs them as flowing text where the demo
 * section stacks them, but they are the same two places and there is no
 * version of this where they should be able to disagree.
 *
 * In-page hrefs are the same placeholders the rest of `content/` uses. The
 * three socials are the page's only real off-site links.
 */
export const footer = {
  /*
   * The page's closing line, above the contact rows.
   *
   * Two sentences, read as one. The second is the payoff and is set in white
   * where the first is muted — that contrast is the only emphasis in the
   * block, so the two are stated separately rather than as one string.
   */
  statement: ['Build AI.', 'Put it to work.'],

  /*
   * The contact rows, in the order they are set.
   *
   * `label` is never rendered visually; each row carries an icon and nothing
   * else. It is read out instead, because an icon is decorative and a bare
   * "+966 11 490 3824" announced on its own says nothing about what it is.
   *
   * `values` is a list because a row can hold more than one, and `inline` is
   * what says they sit beside each other rather than stacking.
   */
  contact: [
    ...site.offices.map((lines) => ({
      id: lines[0],
      label: 'Address',
      icon: '/contact/icons/location.svg',
      values: [{ text: lines.join(', ') }],
    })),
    /*
     * Both office lines under one icon, side by side. Two rows of the same
     * glyph against two numbers that differ in their last digit read as the
     * block having been pasted twice; they are one entry with two numbers.
     */
    {
      id: 'phones',
      label: 'Phone',
      icon: '/contact/icons/phone.svg',
      inline: true,
      values: site.officePhones.map((phone) => ({
        text: phone.display,
        href: `tel:${phone.href}`,
      })),
    },
    {
      id: 'po-box',
      label: 'P.O. Box',
      icon: '/contact/icons/mail.svg',
      values: [{ text: site.poBox }],
    },
  ],

  columns: [
    {
      label: 'Socials',
      /*
       * The only off-site links on the page. `LinkColumn` opens anything
       * absolute in a new tab, so the reader does not lose the page to a
       * social profile.
       *
       * The LinkedIn href is the company page without the `?feedView=all` it
       * was given with: that parameter is a state of whoever copied the URL,
       * not part of the address.
       */
      links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com/company/youxel/' },
        { label: 'Facebook', href: 'https://www.facebook.com/youxel' },
        { label: 'X', href: 'https://x.com/youxel' },
      ],
    },
    {
      label: 'Navigation',
      /*
       * The navbar's own links, not a second list of them.
       *
       * Two sets of names for the same four sections is two things to keep in
       * step, and the page has already been through the version where they
       * disagreed — the old column offered `Products`, `About` and `News`,
       * only one of which answered to anything on the page.
       *
       * `headerCta` is on the end because it is the fifth thing in the bar and
       * the one the whole page is pointed at; a footer that lists the nav and
       * drops the demo is missing the link most likely to be wanted there.
       */
      links: [...nav, headerCta],
    },
  ],

  /*
   * The legal owner, not the product. TORUK is the thing the page is about;
   * YOUXEL Technology is who the page belongs to, which is what a copyright
   * line states.
   */
  copyright: '© 2026 YOUXEL Technology. All rights reserved.',

  legal: [
    /* Both are real pages, each at its own entry. See `vite.config.js`. */
    { label: 'Privacy', href: '/privacy/' },
    { label: 'Terms', href: '/terms/' },
  ],
}
