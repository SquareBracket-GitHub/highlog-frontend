import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { setCurrentStudent } from '../store/auth';
import { studentService } from '../services';
import { CommonStyles } from './styles';

export default function LoginScreen() {
  // const [username, setUsername] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginId.trim() || !password.trim()) {
      Alert.alert('오류', '아이디와 비밀번호를 입력하세요');
      return;
    }

    setLoading(true);
    try {
      const students = await studentService.getAll();
      const student = students.find((s) => s.login_id === loginId);

      if (!student) {
        Alert.alert('오류', '존재하지 않는 아이디입니다');
        return;
      }

      // 실제 암호화된 비밀번호 검증은 백엔드에서 처리하고,
      // 여기서는 임시로 사용자를 저장
      setCurrentStudent(student);
      router.push('/schedules');
    } catch (error) {
      Alert.alert('오류', '로그인 중 오류가 발생했습니다');
      console.error(error);
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
          editable={!loading}
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
          editable={!loading}
        />
      </View>

      {/* 로그인 버튼 */}
      <TouchableOpacity
        onPress={handleLogin}
        style={CommonStyles.primaryButton}
        disabled={loading}
      >
        <Text style={CommonStyles.primaryButtonText}>
          {loading ? '로그인 중...' : '로그인'}
        </Text>
      </TouchableOpacity>

      {/* 회원가입 */}
      <TouchableOpacity onPress={() => router.push('/register')} disabled={loading}>
        <Text style={CommonStyles.secondaryText}>회원가입</Text>
      </TouchableOpacity>

      {/* 하단 */}
      <View style={[CommonStyles.centerAlign, { marginTop: 40 }]}>
        <Text style={CommonStyles.helpText}>아이디 / 비밀번호 찾기</Text>
      </View>
    </View>
  );
}