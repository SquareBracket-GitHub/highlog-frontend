import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, Alert } from 'react-native';

import BottomNav from '../components/BottomNav';
import { CommonStyles } from './styles';
import { getStudentInfo, logout } from '../utils/auth';
import { getStudent } from '../services/apiClient';

interface StudentInfo {
  id: number;
  username: string;
  login_id: string;
  grade: number;
  class_no: number;
  school_number: number;
}

export default function ProfileScreen() {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  const fetchStudentInfo = async () => {
    try {
      const info = await getStudentInfo();
      if (!info) {
        Alert.alert('오류', '로그인 정보를 찾을 수 없습니다.');
        router.push('/login');
        return;
      }
      setStudent(info);
    } catch (err: any) {
      const message = err?.data?.message || '학생 정보를 불러올 수 없습니다.';
      Alert.alert('오류', message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      { text: '취소', onPress: () => {} },
      {
        text: '로그아웃',
        onPress: async () => {
          await logout();
          router.push('/login');
        },
      },
    ]);
  };
  return (
    <View style={CommonStyles.container}>
      {/* 상단 */}
      <View style={CommonStyles.headerSectionLarge}>
        <Text style={CommonStyles.title}>내 정보</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10 }}>정보를 불러오는 중...</Text>
        </View>
      ) : student ? (
        <>
          {/* 프로필 카드 */}
          <View style={CommonStyles.profileCard}>
            {/* 프로필 */}
            <View style={CommonStyles.profileSection}>
              {/* 프로필 아이콘 */}
              <View style={CommonStyles.profileIcon}>
                <Text style={CommonStyles.profileIconEmoji}>👤</Text>
              </View>

              <Text style={CommonStyles.profileName}>{student.username}</Text>
              <Text style={CommonStyles.profileSubtitle}>
                {student.grade}학년 {student.class_no}반
              </Text>
            </View>

            {/* 정보 영역 */}
            <InfoRow label="아이디" value={student.login_id} />
            <InfoRow label="학년" value={`${student.grade}학년`} />
            <InfoRow label="반" value={`${student.class_no}반`} />
            <InfoRow label="학번" value={String(student.school_number)} />
          </View>

          {/* 버튼 영역 */}
          <TouchableOpacity style={CommonStyles.editButton}>
            <Text style={CommonStyles.editButtonText}>정보 수정</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={[CommonStyles.editButton, { backgroundColor: '#e74c3c' }]}
          >
            <Text style={CommonStyles.editButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </>
      ) : null}

      {/* 하단 네비게이션 */}
      <View style={CommonStyles.bottomNavContainer}>
        <BottomNav active="profile" />
      </View>
    </View>
  );
}

/* 헬퍼 컴포넌트 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={CommonStyles.infoRow}>
      <Text style={CommonStyles.infoLabel}>{label}</Text>
      <Text style={CommonStyles.infoValue}>{value}</Text>
    </View>
  );
}