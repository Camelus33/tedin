import api from '@/lib/api';
import { notFound } from 'next/navigation';
import { AlertTriangle, BookOpen, Calendar, Link as LinkIcon, MessageSquare, Microscope, Paperclip } from 'lucide-react';

// interface SharePageProps {
//   params: { shareId: string };
// }

async function getShareData(shareId: string) {
  try {
    // This API call is made server-side
    const response = await api.get(`/public-shares/${shareId}`, {
      // Use a longer timeout for server-side rendering if needed
      timeout: 10000, 
    });
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch share data for ${shareId}:`, error.message);
    if (error.response && error.response.status === 404) {
      return null; // Share link not found
    }
    // For server errors, we can pass a specific state
    return { error: 'server_error' };
  }
}

// A more robust and visually appealing component for missing data
const ErrorDisplay = ({ message, reason }: { message: string, reason: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-700">
    <div className="bg-white p-12 rounded-xl shadow-lg text-center">
      <AlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-6" />
      <h1 className="text-3xl font-bold text-gray-800">{message}</h1>
      <p className="mt-2 text-lg">{reason}</p>
    </div>
  </div>
);

export default async function SharePage({ params }: { params: { shareId: string } }) {
  const data = await getShareData(params.shareId);

  // Case 1: Server error during fetch
  if (data?.error === 'server_error') {
    return <ErrorDisplay message="노트를 불러올 수 없습니다." reason="서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요." />;
  }
  
  // Case 2: Not found or data is incomplete
  if (!data || !data.htmlData) {
    notFound(); // Use Next.js's standard 404 page for clean handling
  }

  const { htmlData, jsonLdData } = data;
  const { title, description, notes, user, createdAt } = htmlData;

  // Helper to format date nicely
  const formatDate = (isoString?: string) => isoString ? new Date(isoString).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) : '날짜 정보 없음';

  return (
    <>
      {/* 
        This script tag injects the structured data into the page head.
        AI Crawlers like Google NotebookLM will read this for deep context.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      
      {/* 
        This is the human-readable content, styled minimally but structured semantically.
        It serves as a fallback for crawlers that don't process JSON-LD and for direct viewing.
      */}
      <main className="font-sans bg-gray-100 text-gray-800 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-lg">
          <header className="border-b-2 border-gray-200 pb-6 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">{title ?? '제목 없음'}</h1>
            {description && <p className="mt-4 text-lg text-gray-600">{description}</p>}
             <div className="mt-4 text-sm text-gray-500">
                <span>{`작성자: ${user?.name ?? '알 수 없음'}`}</span>
                <span className="mx-2">·</span>
                <span>{`공유일: ${formatDate(createdAt)}`}</span>
            </div>
          </header>

          <div className="space-y-10">
            {notes && notes.length > 0 ? (
              notes.map((note: any, index: number) => (
              <article key={note._id || index} className="border-t border-gray-200 pt-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-cyan-500 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold">{index + 1}</div>
                  <h2 className="flex-1 text-2xl font-semibold text-gray-800 break-words">{note.content ?? '내용 없음'}</h2>
                </div>
                
                <div className="mt-6 pl-12 space-y-6">
                  {note.sessionDetails && (
                    <section className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-800 flex items-center"><Paperclip className="h-4 w-4 mr-2 text-gray-500" />메타 정보</h3>
                      <ul className="mt-2 text-sm text-gray-700 space-y-1">
                        {note.sessionDetails?.createdAtISO && <li><Calendar className="inline h-4 w-4 mr-1"/><strong>기록일:</strong> {formatDate(note.sessionDetails.createdAtISO)}</li>}
                        {note.book?.title && <li><BookOpen className="inline h-4 w-4 mr-1"/><strong>출처:</strong> {note.book.title} {note.book.author && `(${note.book.author})`}</li>}
                        {(note.sessionDetails?.startPage && note.sessionDetails?.actualEndPage) && 
                          <li><strong>페이지:</strong> {note.sessionDetails.startPage}p ~ {note.sessionDetails.actualEndPage}p</li>
                        }
                      </ul>
                    </section>
                  )}

                  {(note.importanceReason || note.momentContext || note.relatedKnowledge || note.mentalImage) && (
                    <section>
                      <h3 className="font-semibold text-gray-800 flex items-center"><Microscope className="h-4 w-4 mr-2 text-gray-500" />메모 진화</h3>
                      <ul className="mt-2 text-sm text-gray-700 space-y-1 list-inside">
                        {note.importanceReason && <li><strong className="text-purple-600">작성 이유:</strong> {note.importanceReason}</li>}
                        {note.momentContext && <li><strong className="text-purple-600">당시 상황:</strong> {note.momentContext}</li>}
                        {note.relatedKnowledge && <li><strong className="text-purple-600">연상 지식:</strong> {note.relatedKnowledge}</li>}
                        {note.mentalImage && <li><strong className="text-purple-600">떠오른 장면:</strong> {note.mentalImage}</li>}
                      </ul>
                    </section>
                  )}

                  {note.relatedLinks && note.relatedLinks.length > 0 && (
                     <section>
                      <h3 className="font-semibold text-gray-800 flex items-center"><LinkIcon className="h-4 w-4 mr-2 text-gray-500" />연결된 지식</h3>
                       <ul className="mt-2 text-sm text-gray-700 space-y-2">
                        {note.relatedLinks.map((link: any) => (
                          <li key={link.url} className="flex items-start">
                             <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{link.url}</a>
                            {link.reason && <p className="text-gray-600 text-sm ml-2">-&nbsp;{link.reason}</p>}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </article>
            ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg">아직 이 노트에 담긴 내용이 없습니다.</p>
                  <p>첫 페이지를 넘기는 용기가 곧 위대한 시작입니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
} 