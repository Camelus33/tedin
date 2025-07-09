'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { UserIcon, EnvelopeIcon, PhoneIcon, CreditCardIcon, ArrowUpCircleIcon, ReceiptRefundIcon, TagIcon, QuestionMarkCircleIcon, XCircleIcon, BellIcon, MoonIcon, DocumentArrowDownIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon, LifebuoyIcon } from '@heroicons/react/24/outline';
import { ClientDateDisplay } from '@/components/share/ClientTimeDisplay';

type UserProfile = {
  _id: string;
  email: string;
  nickname: string;
  profileImage?: string;
  invitedBy?: string;
  trialEndsAt: string;
  inviteCode?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [invitedUsers, setInvitedUsers] = useState<{ nickname: string; createdAt: string }[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editNickname, setEditNickname] = useState<string>('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [recoveryEmail, setRecoveryEmail] = useState<string>('');
  const [birth, setBirth] = useState('');
  const [interest, setInterest] = useState('');
  const [goal, setGoal] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [customInfoMsg, setCustomInfoMsg] = useState('');
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      let profileData: UserProfile | null = null;
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        try {
          // Fetch user profile
          const profileResponse = await fetch('/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!profileResponse.ok) {
            throw new Error('프로필 정보를 불러오는 데 실패했습니다.');
          }

          profileData = await profileResponse.json();
          setProfile(profileData);
          setEditNickname(profileData?.nickname || '');
          setPhone((profileData as any).phone || '');
          setRecoveryEmail((profileData as any).recoveryEmail || '');
        } catch (profileError) {
          console.error('프로필 데이터 로딩 오류:', profileError);
          // 서버 연결 오류 시 더미 데이터 설정
          profileData = {
            _id: '1',
            email: 'user@example.com',
            nickname: '사용자',
            trialEndsAt: new Date().toISOString()
          };
          setProfile(profileData);
          setEditNickname('사용자');
        }

        // Fetch invited users if invite code exists
        if (profileData?.inviteCode) {
          const invitedResponse = await fetch(`/api/invites/users?code=${profileData.inviteCode}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (invitedResponse.ok) {
            const invitedData = await invitedResponse.json();
            setInvitedUsers(invitedData.users);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setIsSaving(true);
    setError('');

    try {
      let updatedData: any = { nickname: editNickname, phone, recoveryEmail };
      let profileImageUrl = profile.profileImage;

      // Upload profile image if selected
      if (profileImage) {
        try {
          const formData = new FormData();
          formData.append('profileImage', profileImage);
          
          const imageResponse = await fetch('/api/users/profile-image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          });
          
          if (!imageResponse.ok) {
            throw new Error('프로필 이미지 업로드에 실패했습니다.');
          }
          
          const imageData = await imageResponse.json();
          profileImageUrl = imageData.imageUrl;
          updatedData.profileImage = profileImageUrl;
        } catch (imageErr: any) {
          setError(imageErr.message);
          setIsSaving(false);
          return;
        }
      }

      // Update profile data
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('프로필 정보 수정에 실패했습니다.');
      }

      const data = await response.json();
      setProfile(data);
      setPhone(data.phone || '');
      setRecoveryEmail(data.recoveryEmail || '');
      setIsEditing(false);
      setProfileImage(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const copyInviteCode = async () => {
    if (!profile?.inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(profile.inviteCode);
      alert('초대 코드가 클립보드에 복사되었습니다!');
    } catch (err) {
      alert('클립보드 복사에 실패했습니다. 수동으로 코드를 복사해주세요.');
    }
  };

  // formatDate 함수는 더 이상 필요하지 않음 - ClientDateDisplay로 대체

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p>프로필 정보 로딩 중...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="mb-6">{error}</p>
          <Button
            href="/auth/login"
            variant="default"
          >
            로그인 화면으로
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-gray-800 mb-4">프로필 정보를 불러올 수 없습니다</h1>
          <p className="mb-6">서버에 연결할 수 없거나 프로필 정보가 없습니다.</p>
          <Button
            href="/auth/login"
            variant="default"
          >
            로그인 화면으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-2xl space-y-8">
        {/* 1. 내 정보 */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-indigo-500" /> 내 정보
          </h2>
          {/* 프로필 이미지 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-indigo-300">
              {(profileImagePreview || profile.profileImage) ? (
                <img 
                  src={profileImagePreview || profile.profileImage} 
                  alt={profile.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-10 h-10 text-indigo-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <label 
                htmlFor="profile-image"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors"
              >
                이미지 변경
              </label>
            </div>
          </div>

          {/* 닉네임 */}
          <div className="flex items-center gap-3 mb-4">
            <UserIcon className="w-5 h-5 text-indigo-500" />
            {isEditing ? (
              <input
                type="text"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="닉네임"
              />
            ) : (
              <span className="text-lg font-semibold text-gray-800">{profile.nickname}</span>
            )}
          </div>

          {/* 이메일 */}
          <div className="flex items-center gap-3 mb-4">
            <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
            <span className="text-gray-800">{profile.email}</span>
          </div>

          {/* 휴대폰 번호 */}
          <div className="flex items-center gap-3 mb-4">
            <PhoneIcon className="w-5 h-5 text-indigo-500" />
            {isEditing ? (
              <input
                type="tel"
                className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="휴대폰 번호"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            ) : (
              <span className="text-gray-800">{phone || '휴대폰 번호 미입력'}</span>
            )}
          </div>

          {/* 복구 이메일 */}
          <div className="flex items-center gap-3 mb-4">
            <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
            {isEditing ? (
              <input
                type="email"
                className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="복구 이메일"
                value={recoveryEmail}
                onChange={e => setRecoveryEmail(e.target.value)}
              />
            ) : (
              <span className="text-gray-800">{recoveryEmail || '복구 이메일 미입력'}</span>
            )}
          </div>

          {/* 프로필 저장/수정 버튼 */}
          <div className="flex gap-2 mt-6">
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>수정</Button>
            ) : (
              <>
                <Button variant="default" onClick={handleSaveProfile} loading={isSaving}>저장</Button>
                <Button variant="outline" onClick={() => { setIsEditing(false); setEditNickname(profile.nickname); setProfileImage(null); setProfileImagePreview(profile.profileImage || null); }} disabled={isSaving}>취소</Button>
              </>
            )}
          </div>
        </section>

        {/* 2. 구독 정보 */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCardIcon className="w-6 h-6 text-indigo-500" /> 구독 정보
          </h2>
          {/* 플랜/남은 기간/업그레이드 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ArrowUpCircleIcon className="w-6 h-6 text-blue-500" />
              <div>
                <span className="font-semibold text-blue-800">
                  {profile.trialEndsAt ? '무료 체험 중' : '프리미엄 회원'}
                </span>
                <span className="ml-2 text-xs text-gray-500">(
                  남은 기간: {profile.trialEndsAt ? <ClientDateDisplay createdAt={profile.trialEndsAt} /> : '프리미엄 활성화'}
                )</span>
              </div>
            </div>
            <Button variant="default" onClick={() => router.push('/profile/upgrade')}>
              <ArrowUpCircleIcon className="w-5 h-5 mr-1 inline" /> 업그레이드
            </Button>
          </div>

          {/* 결제 내역/영수증 (UI만) */}
          <div className="flex items-center gap-3 mb-4 opacity-60">
            <ReceiptRefundIcon className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">결제 내역 없음</span>
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">준비중</span>
          </div>

          {/* 구독 해지 (UI만) */}
          <div className="flex items-center gap-3 mb-4 opacity-60">
            <XCircleIcon className="w-5 h-5 text-red-300" />
            <button className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm cursor-not-allowed" disabled>구독 해지</button>
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">준비중</span>
          </div>

          {/* 쿠폰/프로모션 코드 입력 (UI만) */}
          <div className="flex items-center gap-3 mb-4 opacity-60">
            <TagIcon className="w-5 h-5 text-indigo-300" />
            <input type="text" className="px-3 py-2 border rounded w-40 bg-gray-50 border-gray-200" placeholder="쿠폰 코드 (준비중)" disabled />
            <button className="bg-indigo-200 text-indigo-700 rounded px-3 py-1 cursor-not-allowed" disabled>적용</button>
            <span className="ml-2 text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">준비중</span>
          </div>

          {/* FAQ/고객센터 */}
          <div className="flex items-center gap-3 mt-4">
            <QuestionMarkCircleIcon className="w-5 h-5 text-indigo-400" />
            <a href="mailto:habitus33.tedin@gmail.com" className="text-indigo-600 text-sm hover:underline">구독 FAQ / 고객센터</a>
          </div>
        </section>

        {/* 3. 기타 설정 */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShieldCheckIcon className="w-6 h-6 text-indigo-500" /> 기타 설정
          </h2>
          {/* 알림 설정 (UI만) */}
          <div className="flex items-center gap-3 mb-4 opacity-60">
            <BellIcon className="w-5 h-5 text-indigo-400" />
            <span className="text-gray-700">이메일 알림</span>
            <input type="checkbox" className="accent-indigo-500" disabled />
            <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5 ml-2">준비중</span>
          </div>

          {/* 테마 설정 (UI만) */}
          <div className="flex items-center gap-3 mb-4 opacity-60">
            <MoonIcon className="w-5 h-5 text-indigo-400" />
            <span className="text-gray-700">다크모드</span>
            <input type="checkbox" className="accent-indigo-500" disabled />
            <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5 ml-2">준비중</span>
          </div>

          {/* 데이터/개인정보 관리 (UI만) */}
          <div className="flex items-center gap-3 mb-4 opacity-60">
            <DocumentArrowDownIcon className="w-5 h-5 text-indigo-400" />
            <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm cursor-not-allowed" disabled>내 데이터 다운로드</button>
            <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5 ml-2">준비중</span>
          </div>
          <div className="flex items-center gap-3 mb-4 opacity-60">
            <ShieldCheckIcon className="w-5 h-5 text-indigo-400" />
            <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm cursor-not-allowed" disabled>개인정보 처리방침</button>
            <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5 ml-2">준비중</span>
          </div>

          {/* 계정 탈퇴 (UI만) */}
          <div className="flex items-center gap-3 mb-4 opacity-60">
            <XCircleIcon className="w-5 h-5 text-red-300" />
            <button className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm cursor-not-allowed" disabled>계정 탈퇴</button>
            <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5 ml-2">준비중</span>
          </div>

          {/* 로그아웃 */}
          <div className="flex items-center gap-3 mb-4">
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-indigo-500" />
            <Button variant="danger" className="w-full" onClick={logout}>로그아웃</Button>
          </div>

          {/* 고객센터/피드백 */}
          <div className="flex items-center gap-3 mt-4">
            <LifebuoyIcon className="w-5 h-5 text-indigo-400" />
            <a href="mailto:habitus33.tedin@gmail.com" className="text-indigo-600 text-sm hover:underline">고객센터 / 피드백</a>
          </div>
        </section>
      </div>
    </div>
  );
} 