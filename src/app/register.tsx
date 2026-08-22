import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { studentService } from '../services';
import { ApiError } from '../services/api';
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
  const [agreements, setAgreements] = useState({
    serviceTerms: false,
    privacyPolicy: false,
    anonymousBoardNotice: false,
    ageOrGuardianConfirmed: false,
  });
  const loginIdRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const gradeRef = useRef<TextInput>(null);
  const classNoRef = useRef<TextInput>(null);
  const schoolNumberRef = useRef<TextInput>(null);

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
    if (!Object.values(agreements).every(Boolean)) {
      Alert.alert('필수 동의', '회원가입 필수 약관과 안내를 모두 확인하고 동의해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const gradeNum = parseInt(grade, 10);
      const classNoNum = parseInt(classNo, 10);
      const schoolNumberNum = parseInt(schoolNumber, 10);

      const session = await studentService.create({
        username: name.trim(),
        loginId: loginId.trim(),
        password,
        grade: gradeNum,
        classNo: classNoNum,
        schoolNumber: schoolNumberNum,
        agreements: {
          serviceTerms: true,
          privacyPolicy: true,
          anonymousBoardNotice: true,
          ageOrGuardianConfirmed: true,
        },
      });

      Alert.alert('성공', '회원가입이 완료되었습니다');
      setCurrentStudent(session.student, session.token);
      router.replace('/schedules');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'DUPLICATE_LOGIN_ID') {
        Alert.alert('가입 불가', '이미 사용 중인 아이디입니다');
      } else if (error instanceof ApiError && error.code === 'DUPLICATE_STUDENT_NUMBER') {
        Alert.alert('가입 불가', '같은 학년, 반, 학번으로 가입된 학생이 있습니다');
      } else {
        Alert.alert('오류', '회원가입 중 오류가 발생했습니다');
      }
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
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
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
        returnKeyType="next"
        onSubmitEditing={() => loginIdRef.current?.focus()}
      />

      {/* 아이디 */}
      <InputLabel label="아이디" />
      <TextInput
        ref={loginIdRef}
        value={loginId}
        onChangeText={setLoginId}
        placeholder="아이디를 입력하세요"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
        editable={!isLoading}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <View style={agreementStyles.box}>
        <Text style={agreementStyles.heading}>필수 약관 및 개인정보 안내</Text>
        <Text style={agreementStyles.summary}>
          익명게시판의 작성자 정보는 다른 학생에게 공개되지 않지만, 신고 처리와 안전한 운영을 위해 관리자에게는 확인될 수 있습니다.
        </Text>
        <AgreementRow
          checked={agreements.serviceTerms}
          onPress={() => setAgreements((value) => ({ ...value, serviceTerms: !value.serviceTerms }))}
          title="[필수] 서비스 이용약관 동의"
          detail="욕설, 괴롭힘, 개인정보 노출, 불법 정보 게시를 금지하며 위반 게시물은 운영자가 삭제할 수 있습니다."
        />
        <AgreementRow
          checked={agreements.privacyPolicy}
          onPress={() => setAgreements((value) => ({ ...value, privacyPolicy: !value.privacyPolicy }))}
          title="[필수] 개인정보 수집·이용 동의"
          detail="계정 운영과 게시판 신고 대응을 위해 회원 정보 및 게시글·댓글과 연결된 내부 작성자 ID를 회원 탈퇴 시까지 처리합니다. 동의를 거부할 수 있으나 가입할 수 없습니다."
        />
        <AgreementRow
          checked={agreements.anonymousBoardNotice}
          onPress={() => setAgreements((value) => ({ ...value, anonymousBoardNotice: !value.anonymousBoardNotice }))}
          title="[필수] 익명게시판 운영 안내 확인"
          detail="익명은 이용자 화면에만 적용됩니다. 권한이 있는 관리자는 정당한 운영 사유를 입력한 후 작성자를 확인할 수 있으며 조회 기록이 남습니다."
        />
        <AgreementRow
          checked={agreements.ageOrGuardianConfirmed}
          onPress={() => setAgreements((value) => ({ ...value, ageOrGuardianConfirmed: !value.ageOrGuardianConfirmed }))}
          title="[필수] 연령 및 보호자 확인"
          detail="만 14세 이상이거나, 만 14세 미만인 경우 법정대리인에게 가입과 개인정보 처리에 관한 동의를 받았음을 확인합니다."
        />
        <TouchableOpacity
          onPress={() => {
            const checked = !Object.values(agreements).every(Boolean);
            setAgreements({ serviceTerms: checked, privacyPolicy: checked, anonymousBoardNotice: checked, ageOrGuardianConfirmed: checked });
          }}
          style={agreementStyles.allButton}
        >
          <Text style={agreementStyles.allText}>필수 항목 전체 동의</Text>
        </TouchableOpacity>
      </View>

      {/* 비밀번호 */}
      <InputLabel label="비밀번호" />
      <TextInput
        ref={passwordRef}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="비밀번호를 입력하세요"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
        editable={!isLoading}
        returnKeyType="next"
        onSubmitEditing={() => gradeRef.current?.focus()}
      />

      {/* 학년 */}
      <InputLabel label="학년" />
      <TextInput
        ref={gradeRef}
        value={grade}
        onChangeText={setGrade}
        placeholder="예: 1"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
        keyboardType="numeric"
        editable={!isLoading}
        returnKeyType="next"
        onSubmitEditing={() => classNoRef.current?.focus()}
      />

      {/* 반 */}
      <InputLabel label="반" />
      <TextInput
        ref={classNoRef}
        value={classNo}
        onChangeText={setClassNo}
        placeholder="예: 3"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
        keyboardType="numeric"
        editable={!isLoading}
        returnKeyType="next"
        onSubmitEditing={() => schoolNumberRef.current?.focus()}
      />

      {/* 학번 */}
      <InputLabel label="학번" />
      <TextInput
        ref={schoolNumberRef}
        value={schoolNumber}
        onChangeText={setSchoolNumber}
        placeholder="예: 1"
        placeholderTextColor="#AAA"
        style={CommonStyles.inputWithMargin}
        keyboardType="numeric"
        editable={!isLoading}
        returnKeyType="done"
        onSubmitEditing={() => void handleRegister()}
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

function AgreementRow({ checked, onPress, title, detail }: { checked: boolean; onPress: () => void; title: string; detail: string }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={agreementStyles.row}>
      <View style={[agreementStyles.checkbox, checked && agreementStyles.checkboxChecked]}><Text style={agreementStyles.checkmark}>{checked ? '✓' : ''}</Text></View>
      <View style={agreementStyles.copy}><Text style={agreementStyles.title}>{title}</Text><Text style={agreementStyles.detail}>{detail}</Text></View>
    </Pressable>
  );
}

const agreementStyles = StyleSheet.create({
  box: { marginTop: 6, marginBottom: 10, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, backgroundColor: '#FFFFFF' },
  heading: { color: '#111827', fontSize: 16, fontWeight: '800' },
  summary: { marginTop: 8, marginBottom: 8, color: '#6B7280', fontSize: 12, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 11 },
  checkbox: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', marginTop: 1, marginRight: 10, borderWidth: 1, borderColor: '#9CA3AF', borderRadius: 6 },
  checkboxChecked: { borderColor: '#4F46E5', backgroundColor: '#4F46E5' },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  copy: { flex: 1 },
  title: { color: '#1F2937', fontSize: 13, fontWeight: '700' },
  detail: { marginTop: 4, color: '#6B7280', fontSize: 11, lineHeight: 17 },
  allButton: { alignItems: 'center', marginTop: 6, paddingVertical: 12, borderRadius: 10, backgroundColor: '#EEF2FF' },
  allText: { color: '#4338CA', fontSize: 13, fontWeight: '800' },
});
