/**
 * "The TORUK Mindset" — Figma node 11069:107918.
 *
 * The frame makes the section's punchline its heading: "Don't deploy AI.
 * Employ it." leads, and the three shifts under it are the argument for it.
 * There is no separate closing block and no process loop in the frame, so
 * there is none here.
 *
 * Each shift is a pair — the term the reader arrives with and the term they
 * leave with. The component renders the first struck through and the second in
 * white; that contrast is the whole design, so the copy is shaped as
 * `from`/`to` rather than as three blurbs.
 *
 * The pictures are real captures of the product, cropped to the frame's own
 * picture window and committed under `public/mindset/`. They are the frame's
 * assets, decoded back to source pixels from the transforms it places them
 * with — not re-shot, so what ships is what was designed.
 */
export const mindset = {
  eyebrow: 'The TORUK Mindset',
  headline: 'Don’t deploy AI. Employ it.',
  /*
   * A colon rather than a dash, as the frame sets it. The page sets no dashes
   * in visible copy, and the clause after it defines the change.
   */
  body:
    'TORUK changes the way teams think about AI: from tools that wait for prompts to AI Employees that take ownership of real work, operate within your rules, and improve over time.',

  shifts: [
    {
      id: 'employee',
      from: 'Assistant',
      to: 'Employee',
      body: 'AI doesn’t just answer. It takes responsibility for outcomes.',
      /* TORUK Everyday, opened on the roster rather than on a prompt box. */
      image: '/mindset/employee.webp',
    },
    {
      id: 'delegation',
      from: 'Automation',
      to: 'Delegation',
      body: 'Don’t define every click. Give AI the goal, context, tools, and boundaries.',
      /* The same screen being handed a goal: "handle what you can". */
      image: '/mindset/delegation.webp',
    },
    {
      id: 'continuous',
      from: 'One-off',
      to: 'Continuous',
      body: 'AI Employees keep working, learning, and improving over time.',
      /* A run in progress, four steps closed and a fifth still going. */
      image: '/mindset/continuous.webp',
    },
  ],

  /*
   * The cycle the three shifts add up to, under the cards.
   *
   * One line of the original microcopy per stage rather than a paragraph of
   * it: "Map the work. Define the AI Employee. Give it real responsibility.
   * Keep it governed. Improve it with every cycle." reads as five instructions
   * and is set as five.
   *
   * Understand carries the lit rule because it is where the cycle is entered.
   * Nothing else marks a position, so the order here is the only thing that
   * says which stage follows which.
   */
  loop: [
    { name: 'Understand', note: 'Map the work.' },
    { name: 'Define', note: 'Define the AI Employee.' },
    { name: 'Delegate', note: 'Give it real responsibility.' },
    { name: 'Govern', note: 'Keep it governed.' },
    { name: 'Improve', note: 'Improve it with every cycle.' },
  ],
}
