'use client';

import React from 'react';
import Image from 'next/image';
import { Languages, MessageSquare, UserCircle } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => (
  <div className="bg-earth flex flex-col px-6 md:px-12 pt-8 pb-14 min-h-[160px] relative overflow-hidden">
    {/* Background SVG Shape */}
    <Image
      src="/images/bg-earth.svg"
      alt="Background Shape"
      width={89}
      height={141}
      className="absolute top-17 right-20 md:right-32 opacity-10 pointer-events-none scale-100"
    />

    {/* Main Header Content (needs relative positioning to stay on top) */}
    <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start">
      {/* Icons block: first on mobile, second on desktop */}
      <div className="flex justify-between md:justify-end items-center md:order-2">
        {/* Mobile language button */}
        <button className="border border-white text-white px-4 h-[46px] rounded-full text-sm font-semibold flex items-center gap-2 md:hidden">
          <Languages className="w-5 h-5" />
          English
        </button>
        {/* Desktop language button, message, and user */}
        <div className="flex items-center gap-4">
          <button className="border border-white text-white px-4 h-[46px] rounded-full text-sm font-semibold flex items-center gap-2 hidden md:inline-flex">
            <Languages className="w-5 h-5" />
            English
          </button>
          <button className="w-10 h-10 border border-[#F3F4ED] rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </button>
          <Link 
            href="/profile" 
            className="w-10 h-10 border border-[#F3F4ED] rounded-full flex items-center justify-center" 
            aria-label="View Profile"
           >
            <UserCircle className="w-5 h-5 text-white" />
          </Link>
        </div>
      </div>
      {/* Greeting block: second on mobile, first on desktop */}
      <div className="mt-6 md:mt-0 md:order-1">
        <p className="text-bodyLg font-semibold text-cream mb-1">Good to see you!</p>
        <h1 className="text-titleMd font-sans font-medium tracking-tight text-base">{title || 'FoodAiders ry'}</h1>
      </div>
    </div>

    {/* REMOVE Watermark Image */}
    {/* 
    <Image
      src="/images/logo-watermark.svg"
      alt=""
      aria-hidden="true"
      width={140}
      height={140}
      className="absolute right-0 bottom-0 h-auto w-[140px] select-none opacity-10 pointer-events-none md:w-[200px]"
    />
    */}
  </div>
);

export default Header; 