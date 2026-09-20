import { useState } from 'react'
import { toast } from 'react-toastify/unstyled'
import { demo } from '@/content/demo'
import { site } from '@/content/site'
import { Button } from '@/components/ui/Button'
import { useReveal } from '@/hooks/useReveal'

/**
 * "Book a Demo" — the page's closing action, and the section behind `#demo`.
 *
 * The composition is a supplied reference, ported into this page's own palette
 * and type rather than copied off it. The reference is a light page; this one
 * is not, and a section that flipped to white halfway down would read as a
 * different site rather than as its last chapter. So the structure is the
 * reference's and every colour, stroke and step is this page's:
 *
 *   a centred header,
 *   every way to reach us that is not the form on the left,
 *   and the form itself on the right.
 *
 * The fields are drawn by their own strokes on the canvas rather than sitting
 * in a panel. The panel that used to be here put a raised card on the page and
 * then a darker well inside it for every control, which is three surfaces of
 * near-black stacked on each other and the murkiest object on the page. The
 * reference has no panel either.
 *
 * Where it sends
 * ---------------
 * There is no backend in this repo, so the form posts straight to FormSubmit's
 * AJAX endpoint and the answers arrive in the inbox at `RECIPIENT` below.
 * Nothing is configured and nothing is kept secret: the endpoint is the
 * address, in the URL, and the only credential involved is the one-time
 * confirmation link FormSubmit emails that inbox the first time this form is
 * submitted. Until someone clicks it nothing is delivered.
 *
 * That address is deliberately not `site.email`. The column beside this form
 * publishes `site.email` as the way to write to us by hand, and where the form
 * happens to deliver is a separate question from which address the page puts
 * its name to — so the two are separate values, and moving the delivery to
 * another inbox does not change a word on the page.
 *
 * The email's rows are keyed by each control's `name`, because that is what a
 * `FormData` carries — so the names in `content/demo` are chosen to read in an
 * inbox, and `email` is spelled exactly that way because FormSubmit reads it to
 * set the reply-to.
 *
 * How the fields are held
 * ------------------------
 * They are not. There is no state per field and no form library: the browser
 * owns the values, `required` and `type="email"` own the validation, and the
 * handler reads everything in one gesture with `new FormData(form)` at the
 * moment of submit. The version before this one kept six controlled values, a
 * parallel object of error strings and a validator of our own, all to arrive
 * at what the platform does — and its error messages were English on a page
 * whose browser may well be set to Arabic.
 *
 * What happens after the button
 * ------------------------------
 * Three states, in order: the button takes a spinner and says so while the
 * request is in flight; a toast says it landed; the form empties and stays.
 *
 * The form staying is the point. This used to swap the whole column for a
 * confirmation panel, which read as finished — and left a column of empty
 * canvas beside the contact details, because the confirmation is three lines
 * and the form it replaced is five fields. It also made a second request an
 * impossibility without a reload, which is wrong for a page whose form is the
 * one thing it asks for. Emptying the fields says the same thing the panel
 * said, in the place the reader is already looking.
 *
 * A failure does not empty it. Every answer stays exactly where it was typed,
 * so trying again costs a click, and what changes is only the toast.
 */

/*
 * Where the answers land. It is the inbox that has clicked FormSubmit's
 * confirmation link, and changing it means the new address has to click a new
 * one before anything is delivered again.
 *
 * It ships in the built JavaScript, because the browser is what posts to it —
 * so it is an address that can stand being read by anyone who opens the page
 * source, not a private one.
 */
const RECIPIENT = 'toruk.ai.dev@gmail.com'

/*
 * FormSubmit's AJAX endpoint, which is its ordinary one with `/ajax/` in it:
 * the plain endpoint answers a form post with a redirect to a thank-you page
 * of theirs, and this one answers with JSON and leaves the reader on this
 * page, which is the only reason `fetch` is worth using here at all.
 *
 * The recipient is in the URL because that is how the service is addressed.
 */
const ENDPOINT = `https://formsubmit.co/ajax/${RECIPIENT}`

/**
 * One short control: label above, input below, no state of its own.
 *
 * Everything it needs is the config entry — `name` is what the value arrives
 * under, and `id` is derived from it only so the label has something to point
 * at.
 */
function Field({ field }) {
  const id = `demo-${field.name}`

  return (
    <p className="demo-field" data-half={field.half || undefined}>
      {/*
        * Label above the control, always, and never a placeholder standing in
        * for one: a placeholder disappears the moment someone starts typing,
        * which is exactly when they need to know what they are filling in.
        *
        * Set in caps at the smallest step, as the reference sets them. It is
        * the one place on the page where a label is not sentence case, and it
        * is what keeps a five-field form from reading as five more paragraphs.
        */}
      <label htmlFor={id} className="demo-label font-display text-micro leading-[1.4]">
        {field.label}
        <span className="demo-required" aria-hidden="true">
          {demo.requiredMark}
        </span>
      </label>

      <input
        id={id}
        name={field.name}
        type={field.type}
        className="demo-input font-display text-body leading-[1.5]"
        autoComplete={field.autoComplete}
        placeholder={field.placeholder}
        /*
         * The browser validates, blocks the submit and writes the message, in
         * the reader's own language. The asterisk above is decoration; this is
         * what actually announces the field as required.
         */
        required
      />
    </p>
  )
}

export function BookDemo() {
  const { ref: headerRef, revealed: headerShown } = useReveal({ threshold: 0.2 })
  const { ref: bodyRef, revealed: bodyShown } = useReveal({ threshold: 0.1 })

  /* The only state on this form: whether a request is in flight. */
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    /*
     * Not just the disabled button. Pressing Enter inside a field submits the
     * form directly, and that path never touches the button's disabled state —
     * without this, a reader leaning on Enter sends the form twice.
     */
    if (sending) return

    /*
     * Both read before the first `await`. React pools and recycles the
     * synthetic event, so `e.target` is not dependable once this function has
     * suspended — and `form` is needed after the request comes back, to reset
     * it.
     */
    const form = e.target
    const formData = new FormData(form)

    setSending(true)
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        /*
         * What makes the endpoint answer in JSON rather than with a redirect
         * to FormSubmit's own thank-you page.
         */
        headers: { Accept: 'application/json' },
        body: formData,
      })

      if (response.ok) {
        toast.success(demo.toasts.success)
        /*
         * Cleared through the DOM rather than by remounting with a key,
         * because the DOM is where the values live. The fields keep their
         * identity, so a reader who was tabbed into one is still in it.
         */
        form.reset()
      } else {
        toast.error(demo.toasts.failed)
      }
    } catch {
      /* `fetch` only rejects when the request never got out: offline, blocked,
       * DNS. A 4xx or 5xx is the branch above. */
      toast.error(demo.toasts.offline)
    } finally {
      /*
       * In `finally`, so a thrown request releases the button too. Anywhere
       * else and a single network failure leaves the form disabled for good,
       * with no way back but a reload.
       */
      setSending(false)
    }
  }

  const mail = `mailto:${site.email}`

  return (
    <section
      id="demo"
      aria-labelledby="demo-title"
      className="relative z-10 bg-canvas px-6 py-[clamp(3.5rem,5.5vw,5.5rem)]"
    >
      <div className="page-column">
        {/*
          * Centred on the page's measure, as every other section header is,
          * and carrying the eyebrow they all carry. The split below it is what
          * makes this section different; the way the page introduces a section
          * is not.
          */}
        <header
          ref={headerRef}
          className="mx-auto flex max-w-measure flex-col items-center gap-[0.25rem] text-center"
        >
          <p
            className="reveal text-gradient-eyebrow font-display w-fit text-section-eyebrow leading-[1.333] font-light uppercase"
            data-revealed={headerShown}
          >
            {demo.eyebrow}
          </p>

          <h2
            id="demo-title"
            className="reveal font-display text-section leading-[1.2] font-normal text-ink text-balance"
            data-revealed={headerShown}
            style={{ '--reveal-delay': '90ms' }}
          >
            {demo.headline}
          </h2>

          <p
            className="reveal font-display text-body leading-[1.55] font-light text-ink-muted text-pretty"
            data-revealed={headerShown}
            style={{ '--reveal-delay': '180ms' }}
          >
            {demo.body}
          </p>
        </header>

        <div ref={bodyRef} className="demo-grid">
          {/*
            * Left of the form: every way to reach us that is not the form. It
            * answers the reader who has decided to get in touch but not to
            * fill anything in, which is why it is beside the fields rather
            * than under them.
            *
            * First in the source as well as on the left, so the tab order and
            * the reading order are the same one. That also puts it above the
            * form on a phone, which is the cost of the two agreeing: three
            * rows to scroll past, and no reader ever landing on a form field
            * before the block they can see above it.
            *
            * `<address>` rather than a styled list: it is what tells a screen
            * reader these are the page's contact details rather than prose.
            * The browser italicises it, which the stylesheet undoes.
            *
            * The icons are decorative: every row is labelled in text directly
            * beside them, so announcing them would only repeat the label.
            */}
          <address
            className="reveal demo-aside"
            data-revealed={bodyShown}
          >
            {/*
              * `<h3>`, under the section's own `<h2>`. It is a heading over a
              * group and not a label on a row, which is the whole difference
              * between it and the three lines under it.
              */}
            <h3 className="demo-aside-title font-display text-usecase-title leading-[1.556] font-medium text-ink">
              {demo.aside.title}
            </h3>

            {demo.aside.rows.map((row) => (
              <div key={row.id} className="demo-row">
                <span className="demo-row-tile" aria-hidden="true">
                  <img src={row.icon} alt="" width="20" height="20" decoding="async" />
                </span>

                <div className="demo-row-body">
                  <span className="demo-row-label font-display text-micro leading-[1.5] text-ink-muted">
                    {row.label}
                  </span>

                  {row.id === 'email' && (
                    <a href={mail} className="demo-value demo-link font-display text-usecase-note">
                      {site.email}
                    </a>
                  )}

                  {row.id === 'phone' && (
                    <a
                      href={`tel:${site.phone.href}`}
                      className="demo-value demo-link font-display text-usecase-note"
                    >
                      {site.phone.display}
                    </a>
                  )}

                  {/*
                    * Both offices under the one label, each on two lines with
                    * the break stated: the building and the district run
                    * together, and the city and country go under. It is the
                    * one break an address has that is worth stating, which is
                    * why the parts above it are joined rather than stacked.
                    */}
                  {row.id === 'offices' &&
                    site.offices.map((lines) => (
                      <span
                        key={lines.join()}
                        className="demo-value demo-office font-display text-usecase-note"
                      >
                        {lines.slice(0, -1).join(', ')}
                        <br />
                        {lines.at(-1)}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </address>

          <div
            className="reveal demo-column"
            data-revealed={bodyShown}
            /* The cascade follows the reading order: left column, then this. */
            style={{ '--reveal-delay': '120ms' }}
          >
            <form onSubmit={handleSubmit} className="demo-form">
              {/*
                * FormSubmit's own fields. They travel in the `FormData` with
                * everything else, which is the only reason they are inputs
                * rather than arguments — the body of this request is the form,
                * exactly as the browser built it.
                *
                * `_captcha=false` is the one that matters: with it left on,
                * FormSubmit answers the first request of a session with a
                * captcha page to redirect to, which is unreachable from an
                * AJAX call and would strand the reader on a form that reports
                * success and delivers nothing.
                */}
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_subject" value={demo.mailSubject} />
              {/* Rows in a table rather than a run of lines — five answers,
                * one of them a paragraph, are unreadable stacked. */}
              <input type="hidden" name="_template" value="table" />
              {/*
                * The honeypot, and FormSubmit's own: it drops any submission
                * that arrives with `_honey` filled. It is `display: none` and
                * out of the tab order, so nobody filling this form in ever
                * reaches it; something walking the DOM and filling every input
                * does.
                */}
              <input
                type="text"
                name="_honey"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className="demo-fields">
                {demo.fields.map((field) => (
                  <Field key={field.name} field={field} />
                ))}

                {/*
                  * The long one, written out rather than driven by the config
                  * above: a textarea takes a row count and a resize behaviour
                  * and none of the four short fields do, so folding it into
                  * that list would mean a config entry of special cases.
                  */}
                <p className="demo-field">
                  <label
                    htmlFor="demo-message"
                    className="demo-label font-display text-micro leading-[1.4]"
                  >
                    {demo.message.label}
                    <span className="demo-required" aria-hidden="true">
                      {demo.requiredMark}
                    </span>
                  </label>

                  <textarea
                    id="demo-message"
                    name={demo.message.name}
                    className="demo-input font-display text-body leading-[1.5]"
                    rows={demo.message.rows}
                    placeholder={demo.message.placeholder}
                    required
                  />
                </p>
              </div>

              <Button
                as="button"
                type="submit"
                className="demo-submit"
                disabled={sending}
                aria-busy={sending || undefined}
              >
                {/*
                  * The spinner is decorative and the label is not. A reader
                  * on a screen reader is told the button is busy by
                  * `aria-busy` and told what it is doing by the label
                  * changing to "Sending"; the ring is for the reader who can
                  * see that the page has not frozen. Announcing it as well
                  * would be the same fact three times.
                  */}
                {sending && <span className="demo-spinner" aria-hidden="true" />}
                {sending ? demo.submitting : demo.submit}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
