'use client';

import { useCommonTranslation } from '@/hooks/useTranslations';

export default function DonorDashboard() {
  const { t } = useCommonTranslation();

  return (
    <div className="p-6 space-y-6">
      {/* Impact Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">
          Teollasi on aitoa merkitystä! Tässä viimeisimmän toimintasi
          vaikuttavuus:
        </h2>

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-700 mb-1">46kg</div>
            <div className="text-sm text-gray-600">
              viimeisimmän ilmoituksesi yhteenlaskettu kilomäärä
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-700 mb-1">131</div>
            <div className="text-sm text-gray-600">
              ihmistä sai kunnon aterian (500g/annos)
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-700 mb-1">125€</div>
            <div className="text-sm text-gray-600">
              säästetty tuotanto- ja jätekustannuksissa (keskiarvo)
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-700 mb-1">10t</div>
            <div className="text-sm text-gray-600">
              puun verran hiilidioksidipäästöjä vältetty
            </div>
          </div>
        </div>

        {/* More Impact Data Link */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              Täältä näet lisää vaikuttavuusdataa
            </h3>
            <p className="text-sm text-gray-600">
              Keräämme vaikuttavuusdataa auttaa raportoimaan, viestimään ja
              suunnittelemaan toimintaa entistä paremmin.
            </p>
          </div>
          <div className="ml-4">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
