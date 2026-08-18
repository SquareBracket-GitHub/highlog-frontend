import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { classTimetableService, courseService, enrolmentService } from '../services';
import { getCurrentStudent } from '../store/auth';
import { CommonStyles } from '../styles';
import { getErrorMessage } from '../services/api';

interface CourseItem {
  id: number;
  title: string;
  classroom: string;
  tag: string | null;
}

export default function CourseSelectScreen() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCourses, setSavedCourses] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedback, setFeedback] = useState('');

  const normalizeCourseIds = (enrolments: { courseId: number | string }[]) => {
    const ids: number[] = [];
    for (const enrolment of enrolments) {
      const courseId = Number(enrolment.courseId);
      if (Number.isInteger(courseId) && courseId > 0) {
        ids.push(courseId);
      }
    }
    return Array.from(new Set(ids));
  };

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [allCourses, slots] = await Promise.all([
        courseService.getAll(),
        classTimetableService.getMine(),
      ]);
      console.log('loadCourses - allCourses:', allCourses);

      const selectableTags = new Set(
        slots.flatMap((slot) => (slot.tag ? [slot.tag] : []))
      );

      // courses 배열의 id를 number로 정규화
      const normalizedCourses = (allCourses as CourseItem[])
        .filter((course) => course.tag !== null && selectableTags.has(course.tag))
        .map(c => ({
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
        const seenTags = new Set<string>();
        const selectedEnrolments = enrolments.filter((enrolment) => enrolment.source === 'selected');
        const normalized = normalizeCourseIds(selectedEnrolments).filter((courseId) => {
          const course = normalizedCourses.find((item) => item.id === courseId);
          if (!course?.tag || seenTags.has(course.tag)) return false;
          seenTags.add(course.tag);
          return true;
        });
        console.log('loadCourses - normalized:', normalized);
        setSelectedCourses(normalized);
        setSavedCourses(normalized);
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadCourses(); }, [loadCourses]));

  const isDirty = [...selectedCourses].sort().join(',') !== [...savedCourses].sort().join(',');
  const confirmNavigation = useCallback((navigate: () => void) => {
    if (!isDirty) return navigate();
    Alert.alert('저장하지 않은 변경사항', '변경사항을 버리고 이동하시겠습니까?', [
      { text: '계속 편집', style: 'cancel' },
      { text: '버리고 이동', style: 'destructive', onPress: navigate },
    ]);
  }, [isDirty]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isDirty) return false;
      confirmNavigation(() => router.back());
      return true;
    });
    return () => subscription.remove();
  }, [confirmNavigation, isDirty]);

  const toggleCourse = (courseId: number) => {
    const id = Number(courseId);

    const clickedCourse = courses.find((c) => c.id === id);
    if (!clickedCourse) return;

    setSelectedCourses((prev) => {
      const alreadySelected = prev.includes(id);

      // 이미 선택된 과목이면 해제
      if (alreadySelected) {
        return prev.filter((x) => x !== id);
      }

      // 같은 tag에서는 현재 과목 하나만 남긴다.
      if (clickedCourse.tag?.trim()) {
        const sameTagIds = courses
          .filter(
            (c) =>
              c.tag === clickedCourse.tag &&
              c.id !== clickedCourse.id
          )
          .map((c) => c.id);

        // 같은 카테고리 과목 제거 후 현재 과목 추가
        return [
          ...prev.filter((x) => !sameTagIds.includes(x)),
          id,
        ];
      }

      // 이전 데이터 호환용: tag가 없으면 독립 항목으로 취급
      return [...prev, id];
    });
  };

  const taggedCourses = courses.reduce(
    (acc, course) => {
      const key =
        course.tag && course.tag.trim()
          ? course.tag
          : '__NO_TAG__';

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(course);

      return acc;
    },
    {} as Record<string, CourseItem[]>
  );

  const handleSave = async () => {
    const student = getCurrentStudent();
    if (!student) {
      Alert.alert('오류', '로그인 정보가 없습니다');
      return;
    }

    setIsSaving(true);
    setFeedback('');
    try {
      console.log('=== handleSave START ===');
      console.log('selectedCourses from state:', selectedCourses);
      console.log('courses from state:', courses);

      const existingEnrolments = await enrolmentService.getByStudent(student.id);
      console.log('existingEnrolments:', existingEnrolments);

      const existingCourseIds = normalizeCourseIds(
        existingEnrolments.filter(
          (enrolment) =>
            enrolment.source === 'selected' &&
            courses.some((course) => course.id === Number(enrolment.courseId))
        )
      );
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
          await enrolmentService.create(student.id, courseId);
        }
      } else {
        console.warn('toAdd is empty - no create operations');
      }

      setSavedCourses([...selectedCourses]);
      setFeedback('과목 선택이 저장되었습니다.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
      console.log('=== handleSave END ===');
    }
  };

  return (
    <View style={CommonStyles.container}>
      {/* 상단 */}
      <View style={CommonStyles.headerSection}>
        <Text style={CommonStyles.title}>선택 과목</Text>
        <Text style={CommonStyles.subtitle}>원하는 과목을 선택하세요</Text>
        {getCurrentStudent()?.canManageCourses ? (
          <TouchableOpacity
            style={{ marginTop: 16, alignSelf: 'flex-start' }}
            onPress={() => confirmNavigation(() => router.push('/courseAdmin'))}
          >
            <Text style={{ color: '#4F46E5', fontWeight: '700' }}>내 과목 관리</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 과목 리스트 */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); void loadCourses(); }} />}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
      >
        {feedback ? <Text style={{ color: '#047857', textAlign: 'center', marginBottom: 12 }}>{feedback}</Text> : null}
        {errorMessage ? (
          <View style={{ alignItems: 'center', padding: 24 }}>
            <Text style={{ color: '#B91C1C', textAlign: 'center', marginBottom: 12 }}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => void loadCourses()}><Text style={{ color: '#4F46E5', fontWeight: '700' }}>다시 시도</Text></TouchableOpacity>
          </View>
        ) : isLoading ? (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        ) : (
          <>
            {courses.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#777', marginVertical: 40 }}>현재 선택할 수 있는 과목이 없습니다.</Text>
            ) : null}
            {Object.entries(taggedCourses).map(([tag, items]) => (
              <View key={tag}>
                {tag !== '__NO_TAG__' && (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      marginTop: 20,
                      marginBottom: 10,
                    }}
                  >
                    {tag}
                  </Text>
                )}

                {items.map((course) => {
                  const selected =
                    selectedCourses.indexOf(course.id) !== -1;

                  return (
                    <TouchableOpacity
                      key={String(course.id)}
                      onPress={() => toggleCourse(course.id)}
                      disabled={isSaving}
                      accessibilityRole="checkbox"
                      accessibilityLabel={`${course.title}, ${course.classroom || '장소 미정'}`}
                      accessibilityHint="같은 분류에서 이 과목을 선택합니다"
                      accessibilityState={{ checked: selected, disabled: isSaving }}
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
                        {selected ? '✓ ' : '○ '}{course.title}
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
              </View>
            ))}

            {/* 저장 버튼 */}
            <TouchableOpacity
              style={CommonStyles.saveButton}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={CommonStyles.saveButtonText}>
                {isSaving ? '저장 중...' : '저장하기'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* 하단 네비 */}
      <BottomNav active="course" beforeNavigate={confirmNavigation} />
    </View>
  );
}
