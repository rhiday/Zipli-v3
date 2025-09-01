'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useCommonTranslation } from '@/hooks/useTranslations';

export default function ContactPage(): React.ReactElement {
  const router = useRouter();
  const { t } = useCommonTranslation();

  return (
    <div className="flex flex-col h-dvh bg-cream">
      <SecondaryNavbar
        title={t('contact')}
        backHref="#"
        onBackClick={() => router.back()}
      />

      <div className="flex-grow overflow-y-auto p-4 pb-24">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Zipli Oy
            </h2>
            <p className="text-gray-600 mb-6">
              Helping cities and the food industry cut waste and hit their
              impact goals.
            </p>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Get in Touch
            </h3>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-gray-900">Phone</p>
                <p className="text-gray-600">+358 40 723 2017</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-gray-600">ninja@nowastefutures.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium text-gray-900">Address</p>
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
                <p className="font-medium text-gray-900">Business Hours</p>
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
              Need Help?
            </h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you with any questions about
              using Zipli.
            </p>
            <a
              href="mailto:ninja@nowastefutures.com"
              className="text-primary font-semibold underline underline-offset-4"
            >
              ninja@nowastefutures.com
            </a>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-primary">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Emergency Support
            </h3>
            <p className="text-gray-600 mb-2">For urgent food safety issues:</p>
            <p className="text-xl font-bold text-primary">+358 40 723 2017</p>
            <p className="text-sm text-gray-500 mt-1">Available 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}
