"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, CheckCircle, XCircle, Bot } from 'lucide-react';

interface AIProvider {
  id: 'openai' | 'anthropic' | 'gemini';
  name: string;
  envVar: string;
}

const providers: AIProvider[] = [
  { id: 'openai', name: 'OpenAI (GPT-4, etc.)', envVar: 'OPENAI_API_KEY' },
  { id: 'anthropic', name: 'Anthropic (Claude 3, etc.)', envVar: 'ANTHROPIC_API_KEY' },
  { id: 'gemini', name: 'Gemini (Google)', envVar: 'gemini_api_key' },
];

const AIProviderCard = ({ provider }: { provider: AIProvider }) => {
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isKeySet, setIsKeySet] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(provider.envVar);
    if (storedKey) {
      setIsKeySet(true);
      setApiKey(storedKey);
    }
  }, [provider.envVar]);

  const handleSave = () => {
    localStorage.setItem(provider.envVar, apiKey);
    setIsKeySet(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleRemove = () => {
    localStorage.removeItem(provider.envVar);
    setApiKey('');
    setIsKeySet(false);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6" />
            <CardTitle>{provider.name}</CardTitle>
        </div>
        {isKeySet && !isEditing ? (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">연결됨</span>
          </div>
        ) : (
            <div className="flex items-center space-x-2 text-gray-500">
                <XCircle className="h-5 w-5" />
                <span className="text-sm font-medium">연결 안됨</span>
            </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing || !isKeySet ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <KeyRound className="h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="여기에 API 키를 입력하세요"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={!isKeySet}>취소</Button>
              <Button onClick={handleSave}>저장</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">API 키가 안전하게 저장되었습니다.</p>
            <div className="flex space-x-2">
                <Button variant="outline" onClick={handleEdit}>수정</Button>
                <Button variant="destructive" onClick={handleRemove}>삭제</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const AIConnectionHub = () => {
  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">AI 연결 허브</h2>
        <p className="text-gray-600 mt-2">
          사용하시는 AI 서비스의 API 키를 연결해주세요. API 키는 브라우저에만 안전하게 저장되며, 저희 서버로 절대 전송되지 않습니다.
        </p>
      </div>
      <div className="space-y-4">
        {providers.map((p) => (
          <AIProviderCard key={p.id} provider={p} />
        ))}
      </div>
    </div>
  );
}; 