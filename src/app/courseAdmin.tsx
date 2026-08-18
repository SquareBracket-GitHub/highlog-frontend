import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { courseService, type Course } from '../services';
import { getErrorMessage } from '../services/api';
import { CommonStyles } from '../styles';

export default function CourseAdminScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setCourses(await courseService.getMine()); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const remove = async (course: Course) => {
    try {
      const impact = await courseService.getImpact(course.id);
      Alert.alert(
        '과목 삭제',
        `${course.title}을(를) 삭제하면 수강 학생 ${impact.enrolledStudents}명과 시간표 슬롯 ${impact.timetableSlots}개에 반영됩니다. 계속할까요?`,
        [
          { text: '취소', style: 'cancel' },
          { text: '삭제', style: 'destructive', onPress: async () => {
            try { await courseService.delete(course.id); await load(); }
            catch (e) { Alert.alert('삭제 실패', getErrorMessage(e)); }
          } },
        ]
      );
    } catch (e) { Alert.alert('영향도 확인 실패', getErrorMessage(e)); }
  };

  return (
    <View style={CommonStyles.container}>
      <View style={CommonStyles.headerSection}>
        <Text style={CommonStyles.title}>내 과목 관리</Text>
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          <TouchableOpacity onPress={() => router.push('/courseManage')}><Text style={link}>+ 과목 추가</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/courseImport')}><Text style={[link, { marginLeft: 20 }]}>CSV 등록</Text></TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 30 }}>
        {loading ? <ActivityIndicator size="large" /> : null}
        {error ? <Text style={{ color: '#B91C1C', textAlign: 'center' }}>{error}</Text> : null}
        {!loading && !error && courses.length === 0 ? <Text style={{ color: '#777', textAlign: 'center' }}>직접 추가한 과목이 없습니다.</Text> : null}
        {courses.map((course) => (
          <View key={course.id} style={CommonStyles.courseItemUnselected}>
            <Text style={CommonStyles.courseText}>{course.title}</Text>
            <Text style={CommonStyles.courseSubtext}>{course.grade}학년 · {course.classNo ? `${course.classNo}반` : '학년 공통'} · {course.classroom}</Text>
            <Text style={{ color: '#777', marginTop: 6 }}>{course.days.map((item) => `${item.day} ${item.period}교시`).join(', ')}</Text>
            <View style={{ flexDirection: 'row', marginTop: 14 }}>
              <TouchableOpacity onPress={() => router.push({ pathname: '/courseManage', params: { id: String(course.id) } })}><Text style={link}>수정</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => void remove(course)}><Text style={{ color: '#DC2626', fontWeight: '700', marginLeft: 20 }}>삭제</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const link = { color: '#4F46E5', fontWeight: '700' as const };
