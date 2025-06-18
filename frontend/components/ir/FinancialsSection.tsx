'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { DollarSign, Users, Target, TrendingUp, Briefcase, Brain, Cpu, Rocket } from 'lucide-react';

const kpiData = [
  { icon: <TrendingUp className="w-8 h-8 text-green-400" />, label: "연간 반복 매출 (ARR)", value: "1,200만원", note: "초기 시장성 검증 완료" },
  { icon: <Users className="w-8 h-8 text-blue-400" />, label: "고객 생애 가치 (LTV)", value: "36만원", note: "고부가 가치 사용자 중심" },
  { icon: <Target className="w-8 h-8 text-red-400" />, label: "고객 획득 비용 (CAC)", value: "9만원", note: "제품 중심 성장(PLG) 효율" }
];

const projectionData = [
  { year: 'Year 1', arr: 1.5, users: 500, gmv: 0.5 },
  { year: 'Year 2', arr: 7, users: 3500, gmv: 4 },
  { year: 'Year 3', arr: 25, users: 15000, gmv: 15 },
];

const useOfFundsData = [
    { name: '제품 개발/R&D', value: 45, icon: <Brain className="w-5 h-5 mr-2" /> },
    { name: '영업/마케팅', value: 30, icon: <Rocket className="w-5 h-5 mr-2" /> },
    { name: '인프라/운영', value: 15, icon: <Cpu className="w-5 h-5 mr-2" /> },
    { name: '예비비', value: 10, icon: <Briefcase className="w-5 h-5 mr-2" /> },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-gray-900 bg-opacity-80 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg text-white">
        <p className="label text-lg font-bold text-teal-300">{`${label}`}</p>
        <p className="intro text-indigo-300">{`ARR: ${payload[0].value.toLocaleString()}억 원`}</p>
        <p className="intro text-sky-300">{`지식 마켓(GMV): ${payload[1].value.toLocaleString()}억 원`}</p>
        <p className="desc text-xs mt-2 text-gray-400">3개년 재무 추정치</p>
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
            Financials & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Seed-Round Plan</span>
          </h2>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-16">
            검증된 초기 시장성과 효율적인 성장 모델을 바탕으로, 5억원의 Seed 투자를 통해 폭발적인 성장을 만들어낼 계획입니다.
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Projections Chart */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700/40 h-full">
              <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center md:text-left">3개년 성장 예측 <span className="text-base font-normal text-gray-400">(단위: 억원)</span></h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} barGap={8}>
                    <defs>
                      <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" strokeOpacity={0.3} />
                    <XAxis dataKey="year" tick={{ fill: '#a0aec0' }} axisLine={{ stroke: '#4a5568' }} tickLine={{ stroke: '#4a5568' }} />
                    <YAxis tick={{ fill: '#a0aec0' }} unit="억" axisLine={{ stroke: '#4a5568' }} tickLine={{ stroke: '#4a5568' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} />
                    <Legend wrapperStyle={{ color: '#e2e8f0', paddingTop: '20px' }} formatter={(value) => <span style={{color: '#a0aec0'}}>{value}</span>} />
                    <Bar dataKey="arr" name="연간 반복 매출 (ARR)" fill="url(#colorArr)" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="gmv" name="지식 마켓 거래액 (GMV)" fill="url(#colorGmv)" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Use of Funds */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700/40 h-full">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-center md:text-left">투자금 활용 계획</h3>
              <p className="text-gray-400 text-center md:text-left mb-6">조달된 자금은 성장을 가속화하고 시장 지배력을 확보하는 데 사용됩니다.</p>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={useOfFundsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={'85%'}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {useOfFundsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                {useOfFundsData.map((item, index) => (
                  <div key={item.name} className="flex items-center text-gray-300">
                    <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span>{item.name}</span>
                    <span className="ml-auto font-semibold">{item.value}%</span>
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