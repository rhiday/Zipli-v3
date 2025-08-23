'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { loadTranslations } from '@/lib/i18n-enhanced';
import {
  useAuthTranslation,
  useDonationsTranslation,
  useCommonTranslation,
} from '@/lib/i18n-enhanced';

export default function TestLokalisePage() {
  const { language, setLanguage } = useLanguage();
  const { t: tAuth } = useAuthTranslation();
  const { t: tDonations } = useDonationsTranslation();
  const { t: tCommon } = useCommonTranslation();

  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  useEffect(() => {
    testLokalisConnection();
    loadTranslations().then(() => {
      setTranslationsLoaded(true);
    });
  }, []);

  const testLokalisConnection = async () => {
    try {
      const response = await fetch('/api/translations');
      if (response.ok) {
        setApiStatus('success');
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      setApiStatus('error');
    }
  };

  const reloadTranslations = async () => {
    setTranslationsLoaded(false);
    await loadTranslations();
    setTranslationsLoaded(true);
  };

  return (
    <div className="min-h-screen bg-base p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-primary">
          🌐 Lokalise Integration Test
        </h1>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center gap-4">
            <div
              className={`w-3 h-3 rounded-full ${
                apiStatus === 'success'
                  ? 'bg-green-500'
                  : apiStatus === 'error'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
              }`}
            ></div>
            <span>
              Lokalise API:{' '}
              {apiStatus === 'success'
                ? '✅ Connected'
                : apiStatus === 'error'
                  ? '❌ Failed (using local files)'
                  : '⏳ Testing...'}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div
              className={`w-3 h-3 rounded-full ${
                translationsLoaded ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            ></div>
            <span>
              Translations: {translationsLoaded ? '✅ Loaded' : '⏳ Loading...'}
            </span>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Language Control</h2>
          <div className="flex gap-4 items-center">
            <span>
              Current Language: <strong>{language.toUpperCase()}</strong>
            </span>
            <Button
              onClick={() => setLanguage(language === 'en' ? 'fi' : 'en')}
              variant="secondary"
            >
              Switch to {language === 'en' ? 'Finnish' : 'English'}
            </Button>
            <Button onClick={reloadTranslations} variant="secondary">
              🔄 Reload Translations
            </Button>
          </div>
        </div>

        {/* Translation Examples */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Translation Examples</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-mono bg-gray-50 p-3 rounded">
              <div className="font-bold">Context</div>
              <div className="font-bold">Key</div>
              <div className="font-bold">Translation</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm p-3 border-b">
              <div className="text-blue-600">Common</div>
              <div className="font-mono text-gray-600">actions.save</div>
              <div>{tCommon('actions.save')}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm p-3 border-b">
              <div className="text-green-600">Common</div>
              <div className="font-mono text-gray-600">actions.cancel</div>
              <div>{tCommon('actions.cancel')}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm p-3 border-b">
              <div className="text-purple-600">Auth</div>
              <div className="font-mono text-gray-600">login.title</div>
              <div>{tAuth('login.title')}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm p-3 border-b">
              <div className="text-orange-600">Donations</div>
              <div className="font-mono text-gray-600">create.title</div>
              <div>{tDonations('create.title')}</div>
            </div>
          </div>
        </div>

        {/* Raw Translation Data */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <div>
              <strong>Project ID:</strong>{' '}
              {process.env.NEXT_PUBLIC_LOKALISE_PROJECT_ID ||
                'Not exposed (secure)'}
            </div>
            <div>
              <strong>Current Language:</strong> {language}
            </div>
            <div>
              <strong>Browser Language:</strong> {navigator.language}
            </div>
            <div>
              <strong>Translations Status:</strong>{' '}
              {translationsLoaded ? 'Ready' : 'Loading...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
