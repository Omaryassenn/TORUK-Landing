/**
 * "Book a Demo" — the page's closing action.
 *
 * No Figma node. Every other section below the hero is a port of a frame; this
 * one is designed against the page's own language, because `#demo` was an
 * anchor the navbar and the footer's Product column both pointed at and nothing
 * answered. Replace it with the frame when there is one.
 *
 * The contact details under the copy come from `site`, not from here: they
 * are facts about the company rather than this section's copy, and the footer
 * will want the same ones.
 *
 * It is a form rather than a button because the navbar already carries the
 * button, and a closing section that repeats the navbar is a section that adds
 * nothing. What it adds is the one question a demo actually turns on: what the
 * team does by hand today.
 *
 * There is no eyebrow. The page has four already and this is its last word, so
 * it reads better as a conclusion than as another labelled chapter.
 *
 * Copy is authored, not ported, and it is deliberately free of claims that
 * cannot be checked — no length of session, no number of teams, no metric. It
 * says what the demo is and asks one thing.
 */
export const demo = {
  headline: 'See it run on your own work.',
  /*
   * One line, and it is a question rather than a pitch: everything the form
   * below asks for follows from it.
   */
  body: 'Tell us what your team does by hand today, and we will show you the AI Employee that takes it on.',

  /* The three ways to reach us, above the form. Values come from `site`. */
  contact: [
    { id: 'email', label: 'Email', icon: '/contact/icons/mail.svg' },
    { id: 'phone', label: 'Phone', icon: '/contact/icons/phone.svg' },
    { id: 'offices', label: 'Offices', icon: '/contact/icons/location.svg' },
  ],

  /*
   * The fields, in the order they are asked.
   *
   * `half` pairs a field with the one after it on a two-up row; everything
   * else runs the width of the panel. The pairs are the ones that are read as
   * one thing — a name, and the two ways to be reached.
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
   * Two fields are optional on purpose. The phone number is a second way to
   * reach someone who has already given a first one, and the last field is the
   * one this section exists to collect — requiring it would cost more
   * submissions than the answer is worth, and someone who leaves it blank is
   * still worth talking to.
   */
  fields: [
    {
      id: 'firstName',
      label: 'First name',
      type: 'text',
      autoComplete: 'given-name',
      placeholder: 'Enter first name',
      half: true,
      required: true,
      missing: 'Enter your first name.',
    },
    {
      id: 'lastName',
      label: 'Last name',
      type: 'text',
      autoComplete: 'family-name',
      placeholder: 'Enter last name',
      half: true,
      required: true,
      missing: 'Enter your last name.',
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
      id: 'phone',
      label: 'Phone number',
      type: 'tel',
      autoComplete: 'tel',
      /* Likewise, and it is also what says an international number is fine. */
      placeholder: '+966 5X XXX XXXX',
      half: true,
      required: false,
    },
    {
      id: 'organisation',
      label: 'Organisation',
      type: 'text',
      autoComplete: 'organization',
      placeholder: 'Enter organisation',
      required: true,
      missing: 'Enter your organisation.',
    },
    {
      id: 'work',
      label: 'What would you like an AI Employee to take on?',
      type: 'textarea',
      placeholder: 'A process you run by hand, a question your team keeps asking, or anything you would like to see.',
      required: false,
    },
  ],

  /*
   * Required fields carry an asterisk, as the reference sets them. It is
   * decorative and hidden from assistive tech, which gets the state from the
   * control's own `required` instead — an asterisk read out as "star" in the
   * middle of a label is noise.
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
