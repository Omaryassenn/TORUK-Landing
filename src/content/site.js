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
  /* The real address, replacing the template's `hello@` placeholder. */
  email: 'info@youxel.com',

  /*
   * Split, because the two are read by different things. `href` is the number
   * exactly as given, digits and a country code and nothing else, which is what
   * `tel:` wants; `display` is the same number grouped the way a Saudi mobile
   * is written (+966 5X XXX XXXX) so a human can read it back off the screen.
   */
  phone: {
    display: '+966 54 462 0993',
    href: '+966544620993',
  },

  /*
   * The office lines, which the footer sets and the demo section does not: a
   * form is answered by whoever picks up the mobile above, and a switchboard is
   * what a footer is for.
   */
  officePhones: [
    { display: '+966 11 490 3824', href: '+966114903824' },
    { display: '+966 11 490 3825', href: '+966114903825' },
  ],

  /* Postal rather than street. The envelope in the footer is this, not email. */
  poBox: '54995, Riyadh 11524',

  /*
   * The offices, one array of lines each, in the order they are set on the
   * page. Lines rather than one string so the component decides where they
   * break instead of a `\n` deciding for it, and so a screen reader gets them
   * as an address rather than as a run-on sentence.
   *
   * Both are Riyadh and neither has a public name, so they are set as two
   * addresses under one label rather than being given invented ones.
   */
  offices: [
    [
      'Level 7, Building 4.07',
      'King Abdullah Financial District',
      'Riyadh, Saudi Arabia',
    ],
    [
      'Level 13, Al Faisaliah Tower',
      'Riyadh 11524',
      'Kingdom of Saudi Arabia',
    ],
  ],
}

/*
 * The primary nav, in page order.
 *
 * Every entry is an anchor to a section that is actually on the page, so the
 * order here is the order a reader scrolling would meet them. Adding an item
 * means there is a section with that id to add it for; the old Studio /
 * Projects / Blogs set pointed at three ids that were never built.
 *
 * `Home` stays first because it is the one item `activeHref` can mark as
 * current, and the bar's active state (medium weight, full white against the
 * muted rest) is the only thing telling a reader where they are. The lockup
 * links home too, but a lockup cannot carry that state.
 *
 * It is an anchor rather than `/` so it eases back up the page instead of
 * reloading it, which on one page is a blank screen and a splash to sit
 * through to arrive where a scroll would have taken you. It points at the
 * showcase scope rather than at the hero: the hero is sticky inside that scope
 * and cannot be scrolled to once it is stuck. See the note in `App`.
 */
export const nav = [
  { label: 'Home', href: '#hero' },
  { label: 'Platform', href: '#platform' },
  { label: 'Inside TORUK', href: '#inside' },
  { label: 'Use cases', href: '#usecases' },
]

/*
 * The footer's Product column points at the same id, so the bar's CTA and that
 * link land in the same place.
 */
export const headerCta = { label: 'Book a Demo', href: '#demo' }
