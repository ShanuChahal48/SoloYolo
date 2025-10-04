import type { Metadata } from 'next';
import { siteDefaults, absoluteUrl, excerpt } from '@/lib/seo';

export const revalidate = 600; // refresh every 10 minutes

export async function generateMetadata(): Promise<Metadata> {
  const { name: SITE_NAME } = siteDefaults();
  const title = `Terms of Service | ${SITE_NAME}`;
  const raw = TERMS_RAW; // reuse below constant for excerpt
  const desc = excerpt(raw, 160) || 'Terms and conditions governing use of this website.';
  return {
    title,
    description: desc,
    alternates: { canonical: '/terms-of-service' },
    openGraph: { title, description: desc, url: '/terms-of-service', images: [{ url: absoluteUrl('/home.jpg'), width: 1200, height: 630 }] },
    twitter: { title, description: desc, images: [absoluteUrl('/home.jpg')], card: 'summary_large_image' }
  };
}

// Raw content provided by user (kept verbatim as requested)
const TERMS_RAW = `The Website Owner, including subsidiaries and affiliates (“Website” or “Website Owner” or “we” or “us” or “our”) provides the information contained on the website or any of the pages comprising the website (“website”) to visitors (“visitors”) (cumulatively referred to as “you” or “your” hereinafter) subject to the terms and conditions set out in these website terms and conditions.
If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern Elevate's relationship with you in relation to this website.
The use of this website is subject to the following terms of use:
The content of the pages of this website is for your general information and use only. It is subject to change without notice.
Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through this website meet your specific requirements.
This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance, and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
All trademarks reproduced on this website that are not the property of, or licensed to, the operator is acknowledged on the website.
Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offense.
From time to time, this website may also include links to other websites. These links are provided for your convenience to provide further information.
You may not create a link to this website from another website or document without Elevate’s prior written consent.
Your use of this website and any dispute arising out of such use of the website are subject to the laws of India or other regulatory authority.
Smoking and consumption of alcohol within the camp are not allowed.
We, as a merchant, shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any transaction, on account of the cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.
Taxes and Fees:
All bookings are subject to a 5% Goods and Services Tax (GST), which will be added to the total booking price during checkout. This tax is non-refundable.`;

function formatParagraphs(raw: string): string[] {
  return raw.split(/\n+/).map(p => p.trim()).filter(Boolean);
}

export default function TermsOfServicePage() {
  const paragraphs = formatParagraphs(TERMS_RAW);
  // Identify list-like section ("The use of this website is subject to the following terms of use:" and subsequent distinct clauses)
  const listAnchorIndex = paragraphs.findIndex(p => p.toLowerCase().startsWith('the use of this website is subject to'));
  const before = listAnchorIndex >= 0 ? paragraphs.slice(0, listAnchorIndex + 1) : paragraphs;
  const after = listAnchorIndex >= 0 ? paragraphs.slice(listAnchorIndex + 1) : [];

  return (
    <main
      className="min-h-screen overflow-hidden relative py-20"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.18'/%3E%3Ccircle cx='50' cy='50' r='0.6' fill='%23f1f5f9' opacity='0.35'/%3E%3Ccircle cx='80' cy='20' r='1.2' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.28'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.4' opacity='0.07' d='M0 50 C25 25, 75 75, 100 50'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px 100px',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <header className="mb-12 text-center" data-reveal="fade-up">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Terms of Service</h1>
          <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">Please read these terms carefully before using the website.</p>
        </header>
        <div className="space-y-6 text-slate-200 leading-relaxed" data-reveal="fade-up" data-reveal-delay="120">
          {before.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {after.length > 0 && (
            <ol className="list-decimal pl-6 space-y-3 mt-2">
              {after.map((item, idx) => (
                <li key={idx} className="marker:text-teal-400">{item}</li>
              ))}
            </ol>
          )}
        </div>
        <div className="mt-12 text-sm text-slate-400" data-reveal="fade-up" data-reveal-delay="240">
          <p>Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    </main>
  );
}
