import api from '@/lib/api';
import { notFound } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import SharePageLayout from './SharePageLayout'; // Import the new client component

async function getShareData(shareId: string) {
  try {
    const response = await api.get(`/public-shares/${shareId}`, {
      timeout: 10000, 
    });
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch share data for ${shareId}:`, error.message);
    if (error.response && error.response.status === 404) {
      return null;
    }
    return { error: 'server_error' };
  }
}

const ErrorDisplay = ({ message, reason }: { message: string, reason: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-300">
    <div className="bg-gray-800 p-12 rounded-xl shadow-lg text-center border border-red-500/30">
      <AlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-6" />
      <h1 className="text-3xl font-bold text-gray-100">{message}</h1>
      <p className="mt-2 text-lg text-gray-400">{reason}</p>
    </div>
  </div>
);

export default async function SharePage({ params }: { params: { shareId: string } }) {
  const data = await getShareData(params.shareId);

  if (data?.error === 'server_error') {
    return <ErrorDisplay message="노트를 불러올 수 없습니다." reason="서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요." />;
  }
  
  if (!data || !data.htmlData) {
    notFound();
  }

  const { htmlData, jsonLdData } = data;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <SharePageLayout htmlData={htmlData} jsonLdData={jsonLdData} shareId={params.shareId} />
    </>
  );
}
