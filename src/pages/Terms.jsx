import { terms, termsMeta } from '@/content/terms'
import { LegalDocument } from '@/components/layout/LegalDocument'

/**
 * Terms of Service. Everything about how a legal document is set lives in
 * `LegalDocument`; this is the document.
 */

/** Module-level: the spy's observer rebuilds if this is an inline array. */
const ANCHORS = terms.map((section) => `#${section.id}`)

export default function Terms() {
  return <LegalDocument meta={termsMeta} sections={terms} anchors={ANCHORS} />
}
