import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { courseService, enrolmentService } from '../services';
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

  const loadCourses = async () => {
    setLoading(true);
    try {
      const allCourses = await courseService.getAll();
      setCourses(allCourses as CourseItem[]);

      // 현재 학생의 등록된 과목 조회
      const student = getCurrentStudent();
      if (student) {
        const enrolments = await enrolmentService.getByStudent(student.id);
        setSelectedCourses(enrolments.map((e) => e.course_id));
      }
    } catch (error) {
      Alert.alert('오류', '과목 목록을 불러올 수 없습니다');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId: number) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };

  const handleSave = async () => {
    const student = getCurrentStudent();
    if (!student) {
      Alert.alert('오류', '로그인 정보가 없습니다');
      return;
    }

    setSaving(true);
    try {
      // 기존 등록 조회
      const existingEnrolments = await enrolmentService.getByStudent(student.id);
      const existingCourseIds = existingEnrolments.map((e) => e.course_id);

      // 삭제할 과목 (기존에는 있지만 선택되지 않은 과목)
      const toDelete = existingCourseIds.filter((id) => !selectedCourses.includes(id));

      // 추가할 과목 (선택되었지만 기존에 없는 과목)
      const toAdd = selectedCourses.filter((id) => !existingCourseIds.includes(id));

      // 삭제 작업
      for (const courseId of toDelete) {
        await enrolmentService.delete(student.id, courseId);
      }

      // 추가 작업
      for (const courseId of toAdd) {
        await enrolmentService.create(student.id, courseId);
      }

      Alert.alert('성공', '과목 선택이 저장되었습니다');
    } catch (error) {
      Alert.alert('오류', '저장 중 오류가 발생했습니다');
      console.error(error);
    } finally {
      setSaving(false);
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
              const selected = selectedCourses.includes(course.id);

              return (
                <TouchableOpacity
                  key={course.id}
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