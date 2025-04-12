'use client';

import { useState } from 'react';
import { DebugPanel } from '../../components/debug/DebugPanel';
import { ApiTester } from '../../components/dev/ApiTester';
import { validateEnvironment, apiDebug } from '../../lib/debug';

export default function DevPage() {
  const [activeTab, setActiveTab] = useState<'api-tester' | 'env-check'>('api-tester');
  const [envCheckResult, setEnvCheckResult] = useState<{valid: boolean, missing?: string[]}>({ valid: true });
  
  // 페이지 로드 시 로컬스토리지 추적 시작
  if (typeof window !== 'undefined') {
    apiDebug.trackLocalStorage('token');
  }
  
  const handleEnvCheck = () => {
    const isValid = validateEnvironment();
    
    // 필수 환경변수 확인
    const requiredVars = ['NEXT_PUBLIC_API_URL'];
    const missing = requiredVars.filter(
      key => !process.env[key] || process.env[key] === ''
    );
    
    setEnvCheckResult({
      valid: isValid,
      missing: missing.length > 0 ? missing : undefined
    });
  };
  
  // 환경이 개발 모드가 아니면 접근 불가
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 제한됨</h1>
          <p className="text-gray-700">개발 환경에서만 이 페이지에 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-gray-800 text-white p-4 mb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Habitus33 개발자 도구</h1>
          <p className="text-gray-300 text-sm">
            이 페이지는 개발 환경에서만 접근할 수 있으며 로그인/회원가입 관련 문제를 디버깅하는 도구를 제공합니다.
          </p>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4">
        {/* 탭 메뉴 */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex -mb-px">
            <button
              className={`mr-1 py-2 px-4 font-medium text-sm rounded-t-lg ${
                activeTab === 'api-tester'
                  ? 'bg-white border-l border-t border-r border-gray-200 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('api-tester')}
            >
              API 테스터
            </button>
            <button
              className={`mr-1 py-2 px-4 font-medium text-sm rounded-t-lg ${
                activeTab === 'env-check'
                  ? 'bg-white border-l border-t border-r border-gray-200 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('env-check')}
            >
              환경 변수 검사
            </button>
          </div>
        </div>
        
        {/* 탭 내용 */}
        <div className="bg-white rounded-lg shadow-md">
          {activeTab === 'api-tester' && (
            <ApiTester />
          )}
          
          {activeTab === 'env-check' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">환경 변수 검사</h2>
              
              <p className="mb-4 text-gray-600">
                이 도구는 필수 환경 변수가 올바르게 설정되었는지 확인합니다. 환경 변수 문제는 API 요청 실패의 흔한 원인입니다.
              </p>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-gray-700">현재 환경 변수:</h3>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="mb-1">
                    <span className="font-mono">NEXT_PUBLIC_API_URL:</span>{' '}
                    <span className="font-semibold">
                      {process.env.NEXT_PUBLIC_API_URL || '(설정되지 않음)'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    이 변수는 프론트엔드에서 백엔드 API에 접근하기 위한 기본 URL입니다.
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleEnvCheck}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                환경 변수 검사하기
              </button>
              
              {envCheckResult.missing && (
                <div className={`mt-4 p-4 rounded-md ${
                  envCheckResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                } border`}>
                  {envCheckResult.valid ? (
                    <p className="text-green-700 font-medium">
                      ✅ 모든 필수 환경 변수가 정상적으로 설정되었습니다.
                    </p>
                  ) : (
                    <>
                      <p className="text-red-700 font-medium mb-2">
                        ❌ 다음 환경 변수가 설정되지 않았습니다:
                      </p>
                      <ul className="list-disc pl-5 text-red-700">
                        {envCheckResult.missing.map(variable => (
                          <li key={variable}>{variable}</li>
                        ))}
                      </ul>
                      <div className="mt-3 p-3 bg-gray-100 rounded text-gray-700 text-sm">
                        <p className="font-medium mb-1">해결 방법:</p>
                        <ol className="list-decimal pl-5">
                          <li>프로젝트 루트에 <code className="font-mono bg-gray-200 px-1 rounded">.env.local</code> 파일을 만들거나 편집하세요.</li>
                          <li>다음 내용을 추가하세요: <code className="font-mono bg-gray-200 px-1 rounded">NEXT_PUBLIC_API_URL=http://localhost:8000/api</code></li>
                          <li>개발 서버를 재시작하세요.</li>
                        </ol>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* 디버그 패널 */}
      <DebugPanel initiallyVisible={false} />
    </div>
  );
} 