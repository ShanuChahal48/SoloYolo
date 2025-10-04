import type { Metadata } from 'next';
import { siteDefaults, absoluteUrl, excerpt } from '@/lib/seo';

export const revalidate = 600; // Revalidate every 10 minutes

// Raw user-provided policy text (verbatim)
const PRIVACY_RAW = `Privacy Policy for Elevate, The Adventure Travel Company
At Elevate, The Adventure Travel Company, we prioritize the privacy and security of our website visitors and customers. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you interact with our website or utilize our services.
Information We Collect:
Personal Information: We may collect personal information, such as your name, email address, phone number, and address, when you voluntarily provide it to us for purposes including inquiries, bookings, or feedback.
Usage Information: We gather information regarding your interactions with our website, such as the pages visited and duration of stay, to enhance your browsing experience and improve our services.
How We Use Your Information:
We utilize the collected information to enhance the functionality of our website, optimize your user experience, and provide relevant information about our adventure travel offerings.
Your email address may be used to send you newsletters, updates on special offers, and information about our services. You have the option to opt out of receiving such communications at any time.
How We Protect Your Information:
We employ reasonable security measures to safeguard your personal information from unauthorized access, disclosure, alteration, or destruction.
While we take precautions to protect your data, please note that no method of data transmission over the internet or electronic storage is entirely secure. We cannot guarantee the absolute security of your information.
Disclosure of Your Information:
We may share your personal information with trusted third parties to assist in operating our website, providing services, and conducting business operations. These third parties are bound by confidentiality agreements to ensure the protection of your information.
Your information may be disclosed if required by law, legal process, government request, or to protect the rights, property, or safety of Elevate, its users, or others.
Cookies and Tracking Technologies:
We may utilize cookies and similar tracking technologies to gather information about your interactions with our website. You have the option to adjust your browser settings to decline cookies, although this may impact your browsing experience.
Links to Third-Party Websites:
Our website may include links to third-party websites or services. We do not endorse or control these third-party sites and are not responsible for their privacy practices. We recommend reviewing the privacy policies of these websites before providing any personal information.
Children’s Privacy:
Our website is not intended for individuals under the age of 13, and we do not knowingly collect personal information from children. If you believe that we have unintentionally collected such information, please contact us for prompt removal.
Changes to Privacy Policy:
We reserve the right to update or modify this Privacy Policy at any time. Any changes will be reflected on our website, along with a revised "Last Updated" date.
Contact Us:
If you have any questions or concerns regarding our Privacy Policy or the handling of your personal information, please contact us at soloyoloindia@gmail.com.
By accessing our website or utilizing our services, you signify your consent to the terms outlined in this Privacy Policy. Thank you for entrusting Elevate, The Adventure Travel Company, with your personal information.`;

function splitSections(raw: string) {
  const lines = raw.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const sections: { heading?: string; content: string[] }[] = [];
  let current: { heading?: string; content: string[] } | null = null;
  const headingRegex = /^(?:[A-Z].{0,80}?)(:|$)/; // Simple heuristic
  for (const line of lines) {
    if (headingRegex.test(line) && line.endsWith(':')) {
      // Start new section
      if (current) sections.push(current);
      current = { heading: line.replace(/:$/, ''), content: [] };
    } else {
      if (!current) {
        current = { content: [line] };
      } else {
        current.content.push(line);
      }
    }
  }
  if (current) sections.push(current);
  return sections;
}

export async function generateMetadata(): Promise<Metadata> {
  const { name: SITE_NAME } = siteDefaults();
  const title = `Privacy Policy | ${SITE_NAME}`;
  const desc = excerpt(PRIVACY_RAW, 155) || 'Privacy practices and data handling policy.';
  return {
    title,
    description: desc,
    alternates: { canonical: '/privacy-policy' },
    openGraph: { title, description: desc, url: '/privacy-policy', images: [{ url: absoluteUrl('/home.jpg'), width: 1200, height: 630 }] },
    twitter: { title, description: desc, images: [absoluteUrl('/home.jpg')], card: 'summary_large_image' }
  };
}

export default function PrivacyPolicyPage() {
  const sections = splitSections(PRIVACY_RAW);
  const updated = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <main
      className="min-h-screen overflow-hidden relative py-20"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(56,189,248,0.08), transparent 60%), radial-gradient(circle at 75% 65%, rgba(45,212,191,0.08), transparent 60%)`,
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <header className="mb-12 text-center" data-reveal="fade-up">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">How we collect, use, disclose, and protect your information.</p>
        </header>
        <article className="prose prose-invert max-w-none" data-reveal="fade-up" data-reveal-delay="120">
          {sections.map((sec, i) => (
            <section key={i} className="mb-8">
              {sec.heading && <h2 className="text-xl font-semibold text-teal-300 mb-3 tracking-wide">{sec.heading}</h2>}
              {sec.content.map((p, idx) => (
                <p key={idx} className="text-slate-200 leading-relaxed">{p}</p>
              ))}
            </section>
          ))}
        </article>
        <div className="mt-12 text-sm text-slate-400" data-reveal="fade-up" data-reveal-delay="240">
          <p>Last updated: {updated}</p>
          <p className="mt-2">If you have questions, contact: <a href="mailto:soloyoloindia@gmail.com" className="text-teal-400 hover:underline">soloyoloindia@gmail.com</a></p>
        </div>
      </div>
    </main>
  );
}
