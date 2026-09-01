/**
 * "Dive Into TORUK" — the section that takes the reader through the mark and
 * lands on the two environments behind it.
 *
 * `entry` is the heading block. It is the same block in both halves of the
 * section: it introduces the mark while the mark is whole, then reappears
 * above the two cards once the reader is through. There is one copy of it in
 * the DOM and one here — the section moves it rather than swapping it.
 *
 * The two destinations carry no capability list. The Figma frame
 * (11062:107758) gives each card a figure, a label, a heading and one
 * paragraph, and four sub-items under that runs the card past the fold on a
 * laptop. The capabilities are still worth stating somewhere; this is not the
 * place the design puts them.
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
   * `figure` names the drawing on the card. The two are deliberately different
   * kinds of picture, not two versions of one: Studio gets a graph of wired
   * nodes, Everyday a conversation that produces something. That contrast is
   * the only thing distinguishing the cards, since the palette is shared.
   */
  studio: {
    index: '01',
    label: 'TORUK Studio',
    headline: 'Where AI is built',
    body:
      'Studio is where teams create and control the intelligence behind TORUK — from AI apps and workflows to knowledge, functions, and integrations.',
    figure: 'graph',
  },

  everyday: {
    index: '02',
    label: 'TORUK Everyday',
    headline: 'Where AI gets to work',
    body:
      'Everyday is where people interact with AI in their flow of work — through conversations, dynamic interfaces, tasks, and generated outputs.',
    figure: 'conversation',
  },
}
