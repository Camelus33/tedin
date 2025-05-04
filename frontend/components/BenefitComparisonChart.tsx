import { motion } from 'framer-motion';

const benefits = [
  { label: "집중 시간", before: 6, after: 21, unit: "분", afterText: "21분+ 유지" },
  { label: "읽기 처리 속도(PPM)", before: 1.3, after: 2.8, unit: "", afterText: "2.8 이상" },
  { label: "기억 회상률", before: 61, after: 91, unit: "%", afterText: "91% 이상" },
  { label: "과제 완료율", before: 58, after: 95, unit: "%", afterText: "95%+" },
  { label: "자가효능감 점수", before: 3.4, after: 8.2, unit: "/10", afterText: "8.2/10" },
];

export default function BenefitComparisonChart() {
  const max = Math.max(...benefits.map(b => b.after));
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="space-y-6">
        {benefits.map((b, i) => (
          <div key={b.label} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="w-32 min-w-[6rem] font-semibold text-gray-800 text-sm sm:text-base text-center sm:text-left">{b.label}</span>
            {/* BEFORE Bar */}
            <div className="flex-1 flex items-center gap-2">
              <div className="h-3 rounded bg-gray-200 transition-all" style={{ width: `${(b.before / max) * 100}%` }} />
              <span className="text-gray-500 text-xs sm:text-sm">{b.before}{b.unit}</span>
            </div>
            {/* Arrow */}
            <span className="mx-2 text-lg text-indigo-400 hidden sm:inline">→</span>
            {/* AFTER Bar */}
            <div className="flex-1 flex items-center gap-2">
              <motion.div
                className="h-3 rounded bg-gradient-to-r from-green-400 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(b.after / max) * 100}%` }}
                transition={{ duration: 1, delay: i * 0.2 }}
              />
              <span className="text-green-600 font-bold text-xs sm:text-sm whitespace-nowrap">{b.afterText}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 