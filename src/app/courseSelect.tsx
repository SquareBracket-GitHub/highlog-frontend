import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';

import BottomNav from '../components/BottomNav';
import { CommonStyles } from './styles';
import { getCourses, createEnrolment } from '../services/apiClient';
import { getStudentId } from '../utils/auth';

interface Course {
  id: number;
  title: string;
  classroom: string;
  days: Array<{ day: string; period: number }>;
}

export default function CourseSelectScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data || []);
    } catch (err: any) {
      const message = err?.data?.message || '과목 목록을 불러올 수 없습니다.';
      Alert.alert('오류', message);
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
    if (selectedCourses.length === 0) {
      Alert.alert('알림', '최소 1개 이상의 과목을 선택하세요.');
      return;
    }

    setSaving(true);
    try {
      const studentId = await getStudentId();
      if (!studentId) {
        Alert.alert('오류', '로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      // 선택한 모든 과목에 대해 수강신청
      for (const courseId of selectedCourses) {
        await createEnrolment({
          student_id: studentId,
          course_id: courseId,
        });
      }

      Alert.alert('성공', '과목 선택이 저장되었습니다.');
      router.push('/schedules');
    } catch (err: any) {
      const message = err?.data?.message || '과목 선택 저장에 실패했습니다.';
      Alert.alert('오류', message);
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
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10 }}>과목 목록을 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 24,
          }}
        >
          {courses.map((course) => {
            const selected = selectedCourses.includes(course.id);

            return (
              <TouchableOpacity
                key={course.id}
                onPress={() => toggleCourse(course.id)}
                style={[
                  selected
                    ? CommonStyles.courseItemSelected
                    : CommonStyles.courseItemUnselected,
                ]}
              >
                <View>
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
                    {course.classroom}
                  </Text>
                </View>

                <Text
                  style={[
                    CommonStyles.courseSubtext,
                    selected
                      ? CommonStyles.courseSubtextSelected
                      : CommonStyles.courseSubtextUnselected,
                  ]}
                >
                  {selected ? '✓' : '탭하여 선택'}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* 저장 버튼 */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[CommonStyles.saveButton, saving && { opacity: 0.6 }]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={CommonStyles.saveButtonText}>저장하기</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* 하단 네비 */}
      <BottomNav active="course" />
    </View>
  );
}