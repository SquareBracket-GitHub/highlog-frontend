import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { courseService } from '../services';
import { getCurrentStudent } from '../store/auth';
import { CommonStyles } from '../styles';

const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일'];
const PERIODS = Array.from({ length: 12 }, (_, index) => index + 1);
const COLORS = ['#BBF7D0', '#BFDBFE', '#FDE68A', '#FCD34D', '#E9D5FF', '#FBCFE8'];

export default function CourseManageScreen() {
  const student = getCurrentStudent();
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState(student?.grade.toString() || '');
  const [classNo, setClassNo] = useState(student?.classNo.toString() || '');
  const [tag, setTag] = useState('');
  const [classroom, setClassroom] = useState('');
  const [day, setDay] = useState(DAYS[0]);
  const [period, setPeriod] = useState(1);
  const [color, setColor] = useState(COLORS[0]);
  const [isClassWide, setIsClassWide] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!student?.canManageCourses) {
    return (
      <View style={[CommonStyles.container, { padding: 24, justifyContent: 'center' }]}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>과목 관리 권한이 없습니다.</Text>
        <TouchableOpacity style={CommonStyles.primaryButton} onPress={() => router.back()}>
          <Text style={CommonStyles.primaryButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    const gradeNumber = Number(grade);
    const classNumber = Number(classNo);
    if (!title.trim() || !classroom.trim() || !Number.isInteger(gradeNumber) || !Number.isInteger(classNumber)) {
      Alert.alert('입력 확인', '과목명, 학년, 반, 수업 장소를 모두 입력하세요.');
      return;
    }
    if (!isClassWide && !tag.trim()) {
      Alert.alert('입력 확인', '선택 과목에는 태그가 필요합니다.');
      return;
    }

    setIsSaving(true);
    try {
      await courseService.create({
        title: title.trim(),
        grade: gradeNumber,
        classNo: classNumber,
        tag: isClassWide ? null : tag.trim(),
        classroom: classroom.trim(),
        day,
        period,
        color,
        isClassWide,
      });
      Alert.alert('완료', isClassWide
        ? '반 전체 학생에게 공통 과목이 등록되었습니다.'
        : '선택 과목이 추가되었습니다.');
      router.back();
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '과목을 추가하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      style={CommonStyles.scrollContainer}
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[CommonStyles.title, { marginBottom: 28 }]}>과목 추가</Text>
      <Field label="과목명" value={title} onChangeText={setTitle} placeholder="예: 물리학" />
      <Field label="학년" value={grade} onChangeText={setGrade} numeric />
      <Field label="반" value={classNo} onChangeText={setClassNo} numeric />
      <Field label="수업 장소" value={classroom} onChangeText={setClassroom} placeholder="예: 과학실" />

      <View style={rowStyle}>
        <View style={{ flex: 1 }}>
          <Text style={CommonStyles.inputLabel}>반 전체 공통</Text>
          <Text style={{ color: '#777', fontSize: 12 }}>학생 선택 없이 전원 자동 등록</Text>
        </View>
        <Switch value={isClassWide} onValueChange={setIsClassWide} />
      </View>

      {!isClassWide ? (
        <Field label="선택 그룹 태그" value={tag} onChangeText={setTag} placeholder="예: 과학 선택" />
      ) : null}

      <OptionGroup label="요일" options={DAYS} selected={day} onSelect={setDay} />
      <OptionGroup
        label="교시"
        options={PERIODS.map(String)}
        selected={String(period)}
        onSelect={(value) => setPeriod(Number(value))}
      />

      <Text style={CommonStyles.inputLabel}>시간표 색상</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 28 }}>
        {COLORS.map((item) => (
          <TouchableOpacity
            key={item}
            accessibilityLabel={`색상 ${item}`}
            onPress={() => setColor(item)}
            style={{
              width: 42, height: 42, borderRadius: 21, marginRight: 12, marginTop: 8,
              backgroundColor: item, borderWidth: color === item ? 3 : 1,
              borderColor: color === item ? '#111' : '#DDD',
            }}
          />
        ))}
      </View>

      <TouchableOpacity style={CommonStyles.primaryButton} onPress={handleSave} disabled={isSaving}>
        <Text style={CommonStyles.primaryButtonText}>{isSaving ? '저장 중...' : '과목 저장'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} disabled={isSaving}>
        <Text style={CommonStyles.secondaryText}>취소</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const rowStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  paddingVertical: 8,
  marginBottom: 20,
};

function Field({ label, value, onChangeText, placeholder, numeric = false }: {
  label: string; value: string; onChangeText: (value: string) => void;
  placeholder?: string; numeric?: boolean;
}) {
  return (
    <View>
      <Text style={CommonStyles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#AAA"
        keyboardType={numeric ? 'number-pad' : 'default'}
        style={CommonStyles.inputWithMargin}
      />
    </View>
  );
}

function OptionGroup({ label, options, selected, onSelect }: {
  label: string; options: string[]; selected: string; onSelect: (value: string) => void;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={CommonStyles.inputLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            style={{
              paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
              marginRight: 8, marginTop: 8,
              backgroundColor: selected === option ? '#4F46E5' : '#FFF',
              borderWidth: 1, borderColor: selected === option ? '#4F46E5' : '#E5E7EB',
            }}
          >
            <Text style={{ color: selected === option ? '#FFF' : '#333' }}>{option}{label === '교시' ? '교시' : ''}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
