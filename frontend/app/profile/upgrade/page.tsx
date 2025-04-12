'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { paymentService } from '@/lib/apiClient';
import { toast } from 'react-hot-toast';

type PricingPlan = {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  discountPercentage?: number;
  popular?: boolean;
};

export default function UpgradePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const pricingPlans: PricingPlan[] = [
    {
      id: 'monthly',
      name: '월간 구독',
      price: 9900,
      interval: 'month',
      description: '월간 결제로 하비투스의 모든 기능을 이용하세요',
      features: [
        '무제한 독서 세션',
        'Zengo 모드 완전 해제',
        '고급 독서 분석',
        '독서 목표 관리',
        '독서 캘린더',
        '클라우드 동기화',
      ],
    },
    {
      id: 'yearly',
      name: '연간 구독',
      price: 99000,
      interval: 'year',
      description: '2개월 무료! 연간 결제로 더 큰 할인을 받으세요',
      features: [
        '무제한 독서 세션',
        'Zengo 모드 완전 해제',
        '고급 독서 분석',
        '독서 목표 관리',
        '독서 캘린더',
        '클라우드 동기화',
        '우선 고객 지원',
      ],
      discountPercentage: 17,
      popular: true,
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

      const selectedPlanData = pricingPlans.find(plan => plan.id === selectedPlan);
      if (!selectedPlanData) {
        throw new Error('플랜을 선택해주세요.');
      }

      // Call the payment service to create a checkout session
      const { checkoutUrl } = await paymentService.createCheckoutSession(selectedPlan);
      
      // Redirect to the Stripe checkout page
      window.location.href = checkoutUrl;
    } catch (err: any) {
      const errorMessage = err.message || '결제 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <button 
            onClick={() => router.back()} 
            className="absolute left-4 top-4 text-gray-600 hover:text-gray-900"
          >
            ← 뒤로
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">프리미엄으로 업그레이드</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            하비투스 프리미엄으로 업그레이드하고 최고의 독서 경험을 누려보세요.
            언제든지 구독을 취소할 수 있습니다.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`
                bg-white rounded-xl shadow-lg p-6 border-2 relative
                ${selectedPlan === plan.id ? 'border-indigo-500' : 'border-transparent'}
                ${plan.popular ? 'md:transform md:-translate-y-2' : ''}
              `}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                  인기
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-gray-500 ml-2">
                    /{plan.interval === 'month' ? '월' : '년'}
                  </span>
                </div>
                
                {plan.discountPercentage && (
                  <div className="text-green-600 text-sm font-medium mt-1">
                    {plan.discountPercentage}% 할인
                  </div>
                )}
              </div>
              
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto">
                <input
                  type="radio"
                  id={plan.id}
                  name="plan"
                  value={plan.id}
                  checked={selectedPlan === plan.id}
                  onChange={() => setSelectedPlan(plan.id)}
                  className="mr-2"
                />
                <label htmlFor={plan.id} className="font-medium">
                  이 플랜 선택
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">프리미엄 혜택</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-800 mb-2">무제한 독서 세션</h4>
              <p className="text-sm text-gray-600">일일 세션 제한 없이 언제든지 독서 훈련을 할 수 있습니다.</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-800 mb-2">Zengo 모드 완전 해제</h4>
              <p className="text-sm text-gray-600">집중력 향상을 위한 Zengo 모드의 모든 기능을 이용할 수 있습니다.</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-800 mb-2">고급 독서 분석</h4>
              <p className="text-sm text-gray-600">상세한 독서 패턴 분석과 맞춤형 제안을 받을 수 있습니다.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">자주 묻는 질문</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">언제든지 취소할 수 있나요?</h4>
              <p className="text-sm text-gray-600">네, 구독은 언제든지 취소할 수 있으며, 취소 시 현재 결제 주기가 끝날 때까지 서비스를 이용할 수 있습니다.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">구독 방식을 나중에 변경할 수 있나요?</h4>
              <p className="text-sm text-gray-600">네, 월간에서 연간으로 또는 연간에서 월간으로 언제든지 변경할 수 있습니다.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">결제는 어떻게 이루어지나요?</h4>
              <p className="text-sm text-gray-600">신용카드, 체크카드, 카카오페이, 네이버페이 등 다양한 결제 수단을 지원합니다.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            variant="default"
            onClick={handleSubscription}
            disabled={isProcessing || !selectedPlan}
            fullWidth
          >
            {isProcessing ? '처리 중...' : '지금 구독하기'}
          </Button>
          <p className="text-xs text-gray-500 mt-4">
            구독을 진행하면 하비투스의 <a href="/legal/terms" className="underline">이용약관</a>과 
            <a href="/legal/privacy" className="underline"> 개인정보처리방침</a>에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
} 