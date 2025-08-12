'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, ComposedChart } from 'recharts';
import { DollarSign, Users, Target, TrendingUp, Briefcase, Brain, Cpu, Rocket, Calendar, BarChart3, Repeat, ShoppingCart, Building } from 'lucide-react';

const kpiData = [
  { icon: <Repeat className="w-8 h-8 text-sky-400" />, label: "Phase 1: 재발률 감소", value: "20~40%↓", note: "파일럿 전후 '같은 실수' 재발률 개선" },
  { icon: <Target className="w-8 h-8 text-lime-400" />, label: "A2A 전환률", value: "30%↑", note: "알림→교정 실행 전환(Alerts to Action)" },
  { icon: <BarChart3 className="w-8 h-8 text-indigo-400" />, label: "리워크/리드타임", value: "15~25%↓", note: "재작업·의사결정 지연 단축" }
];

const projectionData = [
  // Year1 개인 구독 = Pro(3,000×7천×12=2.52억) + Premium(100×2.5만×12=0.30억) ≈ 2.82억
  { year: 'Year 1', proSubscriptions: 2.82, marketplace: 0,   enterprise: 0 },
  { year: 'Year 2', proSubscriptions: 6.5,  marketplace: 0.5, enterprise: 0 },
  { year: 'Year 3', proSubscriptions: 14,   marketplace: 3.0, enterprise: 1.5 },
  { year: 'Year 4', proSubscriptions: 28,   marketplace: 9.0, enterprise: 6.0 },
  { year: 'Year 5', proSubscriptions: 50,   marketplace: 18,  enterprise: 20 },
];

const useOfFundsSeedData = [
    { name: '유사 사례 엔진/임베딩', value: 50, icon: <Brain className="w-5 h-5 mr-2" />, details: '입력 확장·임베딩·유사도·토스트/점프' },
    { name: '파일럿 확보(수험/투자/팀)', value: 30, icon: <Rocket className="w-5 h-5 mr-2" />, details: '전후 지표 설계·운영' },
    { name: '핵심 팀 구성', value: 20, icon: <Users className="w-5 h-5 mr-2" />, details: '검색/LLM/프론트/제품' },
];

const useOfFundsPreAData = [
    { name: '지식캡슐 마켓플레이스', value: 40, icon: <ShoppingCart className="w-5 h-5 mr-2" />, details: '프리미엄·품질 심사·결제/정산' },
    { name: '크리에이터/수요 확장', value: 35, icon: <TrendingUp className="w-5 h-5 mr-2" />, details: '수익 공유·리퍼럴·캠페인' },
    { name: 'B2B/온프레미스 준비', value: 15, icon: <Building className="w-5 h-5 mr-2" />, details: '보안/SSO/API·감사로그' },
    { name: '운영 및 인프라', value: 10, icon: <Cpu className="w-5 h-5 mr-2" />, details: '안정 운영·모니터링' },
];

const COLORS_SEED = ['#2dd4bf', '#0ea5e9', '#8b5cf6'];
const COLORS_PREA = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

const milestonesData = [
  { period: "Seed 후 12개월", target: "Phase 1: 재발률·A2A 개선 공개", kpi: "재발률 20%↓, A2A 30%↑, ARR 8천만원" },
  { period: "Pre-A 후 12개월", target: "Phase 2: 지식캡슐 마켓 베타", kpi: "GMV $0.5M, ARR 8억원" },
  { period: "Pre-A 후 24개월", target: "Phase 3: 온프레미스 첫 계약", kpi: "엔터프라이즈 계약 1+, Series A 준비" },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc: number, entry: any) => acc + entry.value, 0);
    return (
      <div className="p-4 bg-gray-900 bg-opacity-90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg text-white">
        <p className="label text-lg font-bold text-teal-300 mb-2">{`${label}`}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toLocaleString()}억 원`}
          </p>
        ))}
         <p className="mt-2 pt-2 border-t border-gray-600 font-bold">{`Total Revenue: ${total.toLocaleString()}억 원`}</p>
      </div>
    );
  }
  return null;
};

const FinancialsSection = () => {
  return (
    <section id="financials" className="py-20 md:py-32 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Financials: <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">반복 실수 감소 엔진</span>
          </h2>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-16">
            수익 구조는 Pro 구독 + 지식캡슐(AI‑Link) 마켓 수수료 + 조직/온프레미스 라이선스로 구성됩니다. 각 단계는 전후 지표(재발률·A2A·리워크율)를 공개해 신뢰를 확보합니다.
          </p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 text-center">
          {kpiData.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="bg-gray-800/30 p-8 rounded-2xl border border-gray-700/40 transition-all duration-300 hover:border-teal-400/50 hover:bg-gray-800/60 hover:shadow-2xl hover:shadow-teal-500/10"
            >
              <div className="flex justify-center items-center mb-4">{kpi.icon}</div>
              <h4 className="text-xl font-semibold text-gray-200 mb-2">{kpi.label}</h4>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-sky-400 mb-2">{kpi.value}</p>
              <p className="text-sm text-gray-500">{kpi.note}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-20">
          {/* Revenue Projection Chart */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700/40 h-full">
              <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center md:text-left">수익 모델 (단위: 억원)</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                    <defs>
                      <linearGradient id="colorEnterprise" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorMarketplace" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a3e635" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#a3e635" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6}/>
                         <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" strokeOpacity={0.3} />
                    <XAxis dataKey="year" tick={{ fill: '#a0aec0' }} axisLine={{ stroke: '#4a5568' }} tickLine={{ stroke: '#4a5568' }} dy={10} />
                    <YAxis tick={{ fill: '#a0aec0' }} unit="억" axisLine={{ stroke: '#4a5568' }} tickLine={{ stroke: '#4a5568' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} />
                    <Legend wrapperStyle={{ color: '#e2e8f0', paddingTop: '40px' }} formatter={(value) => <span style={{color: '#a0aec0'}}>{value}</span>} />
                    <Area type="monotone" dataKey="proSubscriptions" name="개인 구독(Pro+Premium)" stackId="1" stroke="#38bdf8" fill="url(#colorPro)" />
                    <Area type="monotone" dataKey="marketplace" name="지식캡슐 수수료" stackId="1" stroke="#a3e635" fill="url(#colorMarketplace)" />
                    <Area type="monotone" dataKey="enterprise" name="조직/온프레미스" stackId="1" stroke="#8b5cf6" fill="url(#colorEnterprise)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                가정: Year1 Pro 3,000명×7천원/월×12=2.52억 + Premium 100명×2.5만원/월×12=0.30억 ⇒ 개인 구독 2.82억. 이후 급성장 경로(제품 개선·지식캡슐·온프레미스) 반영.
              </p>
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700/40 h-full">
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">전략적 마일스톤</h3>
              <div className="space-y-6">
                {milestonesData.map((milestone, index) => (
                  <div key={index} className="border-l-4 border-teal-400 pl-6">
                    <h4 className="font-bold text-teal-300 mb-2">{milestone.period}</h4>
                    <p className="text-white mb-1">{milestone.target}</p>
                    <p className="text-sm text-gray-400">{milestone.kpi}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Use of Funds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Seed Funding */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700/40 h-full flex flex-col">
              <h3 className="text-2xl font-bold mb-2 text-center">시드 라운드 자금 사용 계획 (3억원)</h3>
              <p className="text-gray-400 text-center mb-6">Phase 1: 학습 가속 엔진 구축</p>
              <div className="flex-grow h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    layout="vertical" 
                    data={useOfFundsSeedData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" strokeOpacity={0.2} horizontal={false} />
                    <XAxis type="number" unit="%" tick={{ fill: '#a0aec0' }} axisLine={{ stroke: '#4a5568' }} tickLine={{ stroke: '#4a5568' }} domain={[0, 50]} />
                    <YAxis 
                      type="category" 
                      dataKey="name"
                      width={110}
                      tick={{ fill: '#e2e8f0', fontSize: 14 }} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}
                      contentStyle={{
                        background: 'rgba(31, 41, 55, 0.8)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid #4a5568',
                        borderRadius: '0.5rem',
                        color: '#e2e8f0'
                      }}
                      formatter={(value: number, name: string, props) => [`${value}% - ${props.payload.details}`, "비중"]}
                    />
                    <Bar dataKey="value" barSize={25} radius={[0, 8, 8, 0]}>
                      {useOfFundsSeedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_SEED[index % COLORS_SEED.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Pre-A Funding */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700/40 h-full flex flex-col">
              <h3 className="text-2xl font-bold mb-2 text-center">Pre-A 라운드 자금 사용 계획 (10억원)</h3>
              <p className="text-gray-400 text-center mb-6">Phase 2: 학습 가속 플라이휠 점화</p>
               <div className="flex-grow h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart 
                    layout="vertical" 
                    data={useOfFundsPreAData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" strokeOpacity={0.2} horizontal={false} />
                    <XAxis type="number" unit="%" tick={{ fill: '#a0aec0' }} axisLine={{ stroke: '#4a5568' }} tickLine={{ stroke: '#4a5568' }} domain={[0, 50]} />
                    <YAxis 
                      type="category" 
                      dataKey="name"
                      width={110}
                      tick={{ fill: '#e2e8f0', fontSize: 14 }} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}
                      contentStyle={{
                        background: 'rgba(31, 41, 55, 0.8)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid #4a5568',
                        borderRadius: '0.5rem',
                        color: '#e2e8f0'
                      }}
                      formatter={(value: number, name: string, props) => [`${value}% - ${props.payload.details}`, "비중"]}
                    />
                    <Bar dataKey="value" barSize={25} radius={[0, 8, 8, 0]}>
                      {useOfFundsPreAData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PREA[index % COLORS_PREA.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FinancialsSection; 