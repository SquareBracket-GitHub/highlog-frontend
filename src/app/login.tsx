import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { setCurrentStudent } from '../store/auth';
import type { Student } from '../services';
import { ApiClient } from '../services/api';
import { CommonStyles } from '../styles';
import { getErrorMessage } from '../services/api';

export default function LoginScreen() {
  // const [username, setUsername] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const passwordRef = useRef<TextInput>(null);

  const handleFindAccount = () => {
    Alert.alert(
      '아이디 / 비밀번호 찾기',
      '현재 지원되지 않는 기능입니다. 자세한 문의는 @t.xyun_으로 부탁드립니다.'
    );
  };

  const handleLogin = async () => {
    if (!loginId.trim() || !password.trim()) {
      Alert.alert('오류', '아이디와 비밀번호를 입력하세요');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const session = await ApiClient.post<{ student: Student; token: string }>(
        '/auth/login',
        { loginId: loginId.trim(), password }
      );
      setCurrentStudent(session.student, session.token);
      router.replace('/schedules');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView
      contentContainerStyle={[CommonStyles.loginMainContainer, { flexGrow: 1 }]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
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
          editable={!isLoading}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
      </View>

      {/* 비밀번호 */}
      <View style={CommonStyles.inputSectionLarge}>
        <Text style={CommonStyles.inputLabel}>비밀번호</Text>
        <TextInput
          ref={passwordRef}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="비밀번호를 입력하세요"
          placeholderTextColor="#AAA"
          style={CommonStyles.input}
          editable={!isLoading}
          returnKeyType="done"
          onSubmitEditing={() => void handleLogin()}
        />
      </View>

      {/* 로그인 버튼 */}
      <TouchableOpacity
        onPress={handleLogin}
        style={CommonStyles.primaryButton}
        disabled={isLoading}
      >
        <Text style={CommonStyles.primaryButtonText}>
          {isLoading ? '로그인 중...' : '로그인'}
        </Text>
      </TouchableOpacity>

      {/* 회원가입 */}
      <TouchableOpacity onPress={() => router.push('/register')} disabled={isLoading}>
        <Text style={CommonStyles.secondaryText}>회원가입</Text>
      </TouchableOpacity>

      {/* 하단 */}
      <TouchableOpacity
        style={[CommonStyles.centerAlign, { marginTop: 40 }]}
        onPress={handleFindAccount}
        disabled={isLoading}
        accessibilityRole="button"
      >
        <Text style={CommonStyles.helpText}>아이디 / 비밀번호 찾기</Text>
      </TouchableOpacity>
      {errorMessage ? <Text style={{ color: '#B91C1C', textAlign: 'center', marginBottom: 12 }}>{errorMessage}</Text> : null}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
