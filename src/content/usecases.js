/**
 * "Use cases" — Figma nodes 11122:115679 (the nine cards) and 11122:116097
 * (the same cards paged six at a time, with the pagination control under them).
 *
 * One card per deployment: the organisation's own mark on a tile, the job that
 * was handed over, and one line on what the AI Employee is responsible for.
 * There is no icon, no metric and no link in the frame — the mark is the
 * credential and the two lines under it are the whole card.
 *
 * The marks are the ones already committed for the hero strip wherever the
 * frame uses the same one (`public/brand/clients/`), so a client that appears
 * in both places is one file rather than two that can drift. Three marks the
 * strip does not carry were exported from the frame into the same folder.
 *
 * `ratio` is read off each file's own viewBox or pixel size, not copied from
 * the frame, and `width` is the mark's width in the frame's 289px-wide tile —
 * the stylesheet turns that into a percentage so the tile can scale without
 * any mark changing its size relative to the others.
 *
 * `tone` is the tile's ground, which the frame varies by mark rather than by
 * row: a mark that was drawn for a dark ground gets one. `tint` replaces it
 * where the frame fills the tile with a brand's own colour instead of one of
 * the three shared grounds.
 *
 * Copy is the frame's, with its em-dashes resolved to the punctuation the rest
 * of the page uses (see the note in `mindset.js`). The one place it diverges is
 * marked TODO below.
 */

/** Tile grounds, named for what they are for rather than for their value. */
export const TONES = {
  /* Colors the frame states directly: two near-whites and one near-black. */
  light: '#fffdfd',
  off: '#f8f8f8',
  dark: '#181818',
}

export const usecases = [
  {
    id: 'ia-public-questions',
    org: 'Insurance Authority',
    logo: '/brand/clients/ia.svg',
    width: 183,
    ratio: 2.4474,
    tone: 'light',
    title: 'Answering public questions at scale',
    body: 'An AI employee handles public enquiries about regulations, policies, and government rules, instantly.',
  },
  {
    id: 'mofa-rfps',
    org: 'Ministry of Foreign Affairs',
    logo: '/brand/clients/mofa.svg',
    width: 183,
    ratio: 2.7368,
    tone: 'light',
    title: 'Drafting RFPs for national procurement',
    body: 'An AI employee generates tender documents and project announcements, reducing weeks of drafting to hours.',
  },
  {
    id: 'riyadh-violations',
    org: 'Riyadh Region Municipality',
    logo: '/brand/clients/riyadh-municipality.svg',
    width: 183,
    ratio: 3.1552,
    tone: 'light',
    /*
     * TODO(copy): the frame repeats the RFP card's body here, beside it in the
     * same row, against a title about images. That reads as a paste rather than
     * as copy, so this line is written to the title it sits under. Replace it
     * with the intended line when the frame has one.
     */
    title: 'Detecting municipal violations from images',
    body: 'An AI employee reviews street and site imagery against municipal rules, flagging violations for an inspector to confirm.',
  },
  {
    id: 'jeddah-drawings',
    org: 'Jeddah Municipality',
    logo: '/brand/clients/jeddah-municipality.png',
    width: 183,
    ratio: 1.4871,
    tone: 'off',
    title: 'Validating documents and engineering drawings',
    body: 'An AI employee reviews incoming documents and technical drawings against defined standards automatically.',
  },
  {
    id: 'ipa-internal-questions',
    org: 'Institute of Public Administration',
    logo: '/brand/clients/ipa.svg',
    width: 183,
    ratio: 3.1842,
    tone: 'off',
    title: 'Answering internal team questions',
    body: 'An AI employee gives staff instant answers from internal documentation, reducing dependency on senior team members.',
  },
  {
    /*
     * Figma node 11121:113920, which reassigns this card from the IPA mark it
     * was drawn with to Bupa. Only the tile changed; the copy is the same.
     *
     * The export carries its own ground rather than being a mark on
     * transparency, so `tint` has to be the same blue the file is filled with
     * or the two would meet at a seam inside the tile. Both are #0079c8,
     * checked against the export's own corner pixels.
     *
     * Not `bupa.svg` from the hero strip: that one is the Bupa Arabia lockup at
     * 107x38, and this is the plain wordmark over the pulse line at 163x92. Two
     * different marks, so two files.
     */
    id: 'bupa-medical-approvals',
    org: 'Bupa Arabia',
    logo: '/brand/clients/bupa-white.png',
    width: 163,
    ratio: 1.7679,
    tint: '#0079c8',
    title: 'Accelerating medical approvals',
    body: 'An AI employee handles patient authorization requests, shortening approval times and reducing manual load.',
  },
  {
    id: 'tawuniya-approvals',
    org: 'Tawuniya',
    logo: '/brand/clients/tawuniya.svg',
    width: 127,
    ratio: 3.3421,
    tone: 'dark',
    title: 'Speeding up medical approval processes',
    body: 'An AI employee processes incoming approval requests and flags exceptions, keeping clinical teams on the cases that need them.',
  },
  {
    id: 'channels-service-requests',
    org: 'Channels by stc',
    logo: '/brand/clients/channels-by-stc.svg',
    width: 183,
    ratio: 3.5115,
    tone: 'off',
    title: 'Managing employee service requests',
    body: 'An AI employee gives staff instant answers from internal documentation, reducing dependency on senior team members.',
  },
  {
    id: 'roshn-vendor-documents',
    org: 'ROSHN Group',
    logo: '/brand/clients/roshan.svg',
    width: 182,
    ratio: 3.4474,
    tone: 'dark',
    title: 'Validating vendor documents at scale',
    body: 'An AI employee reviews and validates documents across 200+ vendors, flagging issues before they reach the team.',
  },
]

/**
 * How many cards a page holds.
 *
 * Six, from the frame: two full rows of three, which is what the pagination
 * control exists to page through. Nine cards over six is two pages, and the
 * second fills its row exactly.
 */
export const PER_PAGE = 6

/*
 * The section's header.
 *
 * TODO(figma): the two frames handed over are the card grid and the paged
 * grid; neither contains a header. This is written to the page's own pattern
 * so the section has a heading for the nav to land on and for the reader to
 * enter by. Replace it with the frame's copy when the header node exists.
 */
export const usecasesHeader = {
  eyebrow: 'Use cases',
  headline: 'The work already handed over.',
  body: 'A cross-section of what teams across government, healthcare and industry have given an AI Employee to own, and what it is answerable for.',
}
