export const faq = [
  {
    id: 'q1',
    question: 'Where do I change the branding?',
    answer:
      'src/styles/tokens.css holds every color, spacing step and font. Site name and copy live in src/content/site.js.',
  },
  {
    id: 'q2',
    question: 'How do I add or remove a section?',
    answer:
      'Create a component in src/sections, export it from src/sections/index.js, then add or delete its line in src/App.jsx.',
  },
  {
    id: 'q3',
    question: 'Can I use Tailwind or a component library instead?',
    answer:
      'Yes. The structure is styling-agnostic — the CSS Modules are per-component, so you can migrate one section at a time.',
  },
  {
    id: 'q4',
    question: 'Is this set up for SEO?',
    answer:
      'index.html carries the title, description, canonical link and Open Graph/Twitter tags, plus robots.txt in public/.',
  },
]
