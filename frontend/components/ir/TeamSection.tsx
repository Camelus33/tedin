'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Linkedin, BrainCircuit, Users, Sigma } from 'lucide-react';

const teamMembers = [
  {
    name: 'Jinny B. Suh',
    role: 'CEO & Visionary Architect',
    icon: <BrainCircuit size={20} className="text-indigo-400" />,
    expertise: [
      "AI Researcher (2 arXiv pre-prints)",
      "Mathematics & Business dual background",
      "Architect of the core Temporal Knowledge Graph",
    ],
    story: "AI 기술의 깊이와 비즈니스의 현실을 모두 이해하는 Jinny는 기술적 가능성을 시장이 원하는 가치로 변환하는 올라운드 플레이어입니다.",
    imageUrl: 'https://picsum.photos/seed/jinny/400/400',
    social: {
      linkedin: 'https://www.linkedin.com/in/seobongjin/',
    },
  },
  {
    name: 'Kristine N. Ha',
    role: 'CMO & User Empathy Translator',
    icon: <Users size={20} className="text-teal-400" />,
    expertise: [
      "Education specialist with deep NLP & prompt expertise",
      "English Literature major, bridging tech and humanities",
      "Leads user-centric design and intuitive UX",
    ],
    story: "Kristine은 기술과 사용자 사이의 간극을 메우는 '번역가'입니다. 그녀는 인문학적 통찰을 바탕으로 복잡한 AI 기술을 누구나 쉽게 이해하고 사용할 수 있는 직관적인 경험으로 바꾸어 놓습니다.",
    imageUrl: 'https://picsum.photos/seed/kristine/400/400',
    social: {
      linkedin: 'https://www.linkedin.com/in/kristine-ha-a7051a142/',
    },
  },
  {
    name: 'Justin J. Ha',
    role: 'Chief Data Scientist & Statistical Authority',
    icon: <Sigma size={20} className="text-cyan-400" />,
    expertise: [
      "Dean, Graduate School of Statistics",
      "Published authority on time-series analysis",
      "Ensures the statistical integrity of our AI engine",
    ],
    story: "통계학자 Justin은 우리 AI 엔진의 '진실성'을 보증합니다. 그의 깊이 있는 데이터 과학 지식은 Habitus33이 제공하는 모든 인사이트가 통계적으로 유의미하고 신뢰할 수 있도록 만드는 핵심적인 역할을 합니다.",
    imageUrl: 'https://picsum.photos/seed/justin/400/400',
    social: {
      linkedin: '#',
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
            The Right Team for The Right Mission
          </h2>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-16">
            우리는 단순한 전문가 집단이 아닙니다. AI의 미래를 바꾼다는 공동의 미션 아래, 각자의 전문성으로 강력한 시너지를 만드는 '드림팀'입니다.
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
                <div className="flex items-center justify-center gap-2 mb-4">
                  {member.icon}
                  <p className="text-md font-semibold text-teal-400">{member.role}</p>
                </div>

                <div className="border-t border-gray-700 my-4"></div>

                <div className="text-gray-300 text-sm mb-6 text-left flex-grow">
                  <p className="italic text-gray-400 mb-4">{member.story}</p>
                  <ul className="space-y-2">
                    {member.expertise.map((point, i) => (
                      <li key={i} className="flex items-start">
                         <span className="text-teal-500 mr-3 mt-1 font-bold">›</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto flex justify-center space-x-4">
                  {member.social.linkedin !== '#' && (
                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-teal-400 transition-colors">
                      <Linkedin size={24} />
                    </a>
                  )}
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