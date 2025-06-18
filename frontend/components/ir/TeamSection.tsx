'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Star } from 'lucide-react';

const teamMembers = [
  {
    name: 'Jinny B. Suh',
    role: 'CEO & CTO',
    bio: [
      "Full-stack developer & AI researcher (2 arXiv papers)",
      "Dual background in Mathematics & Business Administration",
      "Architect of Habitus33's core knowledge graph technology",
    ],
    imageUrl: 'https://picsum.photos/seed/jinny/400/400',
    social: {
      linkedin: '#',
      twitter: '#',
    },
  },
  {
    name: 'Kristine N. Ha',
    role: 'CMO',
    bio: [
      "Education specialist with deep NLP & prompt engineering expertise",
      "B.A. in English Literature, bridging tech and humanities",
      "Translates complex AI into intuitive user experiences",
    ],
    imageUrl: 'https://picsum.photos/seed/kristine/400/400',
    social: {
      linkedin: '#',
      twitter: '#',
    },
  },
  {
    name: 'Justin J. Ha',
    role: 'Development Advisor',
    bio: [
      "Distinguished statistician & Dean of a Graduate School of Statistics",
      "Published authority on time-series analysis",
      "Advises on the AI engine's predictive model accuracy",
    ],
    imageUrl: 'https://picsum.photos/seed/justin/400/400',
    social: {
      linkedin: '#',
      twitter: '#',
    },
  },
];

const TeamSection = () => {
  return (
    <section id="team" className="py-20 md:py-32 bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white">
            생성형 AI 솔루션계 <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">혁신 리더</span>
          </h2>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-16">
            기술과 교육에 대한 깊은 열정을 가진 최고의 전문가들이 Habitus33의 성장을 이끌고 있습니다.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              className="bg-gray-800/50 rounded-2xl p-8 text-center border border-gray-700/60 shadow-lg transition-all duration-300 hover:border-teal-400/50 hover:-translate-y-2 flex flex-col"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            >
              <div className="relative w-40 h-40 mx-auto mb-6">
                <Image
                  src={member.imageUrl}
                  alt={`Photo of ${member.name}`}
                  fill
                  className="rounded-full object-cover border-4 border-gray-700"
                />
              </div>
              <div className="flex-grow flex flex-col">
                <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                <p className="text-md font-semibold text-teal-400 mb-4">{member.role}</p>
                <div className="text-gray-400 text-sm mb-6 text-left flex-grow">
                  <ul className="space-y-2">
                    {member.bio.map((point, i) => (
                      <li key={i} className="flex items-start">
                        <Star size={14} className="text-teal-500 mr-3 mt-1 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto flex justify-center space-x-4">
                  <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-teal-400 transition-colors">
                    <Linkedin size={24} />
                  </a>
                  <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-teal-400 transition-colors">
                    <Twitter size={24} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection; 