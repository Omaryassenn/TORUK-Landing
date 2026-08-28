/**
 * Client logo strip in the hero (Figma node 10857:167557).
 *
 * The frame lays the marks out at a uniform height on a uniform gap, so both
 * of those are tokens in the stylesheet and each entry carries only its own
 * aspect ratio. Sizing from the ratio rather than a per-mark width lets the
 * whole strip step down on small screens without any mark distorting, and it
 * reserves the correct slot before the file loads, so the row never reflows.
 *
 * `ratio` is read off each export's own viewBox, not copied from the frame.
 * The marks are committed at `public/brand/clients/<slug>.svg`, in the frame's
 * own order — the strip loops, so the order is a rhythm rather than a ranking.
 *
 * `name` is what a screen reader announces for the mark and nothing renders it
 * visually, which is the whole reason it has to be the real organisation.
 */
export const clients = [
  { slug: 'cerqel', name: 'CERQEL', ratio: 4.1053 },
  { slug: 'jazan-municipality', name: 'Jazan Municipality', ratio: 3.6579 },
  { slug: 'ipa', name: 'Institute of Public Administration', ratio: 3.1842 },
  { slug: 'ia', name: 'Insurance Authority', ratio: 2.4474 },
  { slug: 'moc', name: 'Ministry of Culture', ratio: 1.5789 },
  /* TODO(name): the frame calls this one `GAFTLogo` and the mark is too small
   * to read back — confirm before this ships. */
  { slug: 'gaft', name: 'GAFT', ratio: 3.4474 },
  { slug: 'roshan', name: 'ROSHN Group', ratio: 3.4474 },
  { slug: 'aseer', name: 'Aseer Development Authority', ratio: 2.4737 },
  { slug: 'bupa', name: 'Bupa Arabia', ratio: 2.8158 },
  { slug: 'tawuniya', name: 'Tawuniya', ratio: 3.3421 },
  { slug: 'sap', name: 'SAP', ratio: 2.0263 },
  { slug: 'mofa', name: 'Ministry of Foreign Affairs', ratio: 2.7368 },
  { slug: 'stc', name: 'stc', ratio: 2.0526 },
  { slug: 'check', name: 'CHECK', ratio: 3.5526 },
  {
    slug: 'pnu',
    name: 'Princess Nourah bint Abdulrahman University',
    ratio: 2.9474,
  },
  { slug: 'youxel', name: 'Youxel', ratio: 3.8421 },
]

/** Screen-reader name for the strip as a whole. */
export const clientsLabel = 'Organisations building on TORUK'
