/**
 * "Book a Demo" — the page's closing action.
 *
 * No Figma node. Every other section below the hero is a port of a frame; this
 * one is designed against the page's own language, because `#demo` was an
 * anchor the navbar and the footer's Product column both pointed at and nothing
 * answered. Replace it with the frame when there is one.
 *
 * It is a form rather than a button because the navbar already carries the
 * button, and a closing section that repeats the navbar is a section that adds
 * nothing. What it adds is the one question a demo actually turns on: what the
 * team does by hand today.
 *
 * The composition is a supplied reference, ported into this page's own dark
 * palette and type rather than copied off it: a centred header, then the form
 * on the left and every way to reach us that is not the form in the column
 * beside it.
 *
 * The eyebrow is back for it. The four sections above all carry one, and a
 * closing section set without one read as a different kind of block rather
 * than as the page's last chapter.
 *
 * The offices and the two links repeat the footer one screen below. That is
 * the reference's shape and it is a deliberate cost: a reader who has just
 * decided to get in touch should not have to scroll past the form to find
 * another way to do it.
 *
 * Copy is authored, not ported, and it is deliberately free of claims that
 * cannot be checked — no length of session, no number of teams, no metric. It
 * says what the demo is and asks one thing.
 */
export const demo = {
  /*
   * Set in the same gradient caps as every other section's, because it is the
   * same mark doing the same job. It names the section rather than selling it:
   * the headline under it is what makes the case.
   */
  eyebrow: 'Request a demo',

  headline: 'See it run on your own work.',
  /*
   * One line, and it is a question rather than a pitch: everything the form
   * below asks for follows from it.
   */
  body: 'Tell us what your team does by hand today, and we will show you the AI Employee that takes it on.',

  /*
   * The left column: every way to reach us that is not the form.
   *
   * Three rows, each an icon tile beside a label and the value under it, as a
   * supplied reference sets them. The label is what makes a bare string
   * readable — a number on its own says nothing about whether it is a switch-
   * board or a mobile — and it is also what the icon would otherwise have to
   * carry on its own, which an icon cannot.
   *
   * The values come from `site`, because they are facts about the company
   * rather than this section's copy. Only the labels and the glyphs are here.
   *
   * `offices` is one row and not two. Both addresses are Riyadh and neither
   * has a public name, so they sit under one label as two places rather than
   * being given invented ones. See the note on `site.offices`.
   */
  aside: {
    /*
     * The column's own heading. It names the column as the alternative to the
     * form beside it rather than repeating "Contact", which is what the
     * section's eyebrow already says: what these three rows are is the way
     * through that does not involve filling anything in.
     */
    title: 'Reach us directly',

    rows: [
      { id: 'email', label: 'Email:', icon: '/contact/icons/mail.svg' },
      { id: 'phone', label: 'Phone:', icon: '/contact/icons/phone.svg' },
      { id: 'offices', label: 'Location:', icon: '/contact/icons/location.svg' },
    ],
  },

  /*
   * The fields, in the order they are asked.
   *
   * Identity first and the open question last, which is the order the
   * reference sets and the order a form is read in: who is writing, then what
   * they want. The question is the long one and the only one with an area, so
   * it also has to be last or it pushes every short field below the fold.
   *
   * Five, in two pairs over a message. Organisation was asked here and removed
   * — a work email already says the organisation, and asking for both is
   * asking twice — and the first and last name are one field for the reason on
   * it below.
   *
   * `half` pairs a field with the one after it on a two-up row; everything
   * else runs the width of the form. Two pairs and a message: who is writing
   * and how to call them, then where to write back and what it is about, then
   * the thing itself.
   *
   * `autoComplete` is on every one that has a standard token: a demo form is
   * the kind of thing a browser should be able to fill in one gesture, and the
   * tokens are also what tells a password manager this is not a sign-up.
   *
   * `placeholder` is a hint and never the label — the label is always above the
   * control, because a placeholder disappears at the moment it is needed. Where
   * a format matters the hint is an example of it; where it does not, it just
   * says what to do.
   *
   * Every field is required. Three of them were not: a phone number and a
   * subject are ways to be reached or routed by someone who has already given
   * a first one, and the last field is the one this section exists to collect,
   * so leaving it optional cost nothing and caught the reader who would not
   * have written it. Asking for all five is a decision about which requests
   * are worth having rather than about the form, and it is stated here in one
   * place: every entry below carries `required` and a message to say what is
   * missing, and `validate` in `BookDemo` needs no cases of its own.
   */
  fields: [
    {
      id: 'name',
      /*
       * One field, not a first and a last. Splitting a name assumes it comes
       * in two parts in that order, which is not true of every name this page
       * is read by, and nothing downstream of this form needs the two halves
       * apart. `autoComplete: 'name'` is what still lets a browser fill it in
       * one gesture.
       */
      label: 'Full name',
      type: 'text',
      autoComplete: 'name',
      placeholder: 'Enter your full name',
      half: true,
      required: true,
      missing: 'Enter your name.',
    },
    {
      id: 'phone',
      label: 'Phone number',
      type: 'tel',
      autoComplete: 'tel',
      /* Likewise, and it is also what says an international number is fine. */
      placeholder: '+966 5X XXX XXXX',
      half: true,
      required: true,
      missing: 'Enter a phone number.',
    },
    {
      id: 'email',
      label: 'Work email',
      type: 'email',
      autoComplete: 'email',
      /* An example rather than an instruction: the shape is the useful part. */
      placeholder: 'name@organisation.com',
      half: true,
      required: true,
      missing: 'Enter your work email.',
      invalid: 'That does not look like an email address.',
    },
    {
      id: 'subject',
      label: 'Subject',
      type: 'text',
      /*
       * It is also the subject line of the email this form sends, which is the
       * one field whose answer a reader can see the use of: `send` composes
       * "Demo request: <this>" from it. See the note in `BookDemo`.
       */
      placeholder: 'What this is about',
      half: true,
      required: true,
      missing: 'Say what this is about.',
    },
    {
      id: 'work',
      label: 'What would you like an AI Employee to take on?',
      type: 'textarea',
      placeholder: 'A process you run by hand, a question your team keeps asking, or anything you would like to see.',
      required: true,
      missing: 'Tell us what you would like to see.',
    },
  ],

  /*
   * Required fields carry an asterisk, as the reference sets them. It is
   * decorative and hidden from assistive tech, which gets the state from the
   * control's own `required` instead — an asterisk read out as "star" in the
   * middle of a label is noise.
   *
   * Every field carries one now that every field is required, which is five
   * marks all saying the same thing. It is kept because the reference sets it
   * and because a label with no mark on a form where everything is compulsory
   * reads as the one field that is not. One line above the form saying so, and
   * no marks at all, is the other way to set this.
   */
  requiredMark: '*',

  /*
   * The button carries the same label as the navbar's and the footer's, because
   * all three are the same intent. Three names for one action is three actions
   * as far as a reader is concerned.
   */
  submit: 'Book a Demo',
  submitting: 'Sending',

  success: {
    title: 'Request received.',
    body: 'We will be in touch to arrange a time.',
  },

  /*
   * What the form says when the request cannot be sent.
   *
   * `unconfigured` is the honest state for a page whose form has no endpoint
   * yet: it says so and hands the reader the address instead. It is not a
   * fake success. See the note in `BookDemo`.
   */
  errors: {
    unconfigured: 'This form is not connected yet. Please email us instead.',
    failed: 'Something went wrong sending that. Please try again, or email us.',
  },
}
