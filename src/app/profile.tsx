import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { studentService } from '../services';
import { ApiError } from '../services/api';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

    const errors: Record<string, string> = {};
    if (!username) errors.username = '이름을 입력하세요.';
    else if (username.length > 10) errors.username = '이름은 10자 이하로 입력하세요.';
    if (!Number.isInteger(gradeNum) || gradeNum < 1) errors.grade = '학년은 1 이상의 정수여야 합니다.';
    if (!Number.isInteger(classNoNum) || classNoNum < 1) errors.classNo = '반은 1 이상의 정수여야 합니다.';
    if (!Number.isInteger(schoolNumberNum) || schoolNumberNum < 1) errors.schoolNumber = '학번은 1 이상의 정수여야 합니다.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
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
    } catch (error) {
      if (error instanceof ApiError && error.issues.length > 0) {
        const serverErrors: Record<string, string> = {};
        for (const issue of error.issues) {
          serverErrors[String(issue.path?.at(-1) || 'form')] = issue.message || '입력값을 확인하세요.';
        }
        setFieldErrors(serverErrors);
      } else if (error instanceof ApiError && error.code === 'DUPLICATE_STUDENT_NUMBER') {
        setFieldErrors({ schoolNumber: '같은 학년, 반, 학번으로 등록된 학생이 있습니다.' });
      } else {
        Alert.alert('오류', error instanceof Error ? error.message : '정보 수정 중 오류가 발생했습니다');
      }
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
            <EditField label="이름" value={editUsername} onChangeText={setEditUsername} error={fieldErrors.username} />
            <EditField label="학년" value={editGrade} onChangeText={setEditGrade} numeric error={fieldErrors.grade} />
            <EditField label="반" value={editClassNo} onChangeText={setEditClassNo} numeric error={fieldErrors.classNo} />
            <EditField label="학번" value={editSchoolNumber} onChangeText={setEditSchoolNumber} numeric error={fieldErrors.schoolNumber} />
            {fieldErrors.form ? <Text style={{ color: '#DC2626' }}>{fieldErrors.form}</Text> : null}
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
  error,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  numeric?: boolean;
  error?: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={CommonStyles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[CommonStyles.input, error ? { borderColor: '#DC2626' } : null]}
        keyboardType={numeric ? 'number-pad' : 'default'}
        accessibilityHint={error}
      />
      {error ? <Text style={{ color: '#DC2626', fontSize: 12, marginTop: 6 }}>{error}</Text> : null}
    </View>
  );
}
