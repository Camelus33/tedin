'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, LineChart, Line } from 'recharts';
import { DollarSign, Users, Target, TrendingUp, Briefcase, Brain, Cpu, Rocket, Calendar, BarChart3 } from 'lucide-react';

const kpiData = [
  { icon: <TrendingUp className="w-8 h-8 text-green-400" />, label: "목표 ARR (Year 1)", value: "1.2억원", note: "베타 100명 → 유료 500명 전환" },
  { icon: <Users className="w-8 h-8 text-blue-400" />, label: "고객 생애 가치 (LTV)", value: "36만원", note: "평균 사용기간 18개월 × 월 2만원" },
  { icon: <Target className="w-8 h-8 text-red-400" />, label: "고객 획득 비용 (CAC)", value: "9만원", note: "LTV/CAC 비율 4:1로 건전성 확보" }
];

const projectionData = [
  { year: 'Seed (현재)', arr: 0.1, users: 100, revenue: 0.1, valuation: 30, funding: 3 },
  { year: 'Year 1', arr: 1.2, users: 500, revenue: 1.2, valuation: 30, funding: 0 },
  { year: 'Pre-A', arr: 3.6, users: 1500, revenue: 3.6, valuation: 100, funding: 10 },
  { year: 'Year 2', arr: 12, users: 5000, revenue: 12, valuation: 100, funding: 0 },
];

const fundingScheduleData = [
  { round: 'Seed', amount: 3, valuation: 30, ownership: 10, purpose: 'MVP 완성, 초기 고객 확보' },
  { round: 'Pre-A', amount: 10, valuation: 100, ownership: 10, purpose: '제품 고도화, 시장 확장' },
];

const useOfFundsSeedData = [
    { name: 'AI-Link 엔진 개발', value: 40, icon: <Brain className="w-5 h-5 mr-2" />, details: '시맨틱 온톨로지 엔진, 보안 프로토콜' },
    { name: '고객 획득 & 검증', value: 35, icon: <Rocket className="w-5 h-5 mr-2" />, details: '베타 테스트, 초기 마케팅, 고객 검증' },
    { name: '팀 확장', value: 15, icon: <Users className="w-5 h-5 mr-2" />, details: '개발자 2명, 마케터 1명 영입' },
    { name: '운영자금', value: 10, icon: <Briefcase className="w-5 h-5 mr-2" />, details: '12개월 운영비, 법무/회계' },
];

const useOfFundsPreAData = [
    { name: '제품 고도화', value: 45, icon: <Brain className="w-5 h-5 mr-2" />, details: 'AI 성능 향상, 새로운 기능 개발' },
    { name: '시장 확장', value: 30, icon: <Rocket className="w-5 h-5 mr-2" />, details: '디지털 마케팅, 파트너십 구축' },
    { name: '인프라 구축', value: 15, icon: <Cpu className="w-5 h-5 mr-2" />, details: '서버 확장, API 플랫폼 구축' },
    { name: '운영자금', value: 10, icon: <Briefcase className="w-5 h-5 mr-2" />, details: '18개월 운영비, 예비 자금' },
];

const COLORS_SEED = ['#2dd4bf', '#0ea5e9', '#8b5cf6', '#f59e0b'];
const COLORS_PREA = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

const milestonesData = [
  { period: "Seed 후 6개월", target: "베타 사용자 500명, MVP 완성", kpi: "사용자 만족도 4.2/5" },
  { period: "Seed 후 12개월", target: "유료 사용자 500명, ARR 1.2억", kpi: "월 성장률 15%" },
  { period: "Pre-A 후 6개월", target: "유료 사용자 1,500명, ARR 3.6억", kpi: "고객 유지율 85%" },
  { period: "Pre-A 후 12개월", target: "유료 사용자 5,000명, ARR 12억", kpi: "Series A 준비 완료" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-gray-900 bg-opacity-90 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg text-white">
        <p className="label text-lg font-bold text-teal-300 mb-2">{`${label}`}</p>
        <p className="intro text-indigo-300">{`ARR: ${data.arr.toLocaleString()}억 원`}</p>
        <p className="intro text-sky-300">{`사용자: ${data.users.toLocaleString()}명`}</p>
        <p className="intro text-purple-300">{`기업가치: ${data.valuation.toLocaleString()}억 원`}</p>
        {data.funding > 0 && (
          <p className="intro text-green-300">{`투자 유치: ${data.funding.toLocaleString()}억 원`}</p>
        )}
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
            재무 모델 & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">투자 계획</span>
          </h2>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-16">
            현실적 추정 기반 단계별 성장 모델: 시드 3억원 → Pre-A 10억원으로 총 13억원 조달하여 시장 점유율 확보
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

        {/* Funding Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-center mb-12">단계별 투자 유치 계획</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {fundingScheduleData.map((round, index) => (
              <div key={round.round} className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700/40">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-2xl font-bold text-teal-300">{round.round} 라운드</h4>
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">투자 금액</span>
                    <span className="font-bold text-white">{round.amount}억원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">기업 가치</span>
                    <span className="font-bold text-white">{round.valuation}억원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">지분 희석</span>
                    <span className="font-bold text-green-400">{round.ownership}%</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <p className="text-sm text-gray-300">{round.purpose}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-20">
          {/* Growth Projection Chart */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700/40 h-full">
              <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center md:text-left">성장 시나리오 & 투자 로드맵</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} barGap={8}>
                    <defs>
                      <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="colorValuation" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" strokeOpacity={0.3} />
                    <XAxis dataKey="year" tick={{ fill: '#a0aec0' }} axisLine={{ stroke: '#4a5568' }} tickLine={{ stroke: '#4a5568' }} />
                    <YAxis tick={{ fill: '#a0aec0' }} unit="억" axisLine={{ stroke: '#4a5568' }} tickLine={{ stroke: '#4a5568' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} />
                    <Legend wrapperStyle={{ color: '#e2e8f0', paddingTop: '20px' }} formatter={(value) => <span style={{color: '#a0aec0'}}>{value}</span>} />
                    <Bar dataKey="arr" name="ARR (억원)" fill="url(#colorArr)" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="valuation" name="기업가치 (억원)" fill="url(#colorValuation)" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">핵심 마일스톤</h3>
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
            <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700/40 h-full">
              <h3 className="text-2xl font-bold mb-4 text-center">시드 라운드 3억원</h3>
              <p className="text-gray-400 text-center mb-6">MVP 완성과 초기 고객 확보에 집중</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={useOfFundsSeedData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={'85%'}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {useOfFundsSeedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_SEED[index % COLORS_SEED.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-3">
                {useOfFundsSeedData.map((item, index) => (
                  <div key={item.name} className="text-gray-300">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS_SEED[index % COLORS_SEED.length] }}></div>
                      <span className="font-semibold text-sm">{item.name}</span>
                      <span className="ml-auto font-bold text-teal-300 text-sm">{item.value}%</span>
                    </div>
                    <p className="text-xs text-gray-400 ml-6">{item.details}</p>
                  </div>
                ))}
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
            <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700/40 h-full">
              <h3 className="text-2xl font-bold mb-4 text-center">Pre-A 라운드 10억원</h3>
              <p className="text-gray-400 text-center mb-6">제품 고도화와 시장 확장에 집중</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={useOfFundsPreAData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={'85%'}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {useOfFundsPreAData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PREA[index % COLORS_PREA.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-3">
                {useOfFundsPreAData.map((item, index) => (
                  <div key={item.name} className="text-gray-300">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS_PREA[index % COLORS_PREA.length] }}></div>
                      <span className="font-semibold text-sm">{item.name}</span>
                      <span className="ml-auto font-bold text-teal-300 text-sm">{item.value}%</span>
                    </div>
                    <p className="text-xs text-gray-400 ml-6">{item.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FinancialsSection; 