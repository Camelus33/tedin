import React from 'react';
import Link from 'next/link';
import AppLogo from './AppLogo'; // Assuming AppLogo is in the same directory
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
              </div>
            </Link>
          </div>

          {/* Column 2: Company Info */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="font-semibold text-gray-100 uppercase tracking-wider text-xs">Company</h3>
            <div className="space-y-1.5">
              <p><span className="text-gray-400">Name:</span> <span className="text-gray-100 font-medium ml-1">Tedin Inc.</span></p>
              <p><span className="text-gray-400">Reg. No.:</span> <span className="text-gray-100 font-medium ml-1">348-88-02077</span></p>
              <p><span className="text-gray-400">Contact:</span> <a href="mailto:habitus.tedin@gmail.com" className="text-indigo-400 hover:text-indigo-300 hover:underline ml-1">habitus.tedin@gmail.com</a></p>
              
              {/* Social Media Links */}
              <div className="pt-2">
                <p className="text-gray-400 text-xs mb-2">Follow us:</p>
                <div className="flex space-x-3">
                  <a 
                    href="https://www.facebook.com/profile.php?id=61577199601552" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                    aria-label="Facebook"
                  >
                    <FaFacebook size={18} />
                  </a>
                  <a 
                    href="https://www.instagram.com/habitus33_tedin/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-500 transition-colors"
                    aria-label="Instagram"
                  >
                    <FaInstagram size={18} />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/habitus33/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin size={18} />
                  </a>
                  <a 
                    href="https://www.youtube.com/@habitus33-Atomic" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="YouTube"
                  >
                    <FaYoutube size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Awards & Certifications (Re-integrated) */}
          <div className="space-y-3 lg:col-span-1">
             <h3 className="font-semibold text-gray-100 uppercase tracking-wider text-xs">Certifications / Awards</h3>
             {/* Using list for semantics, styling can be adjusted further if needed */}
             <ul className="space-y-1.5 text-xs list-disc list-outside pl-5 text-gray-400"> 
                <li>Selected for KISED Gov. Grant (MSIT)</li>
                <li>Selected for KTO Contest (MCST)</li>
             </ul>
          </div>

           {/* Column 4: Links & Legal (Right aligned on lg) */}
           <div className="space-y-3 lg:col-span-1 lg:text-right">
             <h3 className="font-semibold text-gray-100 uppercase tracking-wider text-xs">Legal & Support</h3>
             <div className="flex flex-col space-y-2 lg:items-end">
                <Link href="/privacy-policy" className="hover:text-gray-100 hover:underline transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="hover:text-gray-100 hover:underline transition-colors">
                  Terms of Service
                </Link>
                <Link href="/marketing/law-school-students" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors font-medium">
                  Marketing
                </Link>
             </div>
           </div>
        </div>

        {/* Bottom Row: Copyright Notice */}
        <div className="mt-10 pt-6 border-t border-gray-700 text-center"> {/* Further reduced margin and padding from mt-12 pt-8 */}
           <p className="text-xs text-gray-400 leading-relaxed"> {/* Brighter copyright text */}
             &copy; {currentYear} Tedin Inc. All rights reserved.
             All content related to this page is protected by intellectual property rights.
             Unauthorized reproduction, distribution, and use for AI training are prohibited.
           </p>
        </div>
      </div>
    </footer>
  );
} 