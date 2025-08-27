'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage(): React.ReactElement {
  const router = useRouter();
  const { t } = useCommonTranslation();

  return (
    <div className="flex flex-col h-dvh bg-cream">
      <SecondaryNavbar
        title={t('contact') || 'Contact'}
        backHref="#"
        onBackClick={() => router.back()}
      />

      <div className="flex-grow overflow-y-auto p-4">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Zipli Oy
            </h2>
            <p className="text-gray-600 mb-6">
              {t('reducingFoodWaste') ||
                'Reducing food waste and building sustainable communities through technology.'}
            </p>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-primary mb-4">
              {t('getInTouch') || 'Get in Touch'}
            </h3>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-gray-900">
                  {t('phone') || 'Phone'}
                </p>
                <p className="text-gray-600">+358 40 123 4567</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-gray-900">
                  {t('email') || 'Email'}
                </p>
                <p className="text-gray-600">info@zipli.fi</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-gray-900">
                  {t('address') || 'Address'}
                </p>
                <p className="text-gray-600">
                  Kamppi, Helsinki
                  <br />
                  00100 Finland
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-gray-900">
                  {t('businessHours') || 'Business Hours'}
                </p>
                <p className="text-gray-600">
                  Monday - Friday: 9:00 - 17:00
                  <br />
                  Saturday - Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-[#F5F9EF] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary mb-3">
              {t('needHelp') || 'Need Help?'}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('ourSupportTeam') ||
                'Our support team is here to help you with any questions about using Zipli.'}
            </p>
            <a
              href="mailto:support@zipli.fi"
              className="text-primary font-semibold underline underline-offset-4"
            >
              support@zipli.fi
            </a>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary">
            <h3 className="text-lg font-semibold text-primary mb-2">
              {t('emergencySupport') || 'Emergency Support'}
            </h3>
            <p className="text-gray-600 mb-2">
              {t('forUrgentFoodSafetyIssues') ||
                'For urgent food safety issues:'}
            </p>
            <p className="text-xl font-bold text-primary">+358 40 987 6543</p>
            <p className="text-sm text-gray-500 mt-1">
              {t('available247') || 'Available 24/7'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
