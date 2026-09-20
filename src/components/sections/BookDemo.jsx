import { useEffect, useRef, useState } from 'react'
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
 * There is no backend in this repo, so the form posts to a form-to-email
 * service and the answers arrive in the inbox at `site.email`. Two variables
 * decide that, both read at build time:
 *
 *   VITE_DEMO_ACCESS_KEY  the Web3Forms key issued for that inbox. Setting
 *                         this alone is enough; the endpoint below defaults.
 *   VITE_DEMO_ENDPOINT    any other URL that accepts a JSON POST, for a
 *                         Formspree form or an API of your own later.
 *
 * With neither set the form says so and hands the reader the address instead
 * of pretending the request went somewhere. That is the whole reason it is
 * written as an endpoint rather than as a simulated success: a form that
 * reports "thanks, we'll be in touch" into nothing is worse than no form.
 *
 * The body is keyed by each field's own label rather than by its id, because
 * the destination is a person reading an email and not an API — "What would
 * you like an AI Employee to take on?" is the question that was asked, and
 * `work` is not. Nothing reaches this point empty now that every field is
 * required; the guard that drops blanks is left in so that making one of them
 * optional again is a change to `content/demo` and nothing else.
 *
 * Swapping this for a scheduler (Cal, HubSpot, Calendly) is a change to
 * `send()` and nothing else.
 *
 * What happens after the button
 * ------------------------------
 * Three states, in order: the button takes a spinner and says so while the
 * request is in flight; a toast says it landed; the form empties and stays.
 *
 * The form staying is the point. This used to swap the whole column for a
 * confirmation panel, which read as finished — and left a column of empty
 * canvas beside the contact details, because the confirmation is three lines
 * and the form it replaced is six fields. It also made a second request an
 * impossibility without a reload, which is wrong for a page whose form is the
 * one thing it asks for. Emptying the fields says the same thing the panel
 * said, in the place the reader is already looking.
 *
 * The toast carries the words the panel carried, is announced rather than
 * merely drawn (`role="status"`), dismisses itself, and can be dismissed. It
 * is not where a failure goes: a failure belongs against the form that failed
 * and has to stay on screen with the address beside it, so that is still the
 * line above the button.
 */

/*
 * Where a Web3Forms key posts to. Stated here rather than asked for in the
 * environment: it is the same URL for every key, so making it a second
 * variable is a second thing to get wrong for no choice gained.
 */
const WEB3FORMS = 'https://api.web3forms.com/submit'

/*
 * Permissive on purpose. The only thing worth catching here is a typo that
 * could not possibly be deliverable; anything stricter starts rejecting real
 * addresses, and the endpoint is what actually decides.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/*
 * How long the toast stays. Long enough to be read twice at a glance and short
 * enough that it is gone before the reader has decided it is in the way; it is
 * dismissible either way, and nothing is lost by missing it because the empty
 * form says the same thing.
 */
const TOAST_MS = 6000

const EMPTY = Object.fromEntries(demo.fields.map((field) => [field.id, '']))

/** First message a field fails on, or null when it is fine. */
function validate(field, value) {
  const trimmed = value.trim()
  if (field.required && !trimmed) return field.missing
  if (field.type === 'email' && trimmed && !EMAIL.test(trimmed)) return field.invalid
  return null
}

function Field({ field, value, error, onChange }) {
  const id = `demo-${field.id}`
  const errorId = `${id}-error`
  const Tag = field.type === 'textarea' ? 'textarea' : 'input'

  return (
    <p className="demo-field" data-half={field.half || undefined}>
      {/*
        * Label above the control, always, and never a placeholder standing in
        * for one: a placeholder disappears the moment someone starts typing,
        * which is exactly when they need to know what they are filling in.
        *
        * Set in caps at the smallest step, as the reference sets them. It is
        * the one place on the page where a label is not sentence case, and it
        * is what keeps a six-field form from reading as six more paragraphs.
        */}
      <label htmlFor={id} className="demo-label font-display text-micro leading-[1.4]">
        {field.label}
        {field.required && (
          <span className="demo-required" aria-hidden="true">
            {demo.requiredMark}
          </span>
        )}
      </label>

      <Tag
        id={id}
        name={field.id}
        className="demo-input font-display text-body leading-[1.5]"
        {...(field.type === 'textarea' ? { rows: 4 } : { type: field.type })}
        autoComplete={field.autoComplete}
        placeholder={field.placeholder}
        /*
         * The state, not the asterisk, is what a screen reader announces. The
         * form is `noValidate`, so this never triggers the browser's own
         * bubble — it is here purely as the accessible name of "required".
         */
        required={field.required || undefined}
        value={value}
        onChange={(event) => onChange(field.id, event.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
      />

      {/*
        * Under the control it belongs to, and announced when it appears. It is
        * only ever rendered for a field that has actually failed, so the live
        * region is the message itself rather than an empty node waiting.
        */}
      {error && (
        <span id={errorId} role="alert" className="demo-error font-display text-usecase-note">
          {error}
        </span>
      )}
    </p>
  )
}

export function BookDemo() {
  const { ref: headerRef, revealed: headerShown } = useReveal({ threshold: 0.2 })
  const { ref: bodyRef, revealed: bodyShown } = useReveal({ threshold: 0.1 })

  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  /* 'idle' | 'sending' | 'failed'. There is no 'sent': a sent form is idle. */
  const [status, setStatus] = useState('idle')
  const [failure, setFailure] = useState(null)
  /*
   * The toast, as the timestamp of the send that raised it, or 0 for none.
   *
   * A token rather than a boolean so that sending twice re-arms it: setting a
   * boolean that is already `true` changes nothing, and the second request
   * would inherit whatever was left of the first one's dismissal timer.
   */
  const [toast, setToast] = useState(0)

  const formRef = useRef(null)
  const submitRef = useRef(null)
  /*
   * The honeypot. It is `display: none`, so nobody filling this form in ever
   * sees it; a bot walking the DOM and filling every input does.
   */
  const trapRef = useRef(null)

  /*
   * The toast's life, and the focus that has to survive it.
   *
   * Focus first: the button was `disabled` while the request was in flight,
   * and a browser drops focus to the document when the element holding it is
   * disabled. Putting it back on the button is what keeps a reader who is not
   * looking at the screen somewhere real — the form is still there, still
   * theirs, and the toast is announced to them by `role="status"` rather than
   * by being focused. Moving focus to a thing that removes itself after six
   * seconds would strand them a second time.
   *
   * An effect rather than a frame callback: `requestAnimationFrame` does not
   * run while the tab is in the background, and a reader who submits and
   * switches away would come back to focus lost on the document.
   */
  useEffect(() => {
    if (!toast) return
    submitRef.current?.focus()
    const timer = setTimeout(() => setToast(0), TOAST_MS)
    return () => clearTimeout(timer)
  }, [toast])

  const change = (id, value) => {
    setValues((current) => ({ ...current, [id]: value }))
    /*
     * A field's error clears as soon as it is touched, rather than being
     * re-checked on every keystroke. Re-validating while someone types tells
     * them their half-written address is wrong, which is true and useless.
     */
    setErrors((current) => (current[id] ? { ...current, [id]: null } : current))
  }

  /*
   * What a sent form does: empty, stay, and say so.
   *
   * The values go back to `EMPTY` rather than the form being remounted with a
   * key, so the fields keep their identity — a reader who was tabbed into one
   * is still in it, and the browser does not treat six controls as six new
   * ones and re-run autofill over them.
   */
  const landed = () => {
    setValues(EMPTY)
    setErrors({})
    setFailure(null)
    setStatus('idle')
    setToast(Date.now())
  }

  const send = async (event) => {
    event.preventDefault()
    if (status === 'sending') return

    const found = {}
    for (const field of demo.fields) {
      const message = validate(field, values[field.id])
      if (message) found[field.id] = message
    }
    if (Object.keys(found).length) {
      setErrors(found)
      /*
       * Focus the first field that failed, in the order they are asked rather
       * than the order the object happens to iterate in. Without this the
       * messages are announced and the cursor is still on the button.
       */
      const first = demo.fields.find((field) => found[field.id])
      formRef.current?.querySelector(`#demo-${first.id}`)?.focus()
      return
    }

    /*
     * A bot filled the field nobody can see. Given the same outcome a person
     * gets rather than a rejection, because telling one it was caught is
     * telling it what to change.
     */
    if (trapRef.current?.checked) {
      landed()
      return
    }

    const accessKey = import.meta.env.VITE_DEMO_ACCESS_KEY
    const endpoint = import.meta.env.VITE_DEMO_ENDPOINT || (accessKey ? WEB3FORMS : null)
    if (!endpoint) {
      setStatus('failed')
      setFailure(demo.errors.unconfigured)
      return
    }

    setStatus('sending')
    setFailure(null)

    const name = values.name.trim()
    const subject = values.subject.trim()

    /*
     * Keyed by the question, not by the field id, and without the ones nobody
     * answered. `subject` is left out because it becomes the email's own
     * subject line below rather than a line in its body.
     */
    const answers = {}
    for (const field of demo.fields) {
      const value = values[field.id].trim()
      if (value && field.id !== 'subject') answers[field.label] = value
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          /* Formspree returns a redirect without this; the rest ignore it. */
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...answers,
          /*
           * The routing fields. A service that does not know them treats them
           * as three more lines of the body, which is still readable.
           *
           * `replyto` is what makes answering the email answer the person: hit
           * reply and it goes to them rather than to the form.
           */
          ...(accessKey ? { access_key: accessKey } : null),
          subject: subject ? `Demo request: ${subject}` : `Demo request from ${name}`,
          from_name: name,
          replyto: values.email.trim(),
        }),
      })
      if (!response.ok) throw new Error(String(response.status))

      landed()
    } catch {
      setStatus('failed')
      setFailure(demo.errors.failed)
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
            <form ref={formRef} onSubmit={send} noValidate className="demo-form">
              {/*
                * The honeypot, first in the form and invisible in it. Out of
                * the tab order and out of the accessibility tree, so the only
                * thing that can reach it is something reading the markup.
                */}
              <input
                ref={trapRef}
                type="checkbox"
                name="botcheck"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className="demo-fields">
                {demo.fields.map((field) => (
                  <Field
                    key={field.id}
                    field={field}
                    value={values[field.id]}
                    error={errors[field.id]}
                    onChange={change}
                  />
                ))}
              </div>

              {/*
                * The failure sits above the button rather than below it,
                * where it would be off the bottom of a form the reader has
                * just scrolled the button into view of.
                */}
              {failure && (
                <p role="alert" className="demo-failure font-display text-usecase-note leading-[1.43]">
                  {failure}{' '}
                  <a href={mail} className="demo-mail">
                    {site.email}
                  </a>
                </p>
              )}

              <Button
                ref={submitRef}
                as="button"
                type="submit"
                className="demo-submit"
                disabled={status === 'sending'}
                aria-busy={status === 'sending' || undefined}
              >
                {/*
                  * The spinner is decorative and the label is not. A reader
                  * on a screen reader is told the button is busy by
                  * `aria-busy` and told what it is doing by the label
                  * changing to "Sending"; the ring is for the reader who can
                  * see that the page has not frozen. Announcing it as well
                  * would be the same fact three times.
                  */}
                {status === 'sending' && <span className="demo-spinner" aria-hidden="true" />}
                {status === 'sending' ? demo.submitting : demo.submit}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/*
        * The toast. Last in the section and fixed to the viewport, so it is
        * last in the reading order too: it is the outcome of the form above
        * it, and a reader tabbing on from the button reaches its close button
        * rather than having it spliced in somewhere behind them.
        *
        * `role="status"` is an implicit polite live region, and the node is
        * only ever mounted when there is something to say — so the whole of it
        * is announced when it appears, rather than a permanent empty region
        * having to be watched for changes.
        */}
      {toast > 0 && (
        <div role="status" className="demo-toast">
          <span className="demo-toast-mark" aria-hidden="true">
            {/*
              * A tick, drawn rather than set as a character: the page's
              * typeface has no dependable one, and an emoji would be read out
              * by a screen reader that is already being given the words.
              */}
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
              <path
                d="M3 8.5 6.5 12 13 4.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span className="demo-toast-body">
            <span className="demo-toast-title font-display text-usecase-title leading-[1.4]">
              {demo.success.title}
            </span>
            <span className="demo-toast-note font-display text-usecase-note leading-[1.43]">
              {demo.success.body}
            </span>
          </span>

          {/*
            * It dismisses itself after `TOAST_MS`, so this is the way out for
            * a reader who wants it gone now — and the reason the toast is not
            * placed over anything it would be the only way to uncover.
            */}
          <button
            type="button"
            className="demo-toast-close"
            onClick={() => setToast(0)}
            aria-label={demo.success.dismiss}
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
              <path
                d="m4 4 8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
    </section>
  )
}
