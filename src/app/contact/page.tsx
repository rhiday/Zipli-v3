'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function ContactPage(): React.ReactElement {
  const router = useRouter();
  const { language } = useLanguage();

  const content = {
    fi: {
      title: 'Yhteystiedot',
      needHelp: 'Tarvitsetko apua?',
      needHelpDesc: 'Soita tai laita meille viestiä suoraan numeroon.',
      feedback: 'Anna meille palautetta',
      feedbackDesc:
        'Oletko huomannut sovelluksessa jotain hassua tai puuttuuko siitä mielestäsi jotain? Palaute on meille arvokasta, joten voit laittaa huomioitasi meille matalalla kynnykselkä.',
      phone: 'Puhelin',
      email: 'Sähköposti',
    },
    en: {
      title: 'Contact',
      needHelp: 'Need Help?',
      needHelpDesc: 'Call us or send us a message directly.',
      feedback: 'Give us feedback',
      feedbackDesc:
        'Have you noticed something strange in the app or is something missing? Feedback is valuable to us, so feel free to share your observations with us.',
      phone: 'Phone',
      email: 'Email',
    },
  };

  const t = content[language] || content.en;

  return (
    <div className="flex flex-col h-dvh bg-cream">
      <SecondaryNavbar
        title={t.title}
        backHref="#"
        onBackClick={() => router.back()}
      />

      <div className="flex-grow overflow-y-auto p-4 pb-24">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Need Help Section */}
          <div className="bg-[#F5F9EF] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">
              {t.needHelp}
            </h3>
            <p className="text-gray-600 mb-4">{t.needHelpDesc}</p>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-gray-900">{t.phone}</p>
                <a
                  href="tel:+358407232017"
                  className="text-primary font-semibold hover:underline"
                >
                  +358 40 723 2017
                </a>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary">
            <h3 className="text-lg font-semibold text-primary mb-3">
              {t.feedback}
            </h3>
            <p className="text-gray-600 mb-4">{t.feedbackDesc}</p>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-gray-900">{t.email}</p>
                <a
                  href="mailto:ninja@nowastefutures.com"
                  className="text-primary font-semibold hover:underline"
                >
                  ninja@nowastefutures.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
