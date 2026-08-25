/**
 * The product-tour band. `poster` reuses the hero's chain render rather than a
 * separate still — the section reads as the same object seen closer, which is
 * what keeps the page feeling like one world instead of a stock library.
 */
export const demo = {
  index: '01',
  label: 'Product tour',
  title: 'See one agent go from canvas to production',
  lede: 'A single claims agent, built on the canvas, wired to a live system, then shipped behind policy — recorded end to end, no cuts.',
  duration: '2:40',
  chapters: [
    { time: '00:00', title: 'Compose on the canvas' },
    { time: '00:41', title: 'Wire the tools' },
    { time: '01:26', title: 'Deploy to a runner' },
    { time: '02:03', title: 'Watch the audit trail' },
  ],
  environment: 'Live environment · sandbox-01',
  cta: { label: 'Watch full walkthrough', href: '#demo' },
}
