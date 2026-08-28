/**
 * Platform reel shown in the pinned section directly under the hero.
 *
 * TODO(media): the two encodes and the poster below are not in `public/` yet.
 * Drop them at these paths and the section plays; until then it renders its
 * idle state (the lockup watermark on canvas) and hides the play control.
 * Target a 16:9 master, ~1920x1080, muted-safe audio, under 12 MB for the mp4.
 */
export const showcase = {
  /** Names the section for assistive tech, and labels the play control. */
  label: 'TORUK platform reel',
  poster: '/media/toruk-reel-poster.webp',
  sources: [
    { src: '/media/toruk-reel.webm', type: 'video/webm' },
    { src: '/media/toruk-reel.mp4', type: 'video/mp4' },
  ],
}
