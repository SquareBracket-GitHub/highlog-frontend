import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { studentService } from '../services';
import { setCurrentStudent } from '../store/auth';
import { CommonStyles } from '../styles';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [classNo, setClassNo] = useState('');
  const [schoolNumber, setSchoolNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !name.trim() ||
      !loginId.trim() ||
      !password.trim() ||
      !grade.trim() ||
      !classNo.trim() ||
      !schoolNumber.trim()
    ) {
      Alert.alert('오류', '모든 필드를 입력하세요');
      return;
    }

    if (password.length < 8) {
      Alert.alert('오류', '비밀번호는 8자 이상이어야 합니다');
      return;
    }

    setIsLoading(true);
    try {
      const gradeNum = parseInt(grade, 10);
      const classNoNum = parseInt(classNo, 10);
      const schoolNumberNum = parseInt(schoolNumber, 10);

      const session = await studentService.create({
        username: name,
        loginId,
        password,
        grade: gradeNum,
        classNo: classNoNum,
        schoolNumber: schoolNumberNum,
      });

      Alert.alert('성공', '회원가입이 완료되었습니다');
      setCurrentStudent(session.student, session.token);
      router.replace('/schedules');
    } catch {
      Alert.alert('오류', '회원가입 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={CommonStyles.scrollContainer}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingVertical: 60,
      }}
    >
      {/* 제목 */}
      <View style={CommonStyles.registerTitleContainer}>
        <Text style={CommonStyles.registerTitle}>회원가입</Text>
      </View>

      {/* 이름 */}
      <InputLabel label="이름" />
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="이름을 입력하세요"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
        editable={!isLoading}
      />

      {/* 아이디 */}
      <InputLabel label="아이디" />
      <TextInput
        value={loginId}
        onChangeText={setLoginId}
        placeholder="아이디를 입력하세요"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
        editable={!isLoading}
      />

      {/* 비밀번호 */}
      <InputLabel label="비밀번호" />
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="비밀번호를 입력하세요"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
        editable={!isLoading}
      />

      {/* 학년 */}
      <InputLabel label="학년" />
      <TextInput
        value={grade}
        onChangeText={setGrade}
        placeholder="예: 1"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
        keyboardType="numeric"
        editable={!isLoading}
      />

      {/* 반 */}
      <InputLabel label="반" />
      <TextInput
        value={classNo}
        onChangeText={setClassNo}
        placeholder="예: 3"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
        keyboardType="numeric"
        editable={!isLoading}
      />

      {/* 학번 */}
      <InputLabel label="학번" />
      <TextInput
        value={schoolNumber}
        onChangeText={setSchoolNumber}
        placeholder="예: 1"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
        keyboardType="numeric"
        editable={!isLoading}
      />

      {/* 가입 버튼 */}
      <TouchableOpacity
        onPress={handleRegister}
        style={[CommonStyles.primaryButton, { marginTop: 20, marginBottom: 20 }]}
        disabled={isLoading}
      >
        <Text style={CommonStyles.primaryButtonText}>
          {isLoading ? '가입 중...' : '가입하기'}
        </Text>
      </TouchableOpacity>

      {/* 로그인 이동 */}
      <TouchableOpacity onPress={() => router.push('/login')} disabled={isLoading}>
        <Text style={CommonStyles.secondaryText}>이미 계정이 있으신가요?</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* 헬퍼 컴포넌트 */
function InputLabel({ label }: { label: string }) {
  return (
    <Text
      style={{
        marginBottom: 8,
        marginLeft: 4,
        fontSize: 13,
        color: '#444',
      }}
    >
      {label}
    </Text>
  );
}
