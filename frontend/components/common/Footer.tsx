import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import AppLogo from './AppLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto text-sm text-gray-400 font-sans">
      <div className="container mx-auto px-6 py-12"> {/* Further reduced padding from py-16 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> {/* Reduced gap from gap-10 */}

          {/* Column 1: Logo & Catchphrase */}
          <div className="space-y-4 lg:col-span-1">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <AppLogo className="w-12 h-12 text-white flex-shrink-0 group-hover:opacity-90 transition-opacity" />
              <div className="flex items-end space-x-1.5">
                <span className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors leading-none">habitus33</span>
                <span className="text-xs font-normal text-cyan-400 pb-0.5">Atomic Memo</span>
              </div>
            </Link>
          </div>

          {/* Column 2: Company Info */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="font-semibold text-gray-100 uppercase tracking-wider text-xs">{t('company.title')}</h3>
            <div className="space-y-1.5">
              <p><span className="text-gray-400">Name:</span> <span className="text-gray-100 font-medium ml-1">{t('company.name')}</span></p>
              <p><span className="text-gray-400">CEO:</span> <span className="text-gray-100 font-medium ml-1">{t('company.ceo')}</span></p>
              <p><span className="text-gray-400">Reg. No.:</span> <span className="text-gray-100 font-medium ml-1">{t('company.reg_no')}</span></p>
              <p><span className="text-gray-400">Type:</span> <span className="text-gray-100 font-medium ml-1">{t('company.type')}</span></p>
              <p><span className="text-gray-400">Contact:</span> <a href={`mailto:${t('company.contact')}`} className="text-indigo-400 hover:text-indigo-300 hover:underline ml-1">{t('company.contact')}</a></p>
            </div>
          </div>

          {/* Column 3: Awards & Certifications (Re-integrated) */}
          <div className="space-y-3 lg:col-span-1">
             <h3 className="font-semibold text-gray-100 uppercase tracking-wider text-xs">{t('certifications.title')}</h3>
             {/* Using list for semantics, styling can be adjusted further if needed */}
             <ul className="space-y-1.5 text-xs list-disc list-outside pl-5 text-gray-400"> 
                <li>{t('certifications.kised')}</li>
                <li>{t('certifications.kto')}</li>
             </ul>
          </div>

           {/* Column 4: Links & Legal (Right aligned on lg) */}
           <div className="space-y-3 lg:col-span-1 lg:text-right">
             <h3 className="font-semibold text-gray-100 uppercase tracking-wider text-xs">{t('links.title')}</h3>
             <div className="flex flex-col space-y-2 lg:items-end">
                <Link href="/privacy-policy" className="hover:text-gray-100 hover:underline transition-colors">
                  {t('links.privacy')}
                </Link>
                <Link href="/terms-of-service" className="hover:text-gray-100 hover:underline transition-colors">
                  {t('links.terms')}
                </Link>
                <Link href="/ir" className="hover:text-gray-100 hover:underline transition-colors">
                  Investor Relations
                </Link>
                <Link href="/marketing/law-school-students" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-medium">
                  Marketing
                </Link>
                <Link href="#faq" className="hover:text-gray-100 hover:underline transition-colors">
                   FAQ
                </Link>
             </div>
           </div>
        </div>

        {/* Bottom Row: Copyright Notice */}
        <div className="mt-10 pt-6 border-t border-gray-700 text-center"> {/* Further reduced margin and padding from mt-12 pt-8 */}
           <p className="text-xs text-gray-400 leading-relaxed"> {/* Brighter copyright text */}
             {t('copyright', { year: currentYear })}
           </p>
        </div>
      </div>
    </footer>
  );
} 