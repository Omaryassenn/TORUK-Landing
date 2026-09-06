import { privacy, privacyMeta } from '@/content/privacy'
import { LegalDocument } from '@/components/layout/LegalDocument'

/**
 * Privacy Policy, in the same shell the Terms of Service is set in.
 */

/** Module-level: the spy's observer rebuilds if this is an inline array. */
const ANCHORS = privacy.map((section) => `#${section.id}`)

export default function Privacy() {
  return <LegalDocument meta={privacyMeta} sections={privacy} anchors={ANCHORS} />
}
