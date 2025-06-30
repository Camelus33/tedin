'use client';

import React, { useState } from 'react';
import Footer from '@/components/common/Footer';
import { UserCircleIcon, ScaleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const UniversityMarketingPageEN = () => {
  const [activeTab, setActiveTab] = useState('faculty');

  return (
    <div className="bg-white text-slate-800 font-sans">
      
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">
            The Process is the Proof.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
            Habitus33 shifts the focus from policing plagiarism to illuminating the learning journey. Make every student's effort visible and verifiable.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a href="https://habitus33.vercel.app/en" className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-blue-700 transition-colors">
              Try now! 
            </a>
            <a href="mailto:habitus33.tedin@gmail.com" className="bg-white text-slate-700 font-semibold py-3 px-8 rounded-md border border-slate-300 hover:bg-slate-50 transition-colors">
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">A System Under Stress</h2>
            <p className="mt-4 text-lg text-slate-600">AI is creating new uncertainties for everyone in education.</p>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <ScaleIcon className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-xl font-semibold text-slate-900 mt-6">For Faculty</h3>
              <p className="mt-2 text-slate-600">
                How can I distinguish AI writing from authentic work? I'm spending more time policing than teaching.
              </p>
            </div>
            <div className="p-8">
              <UserCircleIcon className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-xl font-semibold text-slate-900 mt-6">For Students</h3>
              <p className="mt-2 text-slate-600">
                Will my genuine effort be recognized, or will using AI for brainstorming get my work flagged?
              </p>
            </div>
            <div className="p-8">
              <ShieldCheckIcon className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-xl font-semibold text-slate-900 mt-6">For Institutions</h3>
              <p className="mt-2 text-slate-600">
                False accusations erode trust. We need to uphold standards without creating a culture of suspicion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Focus on Learning. We Document the Journey.</h2>
            <p className="mt-4 text-lg text-slate-600">Habitus33 provides undeniable proof of the learning process in three simple steps.</p>
          </div>
          <div className="mt-20 grid md:grid-cols-3 gap-x-8 gap-y-12">
            <div className="text-center md:text-left">
              <div className="font-bold text-blue-600">Step 1</div>
              <h3 className="text-xl font-semibold text-slate-900 mt-2">Capture</h3>
              <p className="mt-2 text-slate-600">
                Habitus33 automatically captures key moments in the learning process, from research to final edits, running seamlessly in the background.
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="font-bold text-blue-600">Step 2</div>
              <h3 className="text-xl font-semibold text-slate-900 mt-2">Connect</h3>
              <p className="mt-2 text-slate-600">
                Our AI-Link™ engine creates a verifiable 'thought-map' showing how a student's ideas evolved over time.
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="font-bold text-blue-600">Step 3</div>
              <h3 className="text-xl font-semibold text-slate-900 mt-2">Certify</h3>
              <p className="mt-2 text-slate-600">
                A 'Process-of-Work' report is generated with the final submission, providing undeniable proof of the student's journey.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">An Investment in Integrity and Efficiency</h2>
            <p className="mt-4 text-lg text-slate-600">Tangible benefits for every stakeholder in education.</p>
          </div>
          <div className="mt-12">
            <div className="flex justify-center border-b border-slate-200">
              <button onClick={() => setActiveTab('faculty')} className={`py-3 px-6 text-lg font-semibold transition-colors ${activeTab === 'faculty' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
                For Faculty & Staff
              </button>
              <button onClick={() => setActiveTab('students')} className={`py-3 px-6 text-lg font-semibold transition-colors ${activeTab === 'students' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
                For Students
              </button>
            </div>
          </div>
          <div className="mt-12">
            {activeTab === 'faculty' && (
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-slate-900">Mitigate Risk</h3>
                  <p className="mt-1 text-slate-600">Reduce false plagiarism accusations and protect your institution's reputation.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Increase Efficiency</h3>
                  <p className="mt-1 text-slate-600">Free up faculty time from policing to focus on high-value teaching.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Improve Outcomes</h3>
                  <p className="mt-1 text-slate-600">Gain insight into student learning patterns to foster critical thinking.</p>
                </div>
              </div>
            )}
            {activeTab === 'students' && (
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-slate-900">Get Fair Recognition</h3>
                  <p className="mt-1 text-slate-600">Your hard work is now visible and provable. Never be wrongly accused of plagiarism.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Focus on Learning</h3>
                  <p className="mt-1 text-slate-600">Use AI tools as intended—to assist, not to cheat—with full confidence.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Build Real Skills</h3>
                  <p className="mt-1 text-slate-600">Develop the critical thinking skills valued by employers by focusing on process.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Ready to Build a Culture of Trust?</h2>
          <p className="mt-4 text-lg text-slate-600">
            Schedule a personalized demo to see how Habitus33 can safeguard your institution's academic integrity.
          </p>
          <div className="mt-8 flex justify-center">
            <a href="https://habitus33.vercel.app/en" className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-blue-700 transition-colors">
              Try now!
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UniversityMarketingPageEN; 