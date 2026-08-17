import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { studentService } from '../services';
import { clearCurrentStudent, getCurrentStudent, setCurrentStudent } from '../store/auth';
import { CommonStyles } from '../styles';

export default function ProfileScreen() {
  const student = getCurrentStudent();
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(student?.username || '');
  const [editGrade, setEditGrade] = useState(student?.grade.toString() || '');
  const [editClassNo, setEditClassNo] = useState(student?.classNo.toString() || '');
  const [editSchoolNumber, setEditSchoolNumber] = useState(student?.schoolNumber.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

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

    const username = editUsername.trim();
    const gradeNum = Number(editGrade);
    const classNoNum = Number(editClassNo);
    const schoolNumberNum = Number(editSchoolNumber);

    if (!username || ![gradeNum, classNoNum, schoolNumberNum].every(Number.isInteger)) {
      Alert.alert('오류', '이름과 올바른 학년, 반, 학번을 입력하세요');
      return;
    }

    setIsSaving(true);
    try {
      const updatedStudent = await studentService.update(student.id, {
        username,
        grade: gradeNum,
        classNo: classNoNum,
        schoolNumber: schoolNumberNum,
      });

      setCurrentStudent(updatedStudent);

      Alert.alert('성공', '정보가 수정되었습니다');
      setIsEditing(false);
    } catch {
      Alert.alert('오류', '정보 수정 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
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
      <ScrollView keyboardShouldPersistTaps="handled">
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
                {student.grade}학년 {student.classNo}반
              </Text>
            </>
          )}
        </View>

        {/* 정보 영역 */}
        {isEditing ? (
          <>
            <EditField label="이름" value={editUsername} onChangeText={setEditUsername} />
            <EditField label="학년" value={editGrade} onChangeText={setEditGrade} numeric />
            <EditField label="반" value={editClassNo} onChangeText={setEditClassNo} numeric />
            <EditField label="학번" value={editSchoolNumber} onChangeText={setEditSchoolNumber} numeric />
          </>
        ) : (
          <>
            <InfoRow label="아이디" value={student.username} />
            <InfoRow label="학년" value={`${student.grade}학년`} />
            <InfoRow label="반" value={`${student.classNo}반`} />
            <InfoRow label="학번" value={student.schoolNumber.toString()} />
          </>
        )}
      </View>

      {/* 버튼들 */}
      {isEditing ? (
        <>
          <TouchableOpacity
            style={CommonStyles.editButton}
            onPress={handleSaveEdit}
            disabled={isSaving}
          >
            <Text style={CommonStyles.editButtonText}>{isSaving ? '저장 중...' : '저장하기'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[CommonStyles.editButton, { marginTop: 10, opacity: 0.6 }]}
            onPress={() => setIsEditing(false)}
            disabled={isSaving}
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
      </ScrollView>

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

function EditField({
  label,
  value,
  onChangeText,
  numeric = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  numeric?: boolean;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={CommonStyles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={CommonStyles.input}
        keyboardType={numeric ? 'number-pad' : 'default'}
      />
    </View>
  );
}
