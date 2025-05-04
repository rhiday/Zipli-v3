'use client';

import React from 'react';
import Image from 'next/image';
import { Languages, MessageSquare, UserCircle } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => (
  <div className="bg-earth flex flex-col px-4 pt-8 pb-8 min-h-[160px] relative overflow-hidden">
    {/* Background SVG Shape */}
    <Image
      src="/images/bg-earth.svg"
      alt="Background Shape"
      width={89}
      height={141}
      className="absolute top-4 right-4 opacity-10 pointer-events-none scale-110"
    />

    {/* Main Header Content (needs relative positioning to stay on top) */}
    <div className="relative z-10">
      {/* Top row: Language + icons */}
      <div className="flex justify-between items-center">
        <button className="border border-white text-white px-4 h-[46px] rounded-full text-sm font-semibold flex items-center gap-2">
          <Languages className="w-5 h-5" />
          English
        </button>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 border border-[#F3F4ED] rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 border border-[#F3F4ED] rounded-full flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      {/* Greeting and org name */}
      <div className="mt-6">
        <p className="text-bodyLg font-semibold text-cream mb-1">Good to see you!</p>
        <h1 className="text-titleMd font-sans font-medium tracking-tight text-base">{title || 'FoodAiders ry'}</h1>
      </div>
    </div>
  </div>
);

export default Header; 