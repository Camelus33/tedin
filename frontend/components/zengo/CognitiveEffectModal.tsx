import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map, ListOrdered, Combine } from 'lucide-react';

interface CognitiveEffectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CognitiveEffectModal({ isOpen, onClose }: CognitiveEffectModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-cyan-500 text-gray-200 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-400">젠고의 비밀: 당신의 뇌를 위한 보이지 않는 훈련</DialogTitle>
          <DialogDescription className="text-gray-400 pt-2">
            젠고는 단순한 게임을 넘어, 뇌의 핵심 인지 능력을 강화하는 정교한 훈련 도구입니다.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6 text-gray-300">
          <div className="flex items-start space-x-4">
            <Map className="w-8 h-8 text-cyan-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-400">1. '머릿속의 내비게이션'이 정교해져요 (공간 작업 기억력)</h3>
              <p className="text-sm mt-1">
                <strong className="text-cyan-400">훈련:</strong> 바둑돌의 '위치'를 기억하는 것은 뇌의 '공간 작업 기억'을 직접적으로 자극합니다.
              </p>
              <p className="text-sm mt-1">
                <strong className="text-purple-400">실생활 효과:</strong> 복잡한 공간 속에서 원하는 정보를 놓치지 않고 정확히 찾아내는 힘이 길러집니다. 더 이상 "어디에 뒀더라?"하며 헤매는 시간이 줄어들 거예요.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <ListOrdered className="w-8 h-8 text-cyan-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-400">2. '이야기의 순서'를 꿰뚫는 힘이 생겨요 (순차 기억력)</h3>
              <p className="text-sm mt-1">
                <strong className="text-cyan-400">훈련:</strong> 단어의 '순서'를 기억하고 그대로 재현하는 과정은, 뇌가 시간의 흐름에 따라 정보를 조직화하는 능력을 키웁니다.
              </p>
              <p className="text-sm mt-1">
                <strong className="text-purple-400">실생활 효과:</strong> 회의 내용을 순서대로 기억하거나, 요리 레시피를 따라 하는 것처럼 순서가 중요한 모든 작업의 효율이 극적으로 향상됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Combine className="w-8 h-8 text-cyan-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-400">3. '흩어진 정보'를 하나로 묶어내요 (정보 통합 능력)</h3>
              <p className="text-sm mt-1">
                <strong className="text-cyan-400">훈련:</strong> '어떤 단어'가 '어느 위치'에 '몇 번째'로 나타났는지, 이 세 가지 정보를 통합하는 것은 고차원적인 인지 활동입니다.
              </p>
              <p className="text-sm mt-1">
                <strong className="text-purple-400">실생활 효과:</strong> 여러 보고서를 읽고 핵심을 요약하거나, 다양한 데이터를 종합해 새로운 아이디어를 떠올리는 등, 흩어진 조각들을 모아 의미 있는 그림을 만드는 '지식 건축가'가 될 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 border-t border-gray-700 pt-4">
          <div className="text-xs text-gray-500 text-left w-full">
            <p>* 게임 결과 화면의 '인지능력 프로필'과 '분석 페이지'에서 당신의 성장 과정을 직접 확인해 보세요.</p>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="bg-purple-500 hover:bg-purple-600 text-white">
              닫기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 