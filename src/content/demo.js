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
   * The short fields, in the order they are asked. The long one is `message`
   * below, on its own, because a textarea is not a variation on an input — it
   * takes a row count, a resize behaviour and the full width of the form, and
   * folding it into this list would mean a config entry whose every key is a
   * special case.
   *
   * `name` is the form control's name and nothing else is: there is no state
   * keyed by it and no id derived from it beyond the label's `for`. It is what
   * the request is keyed by, which is why it is also what arrives as the row
   * label in the email FormSubmit sends — see the note in `BookDemo`. `email`
   * is spelled exactly that way on purpose: it is the field FormSubmit reads to
   * set the reply-to, so answering the notification answers the person.
   *
   * Identity first and the open question last, which is the order the
   * reference sets and the order a form is read in: who is writing, then what
   * they want. The question is the long one and the only one with an area, so
   * it also has to be last or it pushes every short field below the fold.
   *
   * Four, in two pairs, over the message. Organisation was asked here and
   * removed — a work email already says the organisation, and asking for both
   * is asking twice — and the first and last name are one field for the reason
   * on it below.
   *
   * `half` pairs a field with the one after it on a two-up row; the message
   * runs the width of the form. Two pairs and a message: who is writing and
   * how to call them, then where to write back and what it is about, then the
   * thing itself.
   *
   * `autoComplete` is on every one that has a standard token: a demo form is
   * the kind of thing a browser should be able to fill in one gesture, and the
   * tokens are also what tells a password manager this is not a sign-up.
   *
   * `placeholder` is an example, never the label restated. The label is always
   * above the control, so a placeholder that repeats it is a line that costs a
   * reader a glance and tells them nothing; an example of the answer is the
   * one thing it can say that the label cannot.
   *
   * Every field is required, and required is the native attribute — the
   * browser decides, and it does it before the submit handler runs. There are
   * no per-field messages here any more for the same reason: the messages the
   * browser already has are translated into the reader's own language, and a
   * hand-written English string would replace that with something worse.
   */
  fields: [
    {
      /*
       * One field, not a first and a last. Splitting a name assumes it comes
       * in two parts in that order, which is not true of every name this page
       * is read by, and nothing downstream of this form needs the two halves
       * apart. `autoComplete: 'name'` is what still lets a browser fill it in
       * one gesture.
       */
      name: 'name',
      label: 'Full name',
      type: 'text',
      autoComplete: 'name',
      placeholder: 'Sara Al-Otaibi',
      half: true,
    },
    {
      name: 'phone',
      label: 'Phone number',
      type: 'tel',
      autoComplete: 'tel',
      /* Likewise an example, and it is also what says an international number
       * is fine. */
      placeholder: '+966 5X XXX XXXX',
      half: true,
    },
    {
      name: 'email',
      label: 'Work email',
      /*
       * `type="email"` is half the validation on this form: the browser checks
       * the shape and says so in its own words, which is the whole reason
       * there is no pattern of ours anywhere near this field.
       */
      type: 'email',
      autoComplete: 'email',
      placeholder: 'sara@yourcompany.com',
      half: true,
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      placeholder: 'Automating our monthly close',
      half: true,
    },
  ],

  /*
   * The long field, written on its own in the markup for the reason above.
   * `rows` is a starting height and not a limit — the control is resizable and
   * scrolls past it.
   */
  message: {
    name: 'message',
    label: 'What would you like an AI Employee to take on?',
    placeholder: 'We reconcile three systems by hand every month and it takes a week.',
    rows: 4,
  },

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
   * The subject line of the email this form sends, fixed rather than composed
   * from the reader's own `subject` field: it is what the inbox sorts on, and
   * a rule that files these is worth more than a line that repeats something
   * already in the body two rows down.
   */
  mailSubject: 'New demo request — toruk.studio',

  /*
   * The button carries the same label as the navbar's and the footer's, because
   * all three are the same intent. Three names for one action is three actions
   * as far as a reader is concerned.
   */
  submit: 'Book a Demo',
  submitting: 'Sending…',

  /*
   * What the toasts say. All three states are toasts now, including the two
   * failures: the form empties only on success, so a failed request leaves
   * every answer in place to be sent again, and there is nothing left for a
   * message pinned under the button to be attached to.
   */
  toasts: {
    success: 'Request received. We will be in touch to arrange a time.',
    /* The server answered and refused. Worth distinguishing from the one
     * below, because retrying immediately is unlikely to help. */
    failed: 'Something went wrong sending that. Please email us instead.',
    /* `fetch` never reached anyone: offline, a blocked request, DNS. */
    offline: 'Could not reach the server. Check your connection and try again.',
  },
}
