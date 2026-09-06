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
 * The submit target is `VITE_DEMO_ENDPOINT`. There is no backend in this repo,
 * so until that is set the form says so and hands the reader the address
 * instead of pretending the request went somewhere. That is the whole reason
 * it is written as an endpoint rather than as a simulated success: a form that
 * reports "thanks, we'll be in touch" into nothing is worse than no form.
 *
 * Swapping this for a scheduler (Cal, HubSpot, Calendly) is a change to
 * `send()` and nothing else.
 */

/*
 * Permissive on purpose. The only thing worth catching here is a typo that
 * could not possibly be deliverable; anything stricter starts rejecting real
 * addresses, and the endpoint is what actually decides.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  /* 'idle' | 'sending' | 'sent' | 'failed' */
  const [status, setStatus] = useState('idle')
  const [failure, setFailure] = useState(null)

  const formRef = useRef(null)
  const doneRef = useRef(null)
  const columnRef = useRef(null)

  /*
   * The button the reader just pressed no longer exists, so their focus is on
   * nothing. Moving it to the confirmation is what makes the outcome reachable
   * to someone who is not looking at the screen.
   *
   * An effect rather than a frame callback: `requestAnimationFrame` does not
   * run while the tab is in the background, and a reader who submits and
   * switches away would come back to focus lost on the document.
   */
  useEffect(() => {
    if (status === 'sent') doneRef.current?.focus()
  }, [status])

  const change = (id, value) => {
    setValues((current) => ({ ...current, [id]: value }))
    /*
     * A field's error clears as soon as it is touched, rather than being
     * re-checked on every keystroke. Re-validating while someone types tells
     * them their half-written address is wrong, which is true and useless.
     */
    setErrors((current) => (current[id] ? { ...current, [id]: null } : current))
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

    const endpoint = import.meta.env.VITE_DEMO_ENDPOINT
    if (!endpoint) {
      setStatus('failed')
      setFailure(demo.errors.unconfigured)
      return
    }

    setStatus('sending')
    setFailure(null)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!response.ok) throw new Error(String(response.status))

      /*
       * The confirmation is a good deal shorter than the form it replaces, so
       * without this the column collapses and the whole section jumps at the
       * exact moment the reader is looking for the word that says it worked.
       * The column holds the height the form left it at.
       */
      columnRef.current?.style.setProperty('--form-h', `${columnRef.current.offsetHeight}px`)
      setStatus('sent')
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
            ref={columnRef}
            className="reveal demo-column"
            data-revealed={bodyShown}
            /* The cascade follows the reading order: left column, then this. */
            style={{ '--reveal-delay': '120ms' }}
          >
            {status === 'sent' ? (
              /*
               * The confirmation takes the column rather than sitting above a
               * form that has already been sent. `tabIndex={-1}` is what lets
               * focus land here; `role="status"` is what announces it.
               */
              <div ref={doneRef} tabIndex={-1} role="status" className="demo-done">
                <p className="font-display text-usecase-title leading-[1.556] text-ink">
                  {demo.success.title}
                </p>
                <p className="font-display text-usecase-note leading-[1.43] text-ink-muted">
                  {demo.success.body}
                </p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={send} noValidate className="demo-form">
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
                  as="button"
                  type="submit"
                  className="demo-submit"
                  disabled={status === 'sending'}
                  aria-busy={status === 'sending' || undefined}
                >
                  {status === 'sending' ? demo.submitting : demo.submit}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
