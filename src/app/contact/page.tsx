'use client';

import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

export default function ContactPage() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('pages.contact.title')}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {t('pages.contact.subtitle')}
            </p>
          </div>

          {/* Contact Information */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('pages.contact.getInTouch')}
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ninja Fedy</h3>
                  <p className="text-gray-600">
                    {t('pages.contact.coFounderCEO')}
                  </p>
                  <a
                    href="tel:+358407232017"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    +358 40 723 2017
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {t('pages.contact.email')}
                  </h3>
                  <a
                    href="mailto:ninja@nowastefutures.com"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    ninja@nowastefutures.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* About Us Section */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('pages.contact.aboutUs')}
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('pages.contact.aboutDescription1')}
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('pages.contact.aboutDescription2')}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {t('pages.contact.aboutDescription3')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
