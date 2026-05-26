import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { CommonStyles } from './styles';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [classNo, setClassNo] = useState('');

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
      />

      {/* 아이디 */}
      <InputLabel label="아이디" />
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="아이디를 입력하세요"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
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
      />

      {/* 학년 */}
      <InputLabel label="학년" />
      <TextInput
        value={grade}
        onChangeText={setGrade}
        placeholder="예: 1학년"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
      />

      {/* 반 */}
      <InputLabel label="반" />
      <TextInput
        value={classNo}
        onChangeText={setClassNo}
        placeholder="예: 3반"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
      />

      {/* 가입 버튼 */}
      <TouchableOpacity
        onPress={() => router.push('/login')}
        style={[CommonStyles.primaryButton, { marginTop: 20, marginBottom: 20 }]}
      >
        <Text style={CommonStyles.primaryButtonText}>가입하기</Text>
      </TouchableOpacity>

      {/* 로그인 이동 */}
      <TouchableOpacity onPress={() => router.push('/login')}>
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