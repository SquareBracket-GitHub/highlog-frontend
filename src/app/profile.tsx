import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { studentService } from '../services';
import { clearCurrentStudent, getCurrentStudent } from '../store/auth';
import { CommonStyles } from './styles';

export default function ProfileScreen() {
  const student = getCurrentStudent();
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(student?.username || '');
  const [editGrade, setEditGrade] = useState(student?.grade.toString() || '');
  const [editClassNo, setEditClassNo] = useState(student?.class_no.toString() || '');

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', onPress: () => {} },
      {
        text: '로그아웃',
        onPress: () => {
          clearCurrentStudent();
          router.push('/login');
        },
      },
    ]);
  };

  const handleSaveEdit = async () => {
    if (!student) {
      Alert.alert('오류', '로그인 정보가 없습니다');
      return;
    }

    try {
      const gradeNum = parseInt(editGrade, 10);
      const classNoNum = parseInt(editClassNo, 10);

      await studentService.update(student.id, {
        username: editUsername,
        grade: gradeNum,
        class_no: classNoNum,
        school_number: student.school_number,
      });

      Alert.alert('성공', '정보가 수정되었습니다');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('오류', '정보 수정 중 오류가 발생했습니다');
      console.error(error);
    }
  };

  if (!student) {
    return (
      <View style={CommonStyles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          로그인 정보가 없습니다
        </Text>
        <TouchableOpacity
          style={CommonStyles.primaryButton}
          onPress={() => router.push('/login')}
        >
          <Text style={CommonStyles.primaryButtonText}>로그인하기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={CommonStyles.container}>
      {/* 상단 */}
      <View style={CommonStyles.headerSectionLarge}>
        <Text style={CommonStyles.title}>내 정보</Text>
      </View>

      {/* 프로필 카드 */}
      <View style={CommonStyles.profileCard}>
        {/* 프로필 */}
        <View style={CommonStyles.profileSection}>
          {/* 프로필 아이콘 */}
          <View style={CommonStyles.profileIcon}>
            <Text style={CommonStyles.profileIconEmoji}>👤</Text>
          </View>

          {isEditing ? (
            <>
              <Text style={CommonStyles.profileName}>{editUsername}</Text>
              <Text style={CommonStyles.profileSubtitle}>
                {editGrade}학년 {editClassNo}반
              </Text>
            </>
          ) : (
            <>
              <Text style={CommonStyles.profileName}>{student.username}</Text>
              <Text style={CommonStyles.profileSubtitle}>
                {student.grade}학년 {student.class_no}반
              </Text>
            </>
          )}
        </View>

        {/* 정보 영역 */}
        {!isEditing && (
          <>
            <InfoRow label="아이디" value={student.username} />
            <InfoRow label="학년" value={`${student.grade}학년`} />
            <InfoRow label="반" value={`${student.class_no}반`} />
            <InfoRow label="학번" value={student.school_number.toString()} />
          </>
        )}
      </View>

      {/* 버튼들 */}
      {isEditing ? (
        <>
          <TouchableOpacity
            style={CommonStyles.editButton}
            onPress={handleSaveEdit}
          >
            <Text style={CommonStyles.editButtonText}>저장하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[CommonStyles.editButton, { marginTop: 10, opacity: 0.6 }]}
            onPress={() => setIsEditing(false)}
          >
            <Text style={CommonStyles.editButtonText}>취소</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={CommonStyles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={CommonStyles.editButtonText}>정보 수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[CommonStyles.editButton, { marginTop: 10, opacity: 0.6 }]}
            onPress={handleLogout}
          >
            <Text style={CommonStyles.editButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </>
      )}

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