'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';

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
      let updatedData: any = { nickname: editNickname };
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">마이페이지</h1>
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">내 정보</h2>
            {!isEditing ? (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
              >
                수정
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="default"
                  onClick={handleSaveProfile}
                  loading={isSaving}
                >
                  저장
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditNickname(profile.nickname);
                    setProfileImage(null); // Reset image selection on cancel
                    setProfileImagePreview(profile.profileImage || null);
                  }}
                  disabled={isSaving}
                >
                  취소
                </Button>
              </div>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {/* 프로필 이미지 */}
            <div>
              <label className="block text-sm text-gray-500 mb-2">프로필 이미지</label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {(profileImagePreview || profile.profileImage) ? (
                    <img 
                      src={profileImagePreview || profile.profileImage} 
                      alt={profile.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-xl">{profile.nickname?.charAt(0) || '?'}</span>
                    </div>
                  )}
                </div>
                
                {isEditing && (
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
                      이미지 선택
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-1">이메일</label>
              <p className="text-gray-800">{profile.email}</p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-1">닉네임</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              ) : (
                <p className="text-gray-800">{profile.nickname}</p>
              )}
            </div>
            
            {profile.trialEndsAt && (
              <div>
                <label className="block text-sm text-gray-500 mb-1">체험 종료일</label>
                <p className="text-gray-800">{formatDate(profile.trialEndsAt)}</p>
              </div>
            )}
            
            {profile.inviteCode && (
              <div>
                <label className="block text-sm text-gray-500 mb-1">초대 코드</label>
                <div className="flex items-center space-x-2">
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded font-medium">
                    {profile.inviteCode}
                  </span>
                  <button
                    onClick={copyInviteCode}
                    className="text-indigo-600 text-sm hover:text-indigo-800"
                  >
                    복사
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  친구에게 초대 코드를 공유하면, 친구의 체험 기간이 연장됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Invited Users Card */}
        {invitedUsers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">초대한 친구들</h2>
            <div className="space-y-3">
              {invitedUsers.map((user, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="font-medium">{user.nickname}</span>
                  <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Subscription Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">구독 정보</h2>
          <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-blue-800">무료 체험 중</p>
              <p className="text-sm text-gray-600">
                남은 기간: {profile.trialEndsAt ? formatDate(profile.trialEndsAt) : '정보 없음'}까지
              </p>
            </div>
            <Button 
              variant="default"
              onClick={() => router.push('/profile/upgrade')}
            >
              업그레이드
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            프리미엄 구독으로 업그레이드하면 무제한 독서 세션, Zengo 모드 전체 해제, 고급 분석 등의 혜택을 누릴 수 있습니다.
          </p>
        </div>
        
        {/* Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <Button 
            variant="danger" 
            className="w-full"
            onClick={logout}
          >
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
} 