/**
 * "Dive Into TORUK" — the section that takes the reader through the mark and
 * lands on the two environments behind it.
 *
 * `entry` is the heading block. It holds the top of the stage for the whole
 * scroll; only what sits under it changes.
 *
 * The two destinations are Figma nodes 11087:110778 and 11087:110873. Those
 * frames replace the pair of small cards the section used to end on with one
 * wide panel per environment, shown one at a time: a column of copy on the
 * left, a capture of that environment on the right, and three capabilities
 * under a rule. An earlier frame carried no capability list and this file
 * said so; it does now, and three of them fit beside the picture where four
 * stacked under it did not.
 *
 * The captures are the frames' own assets, cropped to the picture window each
 * frame places them in and committed under `public/inside/` — the same
 * treatment the Mindset section's captures get, so what ships is what was
 * designed rather than a re-shoot.
 */
export const inside = {
  entry: {
    eyebrow: 'Inside TORUK',
    headline: 'Dive Into TORUK',
    body:
      'Step inside the platform and explore the two environments at its core — Studio, where AI is built, and Everyday, where it gets used.',
    /*
     * "Scroll to enter", not "scroll to explore". The section's whole promise
     * is that scrolling moves you THROUGH the mark rather than past it, and
     * the hint is the only place that is stated in words.
     */
    hint: 'Scroll to enter',
  },

  /*
   * `index` is written out rather than counted from the array, because it is
   * read as part of the label — "01 - TORUK Studio" is the destination's name
   * inside the section, not a list bullet.
   *
   * `icon` on a capability is the frame's own exported glyph, committed under
   * `public/inside/icons/` and named for the icon it is in the design system.
   * They are drawn white at 21px and tinted by nothing; the tile behind them
   * is what carries the colour.
   */
  studio: {
    index: '01',
    label: 'TORUK Studio',
    headline: 'Where AI is built',
    body:
      'Studio is where teams create and control the intelligence behind TORUK — from AI apps and workflows to knowledge, functions, and integrations.',
    shot: '/inside/studio.webp',
    capabilities: [
      {
        icon: '/inside/icons/wrench-01.svg',
        label: 'Build',
        body: 'Create AI apps, agents, and multi-step workflows.',
      },
      {
        icon: '/inside/icons/hierarchy-square-04.svg',
        label: 'Connect',
        body: 'Bring in models, knowledge, functions, APIs, and integrations.',
      },
      {
        /*
         * The frame gives Operate the same glyph as Connect. Kept as drawn
         * rather than substituted — this is the one place in the section where
         * the design and the page would part company on a guess.
         */
        icon: '/inside/icons/hierarchy-square-04.svg',
        label: 'Operate',
        body: 'Test, observe, version, deploy, and continuously improve what you build.',
      },
    ],
  },

  everyday: {
    index: '02',
    label: 'TORUK Everyday',
    headline: 'Where AI gets to work',
    body:
      'Everyday is where people interact with AI in their flow of work — through conversations, dynamic interfaces, tasks, and generated outputs.',
    shot: '/inside/everyday.webp',
    capabilities: [
      {
        icon: '/inside/icons/message-multiple-01.svg',
        label: 'Assist',
        body: 'Get help, answers, and updates through natural conversations.',
      },
      {
        icon: '/inside/icons/cursor-magic-selection-02.svg',
        label: 'Take action',
        body: 'Complete tasks, submit inputs, and use dynamic UI without friction.',
      },
      {
        icon: '/inside/icons/file-01.svg',
        label: 'Get result',
        body: 'Receive ready-to-use outputs, insights, and generated documents.',
      },
    ],
  },
}
