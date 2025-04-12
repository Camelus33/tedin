'use client';

import { useState } from 'react';
import { apiDebug, debugLogger } from '../../lib/debug';

const DEFAULT_ENDPOINTS = [
  { 
    name: '로그인', 
    path: '/api/auth/login', 
    method: 'POST',
    defaultPayload: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    }, null, 2)
  },
  { 
    name: '회원가입', 
    path: '/api/auth/register', 
    method: 'POST',
    defaultPayload: JSON.stringify({
      email: 'new@example.com',
      password: 'password123',
      nickname: '테스트계정'
    }, null, 2)
  },
  { 
    name: '책 목록', 
    path: '/api/books', 
    method: 'GET',
    defaultPayload: ''
  },
  { 
    name: '세션 생성', 
    path: '/api/sessions', 
    method: 'POST',
    defaultPayload: JSON.stringify({
      bookId: '6423a7bfc908d2f3a4c0b6d3',
      mode: 'TS',
      startPage: 1,
      endPage: 20
    }, null, 2)
  }
];

interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  data: any;
  time: number;
}

export function ApiTester() {
  const [endpoints, setEndpoints] = useState(DEFAULT_ENDPOINTS);
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [payload, setPayload] = useState(endpoints[0].defaultPayload);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [customMethod, setCustomMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 현재 선택된 엔드포인트
  const selectedEndpoint = endpoints[selectedEndpointIndex];

  // 엔드포인트 선택 변경 시
  const handleEndpointChange = (index: number) => {
    setSelectedEndpointIndex(index);
    setPayload(endpoints[index].defaultPayload);
    setError(null);
    setResponse(null);
  };

  // 커스텀 엔드포인트 추가
  const handleAddCustomEndpoint = () => {
    if (!customEndpoint) return;
    
    const newEndpoint = {
      name: `커스텀 (${customMethod} ${customEndpoint})`,
      path: customEndpoint.startsWith('/') ? customEndpoint : `/${customEndpoint}`,
      method: customMethod,
      defaultPayload: customMethod !== 'GET' ? '{\n  \n}' : ''
    };
    
    const newEndpoints = [...endpoints, newEndpoint];
    setEndpoints(newEndpoints);
    setSelectedEndpointIndex(newEndpoints.length - 1);
    setPayload(newEndpoint.defaultPayload);
    setCustomEndpoint('');
  };

  // API 요청 전송
  const handleSendRequest = async () => {
    setIsLoading(true);
    setError(null);
    
    const startTime = Date.now();
    
    try {
      const requestOptions: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
      };
      
      // GET 요청이 아닌 경우에만 body 추가
      if (selectedEndpoint.method !== 'GET' && payload.trim()) {
        requestOptions.body = payload;
      }
      
      // 토큰이 있으면 헤더에 추가
      const token = localStorage.getItem('token');
      if (token) {
        requestOptions.headers = {
          ...requestOptions.headers,
          Authorization: `Bearer ${token}`
        };
      }
      
      // apiDebug 래퍼를 통해 요청
      const apiUrl = selectedEndpoint.path.startsWith('http') 
        ? selectedEndpoint.path 
        : selectedEndpoint.path;
        
      const res = await apiDebug.logApiRequest(apiUrl, requestOptions, 'API 테스터');
      
      const data = await res.json();
      const endTime = Date.now();
      
      setResponse({
        status: res.status,
        headers: Object.fromEntries(Array.from(res.headers)),
        data,
        time: endTime - startTime
      });
      
      // 성공적인 응답 기록
      debugLogger.info(`API 테스트 성공: ${selectedEndpoint.method} ${selectedEndpoint.path}`, {
        status: res.status,
        time: `${endTime - startTime}ms`,
        data
      });
    } catch (err: any) {
      const endTime = Date.now();
      setError(err.toString());
      
      // 오류 기록
      debugLogger.error(`API 테스트 실패: ${selectedEndpoint.method} ${selectedEndpoint.path}`, {
        error: err.message || err.toString(),
        time: `${endTime - startTime}ms`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 환경이 개발 모드가 아니면 아무것도 렌더링하지 않음
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API 테스터</h1>
      
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">요청 정보</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              엔드포인트
            </label>
            <select
              value={selectedEndpointIndex}
              onChange={(e) => handleEndpointChange(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {endpoints.map((endpoint, i) => (
                <option key={i} value={i}>
                  {endpoint.name} ({endpoint.method} {endpoint.path})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메소드
            </label>
            <div className="p-2 border border-gray-300 rounded-md bg-gray-100">
              {selectedEndpoint.method}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Request Body {selectedEndpoint.method === 'GET' && '(GET 요청은 body가 없습니다)'}
            </label>
            {selectedEndpoint.method !== 'GET' && (
              <button
                onClick={() => setPayload(selectedEndpoint.defaultPayload)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                기본값으로 재설정
              </button>
            )}
          </div>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            disabled={selectedEndpoint.method === 'GET'}
            className="w-full h-40 p-2 font-mono text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder={selectedEndpoint.method === 'GET' ? 'GET 요청은 본문이 없습니다' : '요청 본문 JSON'}
          />
        </div>
        
        <button
          onClick={handleSendRequest}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? '요청 중...' : '요청 보내기'}
        </button>
      </div>
      
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">커스텀 엔드포인트 추가</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메소드
            </label>
            <select
              value={customMethod}
              onChange={(e) => setCustomMethod(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              경로
            </label>
            <input
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="/api/your-endpoint"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          
          <div className="col-span-1 flex items-end">
            <button
              onClick={handleAddCustomEndpoint}
              disabled={!customEndpoint}
              className="w-full py-2 px-4 bg-gray-600 text-white font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              추가
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4">응답 결과</h2>
        
        {error ? (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <h3 className="text-red-800 font-medium">오류 발생</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        ) : response ? (
          <div>
            <div className="flex items-center mb-4 p-2 bg-gray-100 rounded">
              <div className={`text-white text-sm font-medium px-2 py-1 rounded mr-2 ${
                response.status >= 200 && response.status < 300 
                  ? 'bg-green-500' 
                  : response.status >= 400 
                    ? 'bg-red-500' 
                    : 'bg-yellow-500'
              }`}>
                {response.status}
              </div>
              <span className="text-gray-700">
                {selectedEndpoint.method} {selectedEndpoint.path}
              </span>
              <span className="ml-auto text-gray-500 text-sm">
                {response.time}ms
              </span>
            </div>
            
            <div className="mb-4">
              <h3 className="text-gray-700 font-medium mb-2">헤더</h3>
              <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto">
                {JSON.stringify(response.headers, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="text-gray-700 font-medium mb-2">응답 내용</h3>
              <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center p-10 text-gray-500">
            요청을 보내면 여기에 결과가 표시됩니다
          </div>
        )}
      </div>
    </div>
  );
} 