'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const UniversityMarketingPageEN = () => {
  const [activeTab, setActiveTab] = useState('faculty');
  const slidesRef = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    slidesRef.current.forEach((slide) => {
      if (slide) {
        observer.observe(slide);
      }
    });

    return () => {
      slidesRef.current.forEach((slide) => {
        if (slide) {
          observer.unobserve(slide);
        }
      });
    };
  }, []);

  const addSlideRef = (el: HTMLElement | null) => {
    if (el && !slidesRef.current.includes(el)) {
      slidesRef.current.push(el);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans overflow-x-hidden">
      <style jsx global>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
        {/* Hero Section */}
        <section 
          ref={addSlideRef as (el: HTMLElement | null) => void}
          className="text-center mb-8 sm:mb-12 md:mb-16 py-8 sm:py-12 md:py-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent 
                          drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300 
                          hover:scale-105 inline-block cursor-default">
              The Process is the Proof.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Habitus33 shifts the focus from policing plagiarism to illuminating the learning journey. Make every student's effort visible and verifiable.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a href="https://habitus33.vercel.app/en" 
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 
                        rounded-full text-lg shadow-lg transition-all duration-300 ease-out
                        hover:transform hover:scale-105 hover:shadow-2xl hover:from-blue-600 hover:to-indigo-700
                        focus:outline-none focus:ring-4 focus:ring-blue-500/50">
              Try Now! 
            </a>
            <a href="mailto:habitus33.tedin@gmail.com" 
              className="inline-block bg-transparent border-2 border-gray-500 text-gray-300 font-bold py-3 px-8 
                        rounded-full text-lg shadow-lg transition-all duration-300 ease-out
                        hover:transform hover:scale-105 hover:shadow-2xl hover:bg-gray-800 hover:border-gray-400
                        focus:outline-none focus:ring-4 focus:ring-gray-500/50">
              Contact Sales
            </a>
          </div>
        </section>

        {/* Problem Section */}
        <section 
          ref={addSlideRef as (el: HTMLElement | null) => void}
          className="bg-gray-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                    shadow-2xl border border-white/10 transition-all duration-500 ease-out
                    hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-white/20"
        >
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative inline-block tracking-tight">
              A System Under Stress
              <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </h2>
            <p className="mt-8 text-lg text-gray-400">AI is creating new uncertainties for everyone in education.</p>
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-white/10 transition-transform duration-300 hover:scale-105 hover:border-white/20">
              <h3 className="text-xl font-semibold text-blue-400 mt-6">For Faculty</h3>
              <p className="mt-2 text-gray-300">
                How can I distinguish AI writing from authentic work? I&apos;m <span className="text-red-400 font-semibold">spending more time policing than teaching.</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-white/10 transition-transform duration-300 hover:scale-105 hover:border-white/20">
              <h3 className="text-xl font-semibold text-purple-400 mt-6">For Students</h3>
              <p className="mt-2 text-gray-300">
                <span className="text-red-400 font-semibold">Will my genuine effort be recognized,</span> or will using AI for brainstorming get my work flagged?
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-white/10 transition-transform duration-300 hover:scale-105 hover:border-white/20">
              <h3 className="text-xl font-semibold text-green-400 mt-6">For Institutions</h3>
              <p className="mt-2 text-gray-300">
                <span className="text-red-400 font-semibold">False accusations erode trust.</span> We need to uphold standards without creating a culture of suspicion.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section 
          ref={addSlideRef as (el: HTMLElement | null) => void}
          className="bg-gray-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                    shadow-2xl border border-white/10 transition-all duration-500 ease-out
                    hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-white/20"
        >
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative inline-block tracking-tight">
              Focus on Learning. We Document the Journey.
              <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </h2>
            <p className="mt-8 text-lg text-gray-400">Habitus33 provides undeniable proof of the learning process in three simple steps.</p>
          </div>
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-8 rounded-xl border border-white/10 text-center">
              <div className="text-4xl font-bold text-blue-500 mb-4">1</div>
              <h3 className="text-xl font-semibold text-white mt-2">Capture</h3>
              <p className="mt-2 text-gray-400">
                Habitus33 automatically captures key moments in the learning process, from research to final edits, running seamlessly in the background.
              </p>
            </div>
            <div className="bg-gray-800/50 p-8 rounded-xl border border-white/10 text-center">
              <div className="text-4xl font-bold text-blue-500 mb-4">2</div>
              <h3 className="text-xl font-semibold text-white mt-2">Connect</h3>
              <p className="mt-2 text-gray-400">
                Our <span className="text-cyan-400 font-semibold">AI-Link™ engine</span> creates a verifiable &apos;thought-map&apos; showing how a student&apos;s ideas evolved over time.
              </p>
            </div>
            <div className="bg-gray-800/50 p-8 rounded-xl border border-white/10 text-center">
              <div className="text-4xl font-bold text-blue-500 mb-4">3</div>
              <h3 className="text-xl font-semibold text-white mt-2">Certify</h3>
              <p className="mt-2 text-gray-400">
                A 'Process-of-Work' report is generated with the final submission, providing undeniable proof of the student's journey.
              </p>
            </div>
          </div>
          <div className="mt-16 md:mt-20">
            <Image
              src="/images/memo-evolution-note.png"
              alt="A screenshot showing the process of memo evolution into a consolidated note, demonstrating the AI-Link™ feature."
              width={1200}
              height={750}
              className="rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </section>
        
        {/* Benefits Section */}
        <section 
          ref={addSlideRef as (el: HTMLElement | null) => void}
          className="bg-gray-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 mb-6 sm:mb-10 
                    shadow-2xl border border-white/10 transition-all duration-500 ease-out
                    hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-white/20"
        >
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative inline-block tracking-tight">
              An Investment in Integrity and Efficiency
              <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </h2>
            <p className="mt-8 text-lg text-gray-400">Tangible benefits for every stakeholder in education.</p>
          </div>
          <div className="mt-12">
            <div className="flex justify-center border-b border-gray-700">
              <button onClick={() => setActiveTab('faculty')} className={`py-3 px-6 text-lg font-semibold transition-colors ${activeTab === 'faculty' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-200'}`}>
                For Faculty & Staff
              </button>
              <button onClick={() => setActiveTab('students')} className={`py-3 px-6 text-lg font-semibold transition-colors ${activeTab === 'students' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-200'}`}>
                For Students
              </button>
            </div>
          </div>
          <div className="mt-12">
            {activeTab === 'faculty' && (
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div>
                  <h3 className="font-semibold text-lg text-white">Mitigate Risk</h3>
                  <p className="mt-1 text-gray-400"><span className="text-green-400">Reduce false plagiarism accusations</span> and protect your institution&apos;s reputation.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Increase Efficiency</h3>
                  <p className="mt-1 text-gray-400">Free up faculty time from policing to <span className="text-green-400">focus on high-value teaching.</span></p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Improve Outcomes</h3>
                  <p className="mt-1 text-gray-400">Gain insight into student learning patterns to <span className="text-green-400">foster critical thinking.</span></p>
                </div>
              </div>
            )}
            {activeTab === 'students' && (
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div>
                  <h3 className="font-semibold text-lg text-white">Get Fair Recognition</h3>
                  <p className="mt-1 text-gray-400"><span className="text-green-400">Your hard work is now visible and provable.</span> Never be wrongly accused of plagiarism.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Focus on Learning</h3>
                  <p className="mt-1 text-gray-400">Use AI tools as intended—<span className="text-green-400">to assist, not to cheat</span>—with full confidence.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Build Real Skills</h3>
                  <p className="mt-1 text-gray-400">Develop the <span className="text-green-400">critical thinking skills</span> valued by employers by focusing on process.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section 
          ref={addSlideRef as (el: HTMLElement | null) => void}
          className="bg-gradient-to-br from-blue-500/10 to-indigo-600/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 
                    shadow-2xl border border-blue-500/30 transition-all duration-500 ease-out
                    hover:transform hover:-translate-y-2 hover:shadow-3xl hover:border-blue-500/40 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8 tracking-tight">Ready to Build a Culture of Trust?</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Schedule a personalized demo to see how Habitus33 can safeguard your institution's academic integrity.
          </p>
          <div className="mt-8 flex justify-center">
            <a href="https://habitus33.vercel.app/en" 
              className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-10 
                        rounded-full text-xl shadow-2xl transition-all duration-300 ease-out
                        hover:transform hover:scale-105 hover:shadow-3xl hover:from-blue-400 hover:to-indigo-500
                        focus:outline-none focus:ring-4 focus:ring-blue-500/50">
              Try Now!
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UniversityMarketingPageEN; 