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
import { Brain, Target, Zap, X } from 'lucide-react';

interface CognitiveEffectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CognitiveEffectModal({ isOpen, onClose }: CognitiveEffectModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-2 border-cyan-500/50 text-gray-100 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative pb-4">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
          
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                젠고가 키워주는 3가지 능력
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-sm mt-1">
                3분만 투자해도 뇌가 달라집니다
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 공간 기억력 */}
          <div className="bg-gray-800/50 rounded-xl p-5 border border-cyan-500/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                  공간 기억력
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  바둑돌의 위치를 기억하는 훈련으로 <strong className="text-white">머릿속 지도</strong>가 정교해집니다.
                </p>
                <div className="bg-gray-900/50 rounded-lg p-3 border-l-4 border-cyan-500">
                  <p className="text-xs text-gray-400">
                    💡 <strong className="text-cyan-300">실생활 효과:</strong> 
                    물건을 어디에 뒀는지 기억하고, 복잡한 자료에서 원하는 정보를 빠르게 찾을 수 있어요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 순차 기억력 */}
          <div className="bg-gray-800/50 rounded-xl p-5 border border-purple-500/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">
                  순서 기억력
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  단어의 순서를 기억하며 <strong className="text-white">논리적 사고</strong>가 체계화됩니다.
                </p>
                <div className="bg-gray-900/50 rounded-lg p-3 border-l-4 border-purple-500">
                  <p className="text-xs text-gray-400">
                    💡 <strong className="text-purple-300">실생활 효과:</strong> 
                    회의 내용을 순서대로 기억하고, 단계별 작업을 놓치지 않고 처리할 수 있어요.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 통합 사고력 */}
          <div className="bg-gray-800/50 rounded-xl p-5 border border-gradient-to-r from-cyan-500/20 to-purple-500/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                  통합 사고력
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  위치, 내용, 순서를 동시에 처리하며 <strong className="text-white">종합적 판단력</strong>이 향상됩니다.
                </p>
                <div className="bg-gray-900/50 rounded-lg p-3 border-l-4 border-gradient-to-b from-cyan-500 to-purple-500">
                  <p className="text-xs text-gray-400">
                    💡 <strong className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">실생활 효과:</strong> 
                    복잡한 정보를 정리하고, 창의적인 아이디어를 떠올리는 능력이 생겨요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 pt-4 border-t border-gray-700">
          <div className="w-full text-center">
            <p className="text-xs text-gray-500 mb-4">
              🎯 게임 결과에서 <strong className="text-cyan-400">인지능력 분석</strong>을 확인해 보세요
            </p>
            <DialogClose asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium px-8 py-2 rounded-lg transition-all duration-200">
                시작할 준비 완료!
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 