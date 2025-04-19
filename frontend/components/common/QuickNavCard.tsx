"use client";
import * as React from 'react';

type QuickNavCardProps = {
  href: string;
  label: string;
};

export default function QuickNavCard({ href, label }: QuickNavCardProps) {
  return (
    <a
      href={href}
      className="bg-white rounded-xl shadow-md p-card-p text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={`${label} 섹션 보기`}
    >
      <span className="font-semibold text-gray-700">{label}</span>
    </a>
  );
} 