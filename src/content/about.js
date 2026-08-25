/** The "what is TORUK" band. */
export const about = {
  index: '02',
  label: 'What is TORUK',
  title: 'One platform where every agent is linked, observed, and owned',
  /*
   * Split so the component can set the emphasised clauses in full white and
   * the connective tissue in muted grey. Doing that with markup here rather
   * than parsing markers out of a string keeps the component presentational.
   */
  body: [
    { text: 'TORUK is the control plane between your models and your business.', strong: true },
    { text: ' Teams design agents on a visual canvas, wire them to the systems that already run the company, and ship them into environments that carry policy, identity, and lineage with them — ' },
    { text: 'so nothing runs outside the chain.', strong: true },
  ],
  points: [
    { id: 'canvas', title: 'Visual low-code canvas' },
    { id: 'runtime', title: 'Cloud · on-prem · hybrid' },
    { id: 'policy', title: 'Policy and audit at runtime' },
  ],
  figure: 'Fig. 01 — Interlock / single control plane',
  cta: { label: 'Explore the platform', href: '#platform' },
}
