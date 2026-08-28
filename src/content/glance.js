/**
 * "TORUK at a glance" section (Figma node 10932:71903).
 *
 * The two lists are the diagram's two halves and their order is the diagram's
 * top-to-bottom order, so the row a node sits on is its index here. Nothing
 * else encodes that ordering; changing it here moves the node and its wire.
 *
 * Each node's mark is committed at `public/brand/nodes/<id>.svg`, so the id is
 * the filename too. They are the frame's own 16x16 exports, white on
 * transparent, which is why nothing here carries a colour.
 */
export const glance = {
  eyebrow: 'TORUK at a glance',
  headline: 'Everything your AI needs, connected in one place.',
  /*
   * Copy is the frame's, with three typos corrected: "Buld" -> "Build",
   * "unifes" -> "unifies", "real ward" -> "real world".
   */
  body:
    'Build AI apps and employees, connect them to your knowledge and systems, extend them with skills and functions, automate with triggers, and deploy' +
    ' - all through one unified platform.',

  /** Left half: what the platform draws on. */
  inputs: [
    { id: 'ai-employees', label: 'AI employees' },
    { id: 'ai-squad', label: 'AI Squad' },
    { id: 'storage', label: 'Storage' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'knowledge-bases', label: 'Knowledge bases' },
  ],

  /** Right half: what it produces. */
  outputs: [
    { id: 'ai-apps', label: 'AI Apps' },
    { id: 'skills', label: 'Skills' },
    { id: 'triggers', label: 'Triggers' },
    { id: 'functions', label: 'Functions' },
    { id: 'deployments', label: 'Deployments' },
  ],
}
