/**
 * Privacy Policy, as supplied by YOUXEL Technology.
 *
 * The text is the client's and is set verbatim. Two things were changed, both
 * of them unfilled blanks rather than drafting, and both listed here so the
 * edit is on the record rather than buried:
 *
 *   1. "[Your Company Name]" in the opening paragraph was the template's
 *      placeholder, never filled in. It is set to YOUXEL Technology, which is
 *      the name the rest of the site and the Terms of Service both use.
 *   2. "[info@youxel.com]" in Contact Us was bracketed the same way. The
 *      brackets are dropped and the address is a link.
 *
 * Zero-width joiners between the sections were stripped. Nothing else is
 * touched.
 *
 * Unlike the Terms of Service this document does not number its own sections,
 * so nothing here invents numbers for them: `n` is simply absent, and the
 * contents list sets titles alone.
 *
 * `id` is what a link into a section points at. It must not change once the
 * page is public, because a policy is a thing people cite by URL.
 */

export const privacyMeta = {
  eyebrow: 'Legal',
  title: 'Privacy Policy',
  /*
   * The document's own subtitle, and it belongs to this page rather than to
   * the Terms of Service it was pasted alongside.
   */
  standfirst: 'Your Privacy Matters: Our Commitment to Protecting Your Information.',
  /* Both dates the document states, and they agree. */
  dates: 'Last updated 1 September 2023. Effective 1 September 2023.',
  lede: 'Your privacy is important to us. This Privacy Policy explains how YOUXEL Technology ("we," "us," or "our") collects, uses, shares, and protects your personal information. By using our website, products, or services, you consent to the practices described in this Privacy Policy.',
}

export const privacy = [
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    blocks: [
      { type: 'p', text: 'We may collect the following types of information:' },

      { type: 'h3', text: '1. Personal Information' },
      {
        type: 'dl',
        items: [
          {
            term: 'Name',
            def: 'We collect your name when you provide it to us during the registration or account creation process.',
          },
          {
            term: 'Contact Information',
            def: 'This includes your email address, postal address, and phone number.',
          },
          {
            term: 'Payment Information',
            def: 'When you make a purchase, we collect payment information such as credit card details or other payment method information.',
          },
          {
            term: 'Account Credentials',
            def: 'If you create an account on our platform, we collect your username and password.',
          },
          {
            term: 'Profile Information',
            def: 'This may include your profile picture, gender, date of birth, and other information you choose to provide.',
          },
        ],
      },

      { type: 'h3', text: '2. Usage Information' },
      {
        type: 'p',
        text: 'We collect information about how you use our website and services, including:',
      },
      {
        type: 'dl',
        items: [
          {
            term: 'Log Data',
            def: 'We automatically collect data about your interaction with our website, including your IP address, browser type, pages visited, and the date and time of your visit.',
          },
          {
            term: 'Device Information',
            def: 'We may collect information about the device you are using, including device type, operating system, and mobile network information.',
          },
          {
            term: 'Cookies',
            def: 'We use cookies and similar tracking technologies to collect information about your browsing activities. You can manage your cookie preferences through your browser settings.',
          },
        ],
      },

      { type: 'h3', text: '3. Other Information' },
      {
        type: 'p',
        text: 'We may also collect information from third-party sources or publicly available sources to enhance our services or verify the information you provide.',
      },
    ],
  },
  {
    id: 'how-we-use-your-information',
    title: 'How We Use Your Information',
    blocks: [
      { type: 'p', text: 'We use your information for the following purposes:' },
      {
        type: 'dl',
        items: [
          {
            term: 'Providing Services',
            def: 'To deliver our products and services, including processing transactions, managing your account, and providing customer support.',
          },
          {
            term: 'Personalization',
            def: 'To tailor our website and services to your preferences and provide you with a personalized experience.',
          },
          {
            term: 'Communication',
            def: 'To send you updates, promotional materials, and other communications related to our products and services.',
          },
          {
            term: 'Analytics',
            def: 'To analyze website usage, monitor the effectiveness of our marketing efforts, and improve our services.',
          },
          {
            term: 'Legal Compliance',
            def: 'To comply with applicable laws, regulations, and legal processes.',
          },
        ],
      },
    ],
  },
  {
    id: 'information-sharing',
    title: 'Information Sharing',
    blocks: [
      {
        type: 'p',
        text: 'We may share your information with third parties in the following circumstances:',
      },
      {
        type: 'dl',
        items: [
          {
            term: 'Service Providers',
            def: 'We may engage third-party service providers to assist us in delivering our services, such as payment processors, email service providers, and analytics services.',
          },
          {
            term: 'Business Partners',
            def: 'We may share your information with trusted business partners for joint marketing or promotional activities.',
          },
          {
            term: 'Legal Compliance',
            def: 'We may disclose your information to comply with legal obligations, respond to legal requests, or protect our rights, privacy, safety, or property.',
          },
        ],
      },
    ],
  },
  {
    id: 'your-choices',
    title: 'Your Choices',
    blocks: [
      {
        type: 'dl',
        items: [
          {
            term: 'Access and Correction',
            def: 'You can access and update your personal information by logging into your account or contacting us.',
          },
          {
            term: 'Opt-Out',
            def: 'You can opt-out of receiving promotional communications from us by following the unsubscribe instructions provided in our emails or by contacting us.',
          },
          {
            term: 'Cookies',
            def: 'You can manage your cookie preferences through your browser settings.',
          },
        ],
      },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    blocks: [
      {
        type: 'p',
        text: 'We take reasonable measures to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee the absolute security of your data.',
      },
    ],
  },
  {
    id: 'changes-to-this-policy',
    title: 'Changes to this Privacy Policy',
    blocks: [
      {
        type: 'p',
        text: 'We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website or through other means.',
      },
    ],
  },
  {
    id: 'contact-us',
    title: 'Contact Us',
    blocks: [
      {
        type: 'p',
        text: 'If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:',
      },
      { type: 'contact', label: 'Email', value: 'info@youxel.com', kind: 'email' },
      {
        type: 'p',
        text: 'By using our website or services, you agree to the terms of this Privacy Policy. Please read this policy carefully and check back periodically for updates.',
      },
    ],
  },
]
