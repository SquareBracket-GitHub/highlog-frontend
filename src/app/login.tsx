import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';

import { CommonStyles } from './styles';
import { loginStudent } from '../services/apiClient';
import { saveStudentInfo } from '../utils/auth';

export default function LoginScreen() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginId || !password) {
      Alert.alert('입력 오류', '아이디와 비밀번호를 입력하세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginStudent(loginId, password);
      const student = res.data;

      // 학생 정보 저장
      await saveStudentInfo({
        id: student.id,
        username: student.username,
        login_id: student.login_id,
        grade: student.grade,
        class_no: student.class_no,
        school_number: student.school_number,
      });

      Alert.alert('로그인 성공', '로그인되었습니다.');
      router.push('/schedules');
    } catch (err: any) {
      const message = err?.data?.message || '로그인에 실패했습니다.';
      Alert.alert('로그인 실패', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={CommonStyles.loginMainContainer}>
      {/* 로고 */}
      <View style={CommonStyles.logoContainer}>
        <Text style={CommonStyles.logo}>HIGHLOG</Text>
        <Text style={CommonStyles.logoSubtitle}>로그인</Text>
      </View>

      {/* 아이디 */}
      <View style={CommonStyles.inputSection}>
        <Text style={CommonStyles.inputLabel}>아이디</Text>
        <TextInput
          value={loginId}
          onChangeText={setLoginId}
          placeholder="아이디를 입력하세요"
          placeholderTextColor="#AAA"
          style={CommonStyles.input}
        />
      </View>

      {/* 비밀번호 */}
      <View style={CommonStyles.inputSectionLarge}>
        <Text style={CommonStyles.inputLabel}>비밀번호</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="비밀번호를 입력하세요"
          placeholderTextColor="#AAA"
          style={CommonStyles.input}
        />
      </View>

      {/* 로그인 버튼 */}
      <TouchableOpacity
        onPress={handleLogin}
        style={CommonStyles.primaryButton}
      >
        <Text style={CommonStyles.primaryButtonText}>로그인</Text>
      </TouchableOpacity>

      {/* 회원가입 */}
      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={CommonStyles.secondaryText}>회원가입</Text>
      </TouchableOpacity>

      {/* 하단 */}
      <View style={[CommonStyles.centerAlign, { marginTop: 40 }]}>
        <Text style={CommonStyles.helpText}>아이디 / 비밀번호 찾기</Text>
      </View>
    </View>
  );
}