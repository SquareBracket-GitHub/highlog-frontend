import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { courseService, enrolmentService } from '../services';
import { ApiClient } from '../services/api';
import { getCurrentStudent } from '../store/auth';
import { CommonStyles } from './styles';

interface CourseItem {
  id: number;
  title: string;
  classroom: string;
}

export default function CourseSelectScreen() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [])
  );

  const normalizeCourseIds = (enrolments: { course_id: number | string }[]) => {
    const ids: number[] = [];
    for (const e of enrolments) {
      const num = Number(e.course_id);
      if (Number.isInteger(num) && num > 0) {
        ids.push(num);
      }
    }
    return Array.from(new Set(ids));
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const allCourses = await courseService.getAll();
      console.log('loadCourses - allCourses:', allCourses);
      
      // courses 배열의 id를 number로 정규화
      const normalizedCourses = (allCourses as CourseItem[]).map(c => ({
        ...c,
        id: Number(c.id)
      }));
      console.log('loadCourses - normalizedCourses:', normalizedCourses);
      setCourses(normalizedCourses);

      // 현재 학생의 등록된 과목 조회
      const student = getCurrentStudent();
      if (student) {
        const enrolments = await enrolmentService.getByStudent(student.id);
        console.log('loadCourses - enrolments from API:', enrolments);
        const normalized = normalizeCourseIds(enrolments);
        console.log('loadCourses - normalized:', normalized);
        setSelectedCourses(normalized);
      }
    } catch (error) {
      Alert.alert('오류', '과목 목록을 불러올 수 없습니다');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId: number) => {
    const id = Number(courseId);
    console.log('toggleCourse called with:', id, typeof id);
    
    setSelectedCourses((prev) => {
      const newSelected = prev.indexOf(id) !== -1
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      console.log('toggleCourse - prev:', prev, '-> new:', newSelected);
      return newSelected;
    });
  };

  const handleSave = async () => {
    const student = getCurrentStudent();
    if (!student) {
      Alert.alert('오류', '로그인 정보가 없습니다');
      return;
    }

    setSaving(true);
    try {
      console.log('=== handleSave START ===');
      console.log('selectedCourses from state:', selectedCourses);
      console.log('courses from state:', courses);
      
      const existingEnrolments = await enrolmentService.getByStudent(student.id);
      console.log('existingEnrolments:', existingEnrolments);
      
      const existingCourseIds = normalizeCourseIds(existingEnrolments);
      console.log('existingCourseIds:', existingCourseIds);

      const toDelete = existingCourseIds.filter((id) => selectedCourses.indexOf(id) === -1);
      console.log('toDelete:', toDelete, 'count:', toDelete.length);

      // toAdd 계산 과정을 상세히 로깅
      console.log('Calculating toAdd:');
      console.log('  selectedCourses:', selectedCourses);
      console.log('  existingCourseIds:', existingCourseIds);
      
      const toAdd = selectedCourses.filter((id) => {
        const isInExisting = existingCourseIds.indexOf(id) !== -1;
        console.log(`    checking id=${id}: in existing? ${isInExisting}`);
        return !isInExisting;
      });
      
      console.log('toAdd result:', toAdd, 'count:', toAdd.length);

      for (const courseId of toDelete) {
        console.log('DELETE enrolment:', courseId);
        await enrolmentService.delete(student.id, courseId);
      }
      console.log(
        'existingCourseIds type:',
        existingCourseIds.constructor?.name
      );

      console.log(
        'selectedCourses type:',
        selectedCourses.constructor?.name
      );
      if (toAdd.length > 0) {
        console.log('Starting CREATE loop with', toAdd.length, 'items');
        for (const courseId of toAdd) {
          console.log('CREATE enrolment:', courseId, typeof courseId);
          if (typeof enrolmentService.create === 'function') {
            await enrolmentService.create(student.id, courseId);
          } else {
            console.warn('enrolmentService.create is not a function, using ApiClient.post fallback');
            await ApiClient.post('/enrolments', {
              student_id: student.id,
              course_id: courseId,
            });
          }
        }
      } else {
        console.warn('toAdd is empty - no create operations');
      }

      Alert.alert('성공', '과목 선택이 저장되었습니다');
      loadCourses();
    } catch (error) {
      Alert.alert('오류', '저장 중 오류가 발생했습니다');
      console.error('handleSave error:', error);
    } finally {
      setSaving(false);
      console.log('=== handleSave END ===');
    }
  };

  return (
    <View style={CommonStyles.container}>
      {/* 상단 */}
      <View style={CommonStyles.headerSection}>
        <Text style={CommonStyles.title}>선택 과목</Text>
        <Text style={CommonStyles.subtitle}>원하는 과목을 선택하세요</Text>
      </View>

      {/* 과목 리스트 */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
      >
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            과목 목록을 불러오는 중...
          </Text>
        ) : (
          <>
            {courses.map((course) => {
              const selected = selectedCourses.indexOf(course.id) !== -1;

              return (
                <TouchableOpacity
                  key={String(course.id)}
                  onPress={() => toggleCourse(course.id)}
                  disabled={saving}
                  style={[
                    selected
                      ? CommonStyles.courseItemSelected
                      : CommonStyles.courseItemUnselected,
                  ]}
                >
                  <Text
                    style={[
                      CommonStyles.courseText,
                      selected
                        ? CommonStyles.courseTextSelected
                        : CommonStyles.courseTextUnselected,
                    ]}
                  >
                    {course.title}
                  </Text>

                  <Text
                    style={[
                      CommonStyles.courseSubtext,
                      selected
                        ? CommonStyles.courseSubtextSelected
                        : CommonStyles.courseSubtextUnselected,
                    ]}
                  >
                    {course.classroom} • {selected ? '선택됨' : '탭하여 선택'}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* 저장 버튼 */}
            <TouchableOpacity
              style={CommonStyles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={CommonStyles.saveButtonText}>
                {saving ? '저장 중...' : '저장하기'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* 하단 네비 */}
      <BottomNav active="course" />
    </View>
  );
}