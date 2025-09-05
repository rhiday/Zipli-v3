'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Star, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { ViewportContainer } from '@/components/layout/ViewportContainer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

export default function FeedbackPage(): React.ReactElement {
  const router = useRouter();
  const { language } = useLanguage();
  const [rating, setRating] = useState<number>(0);
  const [category, setCategory] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const content = {
    fi: {
      feedbackTitle: 'Anna palautetta',
      howWasExperience: 'Miltä käyttökokemus tuntui?',
      feedbackType: 'Mitä palautteesi koskee?',
      selectCategory: 'Valitse kategoria',
      bug: 'Virhe',
      featureRequest: 'Ominaisuuspyyntö',
      general: 'Yleinen palaute',
      tellUsMore: 'Kerro lisää',
      feedbackPlaceholder: 'Kirjoita palautteesi tähän...',
      emailOptional: 'Sähköposti (valinnainen)',
      emailPlaceholder: 'sinun@sahkoposti.fi',
      emailHelp: 'Käytämme tätä vain, jos meidän täytyy ottaa sinuun yhteyttä',
      sendFeedback: 'Lähetä palaute',
      thankYou: 'Kiitos!',
      feedbackReceived: 'Palautteesi on vastaanotettu',
      backToDashboard: 'Takaisin',
      submitting: 'Lähetetään...',
    },
    en: {
      feedbackTitle: 'Give Feedback',
      howWasExperience: 'How was your experience?',
      feedbackType: "What's your feedback about?",
      selectCategory: 'Select category',
      bug: 'Bug',
      featureRequest: 'Feature Request',
      general: 'General',
      tellUsMore: 'Tell us more',
      feedbackPlaceholder: 'Write your feedback here...',
      emailOptional: 'Email (optional)',
      emailPlaceholder: 'your@email.com',
      emailHelp: "We'll only use this if we need to follow up",
      sendFeedback: 'Send Feedback',
      thankYou: 'Thank you!',
      feedbackReceived: 'Your feedback has been received',
      backToDashboard: 'Go Back',
      submitting: 'Submitting...',
    },
  };

  const t = content[language] || content.en;

  const handleSubmit = async () => {
    if (!rating || !comment || !category) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          category,
          comment,
          email: email || null,
          page_url: window.location.href,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        console.error('Failed to submit feedback');
        alert(
          language === 'fi'
            ? 'Palautteen lähetys epäonnistui. Yritä uudelleen.'
            : 'Failed to submit feedback. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(
        language === 'fi'
          ? 'Palautteen lähetys epäonnistui. Yritä uudelleen.'
          : 'Failed to submit feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <ViewportContainer
        variant="fullscreen"
        className="flex flex-col bg-cream"
      >
        <SecondaryNavbar
          title={t.feedbackTitle}
          backHref="/contact"
          onBackClick={() => router.back()}
        />

        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 text-center max-w-sm w-full">
            <div className="mb-4">
              <CheckCircle className="w-16 h-16 text-positive mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-primary mb-2">
              {t.thankYou}
            </h2>
            <p className="text-gray-600 mb-6">{t.feedbackReceived}</p>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => router.push('/contact')}
            >
              {t.backToDashboard}
            </Button>
          </div>
        </div>
      </ViewportContainer>
    );
  }

  return (
    <ViewportContainer variant="fullscreen" className="flex flex-col bg-cream">
      <SecondaryNavbar
        title={t.feedbackTitle}
        backHref="/contact"
        onBackClick={() => router.back()}
      />

      <div className="flex-grow overflow-y-auto p-4 pb-24">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Star Rating */}
          <div className="bg-white rounded-lg p-6">
            <label className="text-bodyLg font-semibold text-primary mb-3 block">
              {t.howWasExperience}
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-2 transition-colors hover:scale-110"
                  type="button"
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating >= star
                        ? 'fill-positive text-positive'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div className="bg-white rounded-lg p-6">
            <label className="text-bodyLg font-semibold text-primary mb-3 block">
              {t.feedbackType}
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectCategory} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">{t.bug}</SelectItem>
                <SelectItem value="feature">{t.featureRequest}</SelectItem>
                <SelectItem value="general">{t.general}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Comment Text Area */}
          <div className="bg-white rounded-lg p-6">
            <label className="text-bodyLg font-semibold text-primary mb-3 block">
              {t.tellUsMore}
            </label>
            <Textarea
              placeholder={t.feedbackPlaceholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="w-full"
            />
            <p className="text-sm text-tertiary mt-2">{comment.length}/500</p>
          </div>

          {/* Optional Email */}
          <div className="bg-[#F5F9EF] rounded-lg p-6">
            <label className="text-bodyLg font-semibold text-primary mb-3 block">
              {t.emailOptional}
            </label>
            <Input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-sm text-tertiary mt-2">{t.emailHelp}</p>
          </div>
        </div>
      </div>

      {/* Sticky Submit Button */}
      <div className="sticky bottom-0 bg-cream p-4 border-t border-gray-200">
        <div className="mx-auto max-w-lg">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSubmit}
            disabled={!rating || !comment || !category || isSubmitting}
          >
            {isSubmitting ? t.submitting : t.sendFeedback}
          </Button>
        </div>
      </div>
    </ViewportContainer>
  );
}
