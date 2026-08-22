import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getErrorMessage } from '../services/api';
import { personalTimetableService } from '../services/personalTimetables';

const COLORS = ['#E0E7FF', '#DBEAFE', '#D1FAE5', '#FEF3C7', '#FCE7F3', '#EDE9FE', '#FED7AA', '#E5E7EB'];

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default function ScheduleEntryScreen() {
  const params = useLocalSearchParams<{
    day?: string;
    period?: string;
    subjectName?: string;
    className?: string;
    color?: string;
  }>();
  const day = first(params.day) || '';
  const period = Number(first(params.period));
  const initialSubject = first(params.subjectName) || '';
  const [subjectName, setSubjectName] = useState(initialSubject);
  const [className, setClassName] = useState(first(params.className) || '');
  const [color, setColor] = useState(first(params.color) || COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = useMemo(() => initialSubject.length > 0, [initialSubject]);
  const isValidSlot = ['월', '화', '수', '목', '금'].includes(day) && period >= 1 && period <= 7;

  const save = async () => {
    const trimmedSubject = subjectName.trim();
    const trimmedClass = className.trim();
    if (!trimmedSubject || !trimmedClass) {
      setError('과목명과 반을 모두 입력해 주세요.');
      return;
    }
    if (!isValidSlot) {
      setError('시간표 칸 정보가 올바르지 않습니다.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await personalTimetableService.save({ day, period, subjectName: trimmedSubject, className: trimmedClass, color });
      router.back();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      setSaving(false);
    }
  };

  const remove = () => {
    Alert.alert('과목 삭제', '이 시간표 칸을 비울까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          setError('');
          try {
            await personalTimetableService.remove(day, period);
            router.back();
          } catch (removeError) {
            setError(getErrorMessage(removeError));
            setSaving(false);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹ 시간표</Text>
          </TouchableOpacity>
          <Text style={styles.slot}>{day}요일 {period}교시</Text>
        </View>

        <Text style={styles.title}>{isEditing ? '과목 수정' : '새 과목 입력'}</Text>
        <Text style={styles.description}>이 칸에 표시할 과목 정보를 입력해 주세요.</Text>

        <Text style={styles.label}>과목명</Text>
        <TextInput
          autoFocus={!isEditing}
          value={subjectName}
          onChangeText={setSubjectName}
          placeholder="예: 미적분"
          maxLength={80}
          returnKeyType="next"
          style={styles.input}
        />

        <Text style={styles.label}>반</Text>
        <TextInput
          value={className}
          onChangeText={setClassName}
          placeholder="예: 수학 A반, 2-3반"
          maxLength={50}
          returnKeyType="done"
          style={styles.input}
        />

        <Text style={styles.label}>색상</Text>
        <View style={styles.palette}>
          {COLORS.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="radio"
              accessibilityState={{ checked: color === item }}
              accessibilityLabel={`색상 ${item}`}
              onPress={() => setColor(item)}
              style={[styles.colorOuter, color === item && styles.colorSelected]}
            >
              <View style={[styles.colorCircle, { backgroundColor: item }]} />
            </Pressable>
          ))}
        </View>

        <View style={[styles.preview, { backgroundColor: color }]}>
          <Text style={styles.previewSubject}>{subjectName.trim() || '과목명'}</Text>
          <Text style={styles.previewClass}>{className.trim() || '반'}</Text>
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <TouchableOpacity disabled={saving} onPress={() => void save()} style={[styles.saveButton, saving && styles.disabled]}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>저장</Text>}
        </TouchableOpacity>
        {isEditing ? (
          <TouchableOpacity disabled={saving} onPress={remove} style={styles.deleteButton}>
            <Text style={styles.deleteText}>이 칸 비우기</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FB' },
  content: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 36 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 },
  backButton: { paddingVertical: 8, paddingRight: 12 },
  backText: { color: '#4F46E5', fontSize: 16, fontWeight: '700' },
  slot: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  title: { color: '#111827', fontSize: 30, fontWeight: '800' },
  description: { marginTop: 8, marginBottom: 30, color: '#6B7280', fontSize: 14 },
  label: { marginBottom: 8, color: '#374151', fontSize: 14, fontWeight: '700' },
  input: { marginBottom: 22, paddingHorizontal: 16, paddingVertical: 15, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 13, backgroundColor: '#FFFFFF', color: '#111827', fontSize: 16 },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  colorOuter: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent', borderRadius: 21 },
  colorSelected: { borderColor: '#111827' },
  colorCircle: { width: 32, height: 32, borderWidth: 1, borderColor: 'rgba(17,24,39,0.1)', borderRadius: 16 },
  preview: { minHeight: 92, alignItems: 'center', justifyContent: 'center', marginBottom: 18, padding: 14, borderRadius: 16 },
  previewSubject: { color: '#111827', fontSize: 17, fontWeight: '800' },
  previewClass: { marginTop: 6, color: '#374151', fontSize: 13 },
  error: { marginBottom: 12, color: '#B91C1C', textAlign: 'center' },
  saveButton: { minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#111827' },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.55 },
  deleteButton: { alignItems: 'center', marginTop: 12, paddingVertical: 14 },
  deleteText: { color: '#DC2626', fontSize: 14, fontWeight: '700' },
});
