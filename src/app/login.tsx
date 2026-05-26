import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { CommonStyles } from './styles';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
          value={username}
          onChangeText={setUsername}
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
        onPress={() => router.push('/schedules')}
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