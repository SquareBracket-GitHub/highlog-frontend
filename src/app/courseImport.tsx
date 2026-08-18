import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { courseService, type CreateCourseInput } from '../services';
import { getErrorMessage } from '../services/api';
import { CommonStyles } from '../styles';

type PreviewRow = { line: number; data?: CreateCourseInput; error?: string };
const HEADER = '과목명,학년,반,태그,수업장소,일정,색상,반전체공통';
const DAYS = new Set(['월요일', '화요일', '수요일', '목요일', '금요일']);

function parseCsv(value: string): PreviewRow[] {
  return value.trim().split(/\r?\n/).slice(1).filter(Boolean).map((line, index) => {
    const columns = line.split(',').map((item) => item.trim());
    if (columns.length !== 8) return { line: index + 2, error: '열이 8개가 아닙니다.' };
    const [title, gradeText, classText, tagText, classroom, scheduleText, color, wideText] = columns;
    const isClassWide = ['true', '1', '예', 'Y'].includes(wideText);
    const grade = Number(gradeText); const classNo = classText ? Number(classText) : null;
    const schedules = scheduleText.split('|').map((item) => {
      const [day, period] = item.split(':'); return { day, period: Number(period) };
    });
    if (!title || !classroom || !Number.isInteger(grade) || !/^#[0-9A-Fa-f]{6}$/.test(color)) return { line: index + 2, error: '필수값 또는 색상 형식이 잘못됐습니다.' };
    if (isClassWide && (!classNo || tagText)) return { line: index + 2, error: '반 공통 과목은 반이 필요하고 태그는 비워야 합니다.' };
    if (!isClassWide && (!tagText || classNo !== null)) return { line: index + 2, error: '선택과목은 태그가 필요하고 반은 비워야 합니다.' };
    if (!schedules.length || schedules.some((item) => !DAYS.has(item.day) || !Number.isInteger(item.period) || item.period < 1 || item.period > 7)) {
      return { line: index + 2, error: '일정은 월~금요일:1~7교시 형식이어야 합니다.' };
    }
    return { line: index + 2, data: { title, grade, classNo, tag: tagText || null, classroom, schedules, color, isClassWide } };
  });
}

export default function CourseImportScreen() {
  const [csv, setCsv] = useState(`${HEADER}\n물리,2,,과학 선택,과학실,월요일:2|수요일:3,#BFDBFE,false`);
  const [importing, setImporting] = useState(false);
  const preview = useMemo(() => parseCsv(csv), [csv]);
  const valid = preview.filter((row) => row.data);

  const importRows = async () => {
    if (!valid.length || preview.some((row) => row.error)) return Alert.alert('CSV 확인', '오류 행을 먼저 수정하세요.');
    setImporting(true);
    let completed = 0;
    try {
      for (const row of valid) { await courseService.create(row.data!); completed += 1; }
      Alert.alert('등록 완료', `${completed}개 과목을 등록했습니다.`, [{ text: '확인', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('일부 등록 실패', `${completed}개 등록 후 중단됐습니다. ${getErrorMessage(error)}`);
    } finally { setImporting(false); }
  };

  return (
    <ScrollView style={CommonStyles.scrollContainer} contentContainerStyle={{ padding: 24, paddingTop: 60 }} automaticallyAdjustKeyboardInsets>
      <Text style={CommonStyles.title}>CSV 일괄 등록</Text>
      <Text style={{ color: '#666', marginVertical: 12 }}>첫 줄은 헤더입니다. 일정은 월요일:2|수요일:3 형식이며 교시는 1~7만 가능합니다.</Text>
      <TextInput value={csv} onChangeText={setCsv} multiline style={[CommonStyles.input, { minHeight: 180, textAlignVertical: 'top' }]} />
      <Text style={{ fontWeight: '700', marginTop: 24, marginBottom: 10 }}>미리보기 ({valid.length}개)</Text>
      {preview.map((row) => (
        <View key={row.line} style={{ padding: 12, backgroundColor: row.error ? '#FEF2F2' : '#FFF', marginBottom: 8, borderRadius: 10 }}>
          <Text style={{ color: row.error ? '#B91C1C' : '#111' }}>{row.line}행 · {row.error || `${row.data!.title} / ${row.data!.grade}학년 / ${row.data!.schedules.length}개 일정`}</Text>
        </View>
      ))}
      <TouchableOpacity style={CommonStyles.primaryButton} disabled={importing} onPress={() => void importRows()}>
        <Text style={CommonStyles.primaryButtonText}>{importing ? '등록 중...' : '검증된 과목 일괄 등록'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
