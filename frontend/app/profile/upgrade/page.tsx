'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { paymentService } from '@/lib/apiClient';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { CheckCircleIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/solid';

type PricingPlan = {
  id: 'free' | 'pro' | 'premium';
  name: string;
  priceMonthly: number;
  priceYearly: number;
  priceYearlyMonthlyEquivalent?: number; 
  intervalUnit: '월' | '년';
  description: string;
  features: string[];
  highlightFeature?: string;
  actionText: string;
  isRecommended?: boolean;
  themeColor?: string; 
  icon?: React.ElementType;
};

export default function UpgradePage() {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<PricingPlan['id']>('pro'); 
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [expanded, setExpanded] = useState<Record<PricingPlan['id'], boolean>>({ free: false, pro: false, premium: false });
  const [showFAQ, setShowFAQ] = useState<boolean>(false);

  const pricingPlans: PricingPlan[] = [
    {
      id: 'free',
      name: '기본',
      priceMonthly: 0,
      priceYearly: 0,
      intervalUnit: '월',
      description: '정해진 무료 한도 내에서 Habitus33을 체험하세요.',
      features: [
        'AI 하이브리드 검색+대화: 하루 5회 무료',
        'ZenGo 게임(마이버스/오리지널): 100% 무료',
        '인지분석 결과보기: 미제공(유료 전용)',
        'PDF 하이라이트/메모: 하루 20회',
        'AI-Link 생성: 하루 3회',
        'TS 메모카드: 100개까지 무료 작성',
      ],
      actionText: '현재 플랜 사용 중',
      icon: CheckCircleIcon,
    },
    {
      id: 'pro',
      name: 'Pro',
      priceMonthly: 9900,
      priceYearly: 99000,
      priceYearlyMonthlyEquivalent: 8250,
      intervalUnit: '월',
      description: '무료 한도를 넉넉하게 확장하고 인지분석 결과보기를 제공합니다.',
      features: [
        '인지분석 결과보기 이용 가능(유료 전용)',
        'AI 하이브리드 검색+대화: 하루 최대 200회',
        'PDF 하이라이트/메모: 하루 최대 200회',
        'AI-Link 생성: 하루 최대 50회',
        'TS 메모카드: 총 1,000개까지 작성 가능',
      ],
      actionText: 'Pro 플랜으로 시작하기',
      isRecommended: true,
      themeColor: 'indigo',
      icon: StarIcon, 
    },
    {
      id: 'premium',
      name: 'Premium',
      priceMonthly: 19900,
      priceYearly: 199000,
      priceYearlyMonthlyEquivalent: 16583,
      intervalUnit: '월',
      description: '완전 무제한 이용과 프리미엄 혜택을 제공합니다.',
      features: [
        '인지분석 결과보기 이용 가능(유료 전용)',
        'AI 하이브리드 검색+대화: 무제한',
        'PDF 하이라이트/메모: 무제한',
        'AI-Link 생성: 무제한',
        'TS 메모카드: 무제한',
      ],
      actionText: 'Premium 플랜으로 업그레이드',
      themeColor: 'purple',
      icon: SparklesIcon, 
    },
  ];

  const handleSubscription = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const planToSubscribe = pricingPlans.find(plan => plan.id === selectedPlanId);
      if (!planToSubscribe || planToSubscribe.id === 'free') {
        toast.error('유효한 유료 플랜을 선택해주세요.');
        setIsProcessing(false);
        return;
      }

      // Map UI selection to server-expected planId ('monthly' | 'yearly')
      const planId = billingCycle === 'yearly' ? 'yearly' : 'monthly';

      // Create Stripe Checkout session via Next API (Plan A)
      const { checkoutUrl } = await paymentService.createCheckoutSession(planId);
      if (!checkoutUrl) {
        throw new Error('결제 페이지 주소를 받지 못했습니다. 잠시 후 다시 시도해주세요.');
      }

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;

    } catch (err: any) {
      const errorMessage = err.message || '결제 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number, intervalUnitText: '월' | '년' = '월') => {
    if (price === 0 && intervalUnitText === '월') return '무료';
    if (price === 0 && intervalUnitText === '년') return '';

    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const currentSelectedPlanData = pricingPlans.find(p => p.id === selectedPlanId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6">
      <div className="container mx-auto max-w-5xl">
        <button 
          onClick={() => router.back()} 
          className="absolute left-4 top-4 text-slate-300 hover:text-slate-100 transition-colors flex items-center group text-sm sm:text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1 transform group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          뒤로
        </button>

        <div className="pt-6 sm:pt-8 pb-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Habitus33
            </span>
            {' '}플랜으로 잠재력 극대화
          </h1>
          <p className="text-base text-slate-300 max-w-2xl mx-auto">
            한 눈에 비교하고 바로 시작하세요.
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-slate-800 p-0.5 rounded-lg shadow-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-md text-sm font-medium transition-colors
                ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              월간 결제
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-md text-sm font-medium transition-colors relative
                ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              연간 결제
              <span className="absolute -top-2 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
                17% 할인!
              </span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-700 text-red-300 p-4 rounded-lg mb-8 text-center max-w-md mx-auto">
            <p className="font-semibold">오류 발생</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 lg:gap-6 mb-6">
          {pricingPlans.map((plan) => {
            const isCurrentFreePlan = plan.id === 'free';
            const priceToShow = billingCycle === 'yearly' && !isCurrentFreePlan 
                                ? plan.priceYearlyMonthlyEquivalent 
                                : plan.priceMonthly;
            const yearlyTotalPriceString = !isCurrentFreePlan ? `연 ${formatPrice(plan.priceYearly, '년')} 청구` : '';

            return (
              <div 
                key={plan.id}
                className={`
                  bg-slate-800/70 backdrop-blur-md rounded-xl shadow-xl p-4 pt-5 border-2 transition-all duration-300 ease-in-out relative flex flex-col
                  ${selectedPlanId === plan.id && !isCurrentFreePlan ? (plan.themeColor ? `border-${plan.themeColor}-500 shadow-${plan.themeColor}-500/30` : 'border-indigo-500 shadow-indigo-500/30') : 'border-slate-700'}
                  ${!isCurrentFreePlan ? 'hover:border-slate-600 cursor-pointer' : 'opacity-80'}
                  ${plan.isRecommended && !isCurrentFreePlan ? 'md:scale-105' : ''}
                `}
                onClick={() => !isCurrentFreePlan && setSelectedPlanId(plan.id)}
              >
                {plan.isRecommended && !isCurrentFreePlan && (
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-${plan.themeColor || 'indigo'}-500 to-${plan.themeColor || 'indigo'}-400 text-white px-3 py-0.5 rounded-full text-xs font-semibold shadow-lg`}>
                    추천 플랜
                  </div>
                )}
                
                <div className="text-center mb-4">
                  {plan.icon && <plan.icon className={`w-8 h-8 mx-auto mb-2 ${plan.themeColor ? `text-${plan.themeColor}-400` : 'text-indigo-400'}`} />}
                  <h3 className={`text-xl font-bold mb-0.5 ${plan.themeColor ? `text-${plan.themeColor}-300` : 'text-indigo-300'}`}>{plan.name}</h3>
                  <p className="text-slate-400 text-xs h-8 min-h-[2rem]">{plan.description}</p>
                </div>
                
                <div className="mb-4 text-center">
                  <span className="text-3xl font-extrabold text-white">
                    {formatPrice(priceToShow || 0, '월')}
                  </span>
                  {!isCurrentFreePlan && (
                    <span className="text-slate-400 ml-1">
                      /{plan.intervalUnit}
                    </span>
                  )}
                  {billingCycle === 'yearly' && !isCurrentFreePlan && (
                    <p className="text-xs text-slate-500 mt-1">
                      {yearlyTotalPriceString}
                    </p>
                  )}
                </div>
                
                <ul className="space-y-2 mb-4 text-sm flex-grow">
                  {(expanded[plan.id] ? plan.features : plan.features.slice(0, Math.min(4, plan.features.length))).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${plan.themeColor ? `text-${plan.themeColor}-500` : 'text-green-500'}`} />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.features.length > 4 && (
                  <div className="-mt-2 mb-2 text-right">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setExpanded(prev => ({ ...prev, [plan.id]: !prev[plan.id] })); }}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      {expanded[plan.id] ? '간단히 보기' : '자세히'}
                    </button>
                  </div>
                )}
                
                <div className="mt-auto">
                  {isCurrentFreePlan ? (
                    <div className="text-center py-2.5 px-3 rounded-lg bg-slate-700 text-slate-400 font-semibold text-sm">
                      {plan.actionText}
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setSelectedPlanId(plan.id);
                      }}
                      disabled={selectedPlanId === plan.id}
                      className={`w-full py-2.5 px-3 rounded-lg font-semibold transition-colors text-sm
                        ${selectedPlanId === plan.id 
                          ? (plan.themeColor ? `bg-${plan.themeColor}-600 text-white cursor-not-allowed` : 'bg-indigo-600 text-white cursor-not-allowed') 
                          : (plan.themeColor ? `bg-slate-700 hover:bg-${plan.themeColor}-700 text-slate-200` : 'bg-slate-700 hover:bg-indigo-700 text-slate-200')}
                      `}
                    >
                      {selectedPlanId === plan.id ? '선택됨' : plan.actionText }
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="text-center mb-4">
          <p className="text-sm text-slate-300">
            AI‑Link 캡슐마켓플레이스: 대용량 도메인 전문지식을 ::지식캡슐::로 거래하는 공간입니다.{' '}
            <Link href="/zengo/originals" legacyBehavior>
              <a className="underline text-indigo-300 hover:text-indigo-200">캡슐마켓 둘러보기 →</a>
            </Link>
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl shadow-xl p-4 sm:p-5 mb-6">
          <button
            type="button"
            onClick={() => setShowFAQ(v => !v)}
            className="w-full text-left text-white font-bold text-xl flex items-center justify-between"
          >
            <span>자주 묻는 질문</span>
            <span className="text-slate-400 text-sm">{showFAQ ? '접기' : '펼치기'}</span>
          </button>
          {showFAQ && (
            <div className="mt-4 space-y-4 max-w-2xl mx-auto">
              {[
                { q: '언제든지 플랜을 변경하거나 구독을 취소할 수 있나요?', a: '네, 언제든지 플랜을 변경하거나 다음 결제 주기에 맞춰 구독을 취소할 수 있습니다. 남은 기간 동안은 현재 플랜의 혜택을 계속 이용할 수 있습니다.' },
                { q: '연간 결제 시 할인이 적용되나요?', a: '네, 연간 결제를 선택하시면 월간 결제 대비 할인된 금액으로 1년 동안 서비스를 이용하실 수 있습니다. 각 플랜 카드에서 할인율을 확인하세요.' },
                { q: '결제 수단은 어떤 것이 있나요?', a: '신용카드, 체크카드 등 다양한 결제 수단을 지원합니다. 자세한 내용은 결제 페이지에서 확인 가능합니다.' },
                { q: '무료 플랜으로도 충분한가요?', a: '무료 플랜은 Habitus33의 핵심 기능을 경험하기에 충분합니다. 하지만 더 깊이 있는 분석, 무제한 기능, 독점 콘텐츠를 원하신다면 Pro 또는 Premium 플랜을 추천드립니다.' },
              ].map((faq, index) => (
                <div key={index} className="text-slate-300">
                  <h4 className="font-semibold text-base mb-1 text-white">{faq.q}</h4>
                  <p className="text-sm leading-snug">{faq.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center pt-2 pb-8">
          <Button
            variant={currentSelectedPlanData?.themeColor as any || "default"}
            size="lg"
            onClick={handleSubscription}
            disabled={isProcessing || !selectedPlanId || selectedPlanId === 'free'}
            className="w-full max-w-xs mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 transition-all !text-base !py-2.5"
          >
            {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  처리 중...
                </div>
              ) : (currentSelectedPlanData && currentSelectedPlanData.id !== 'free' ? `${currentSelectedPlanData.name} 플랜 (${billingCycle === 'yearly' ? '연간' : '월간'}) 구독하기` : '플랜을 선택하세요')}
          </Button>
          {selectedPlanId && selectedPlanId !== 'free' && (
            <p className="text-xs text-slate-500 mt-4 max-w-md mx-auto">
              구독을 진행하면 Habitus33의 <Link href="/legal/terms" legacyBehavior><a className="underline hover:text-slate-400">이용약관</a></Link>과
              {' '}<Link href="/legal/privacy" legacyBehavior><a className="underline hover:text-slate-400">개인정보처리방침</a></Link>에 동의하게 됩니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 