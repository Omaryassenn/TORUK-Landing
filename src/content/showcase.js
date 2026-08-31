/**
 * Platform reel shown in the pinned section directly under the hero.
 *
 * TODO(media): the two encodes and the poster below are not in `public/` yet.
 * Drop them at these paths and the section plays; until then it renders its
 * idle state (the lockup watermark on canvas) and hides the play control.
 * Target a 16:9 master, ~1920x1080, muted-safe audio, under 12 MB for the mp4.
 */
export const showcase = {
  /** Labels the play control. The section is named by its own heading. */
  label: 'TORUK platform reel',
  eyebrow: 'See TORUK in action',
  headline: 'From idea to production in one platform.',
  body: 'See how teams build AI applications, connect enterprise knowledge and tools, automate workflows, and deploy them securely.',
  poster: '/media/toruk-reel-poster.webp',
  sources: [
    { src: '/media/toruk-reel.webm', type: 'video/webm' },
    { src: '/media/toruk-reel.mp4', type: 'video/mp4' },
  ],
}
