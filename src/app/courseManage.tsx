import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { courseService } from '../services';
import { getCurrentStudent } from '../store/auth';
import { CommonStyles } from '../styles';

const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일'];
const PERIODS = Array.from({ length: 7 }, (_, index) => index + 1);
const COLORS = ['#BBF7D0', '#BFDBFE', '#FDE68A', '#FCD34D', '#E9D5FF', '#FBCFE8'];
type CourseSchedule = { day: string; period: number };

export default function CourseManageScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const courseId = params.id ? Number(params.id) : undefined;
  const student = getCurrentStudent();
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState(student?.grade.toString() || '');
  const [classNo, setClassNo] = useState(student?.classNo.toString() || '');
  const [tag, setTag] = useState('');
  const [classroom, setClassroom] = useState('');
  const [schedules, setSchedules] = useState<CourseSchedule[]>([{ day: DAYS[0], period: 1 }]);
  const [color, setColor] = useState(COLORS[0]);
  const [isClassWide, setIsClassWide] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [impactMessage, setImpactMessage] = useState('');

  useEffect(() => {
    if (!courseId) return;
    Promise.all([courseService.getById(courseId), courseService.getImpact(courseId)]).then(([course, impact]) => {
      setTitle(course.title); setGrade(String(course.grade)); setClassNo(course.classNo ? String(course.classNo) : '');
      setTag(course.tag || ''); setClassroom(course.classroom); setSchedules(course.days.map(({ day, period }) => ({ day, period: Number(period) })));
      setColor(course.color); setIsClassWide(course.isClassWide);
      setImpactMessage(`현재 수강 학생 ${impact.enrolledStudents}명, 시간표 슬롯 ${impact.timetableSlots}개에 영향을 줍니다.`);
    }).catch(() => Alert.alert('오류', '수정할 과목 정보를 불러오지 못했습니다.'));
  }, [courseId]);

  useEffect(() => {
    const gradeNumber = Number(grade);
    const classNumber = Number(classNo);
    if (!title.trim() || !classroom.trim() || !Number.isInteger(gradeNumber) || (!isClassWide && !tag.trim())) return;
    const timer = setTimeout(() => {
      courseService.checkConflicts({
        title: title.trim(), classroom: classroom.trim(), tag: isClassWide ? null : tag.trim(),
        grade: gradeNumber, classNo: isClassWide ? classNumber : null, schedules, color, isClassWide,
      }, courseId).then((result) => {
        const slots = result.conflicts.map((item) => `${item.day} ${item.period}교시`).join(', ');
        setConflictMessage(result.tagError || (slots ? `시간 충돌: ${slots}` : ''));
      }).catch(() => setConflictMessage('충돌 여부를 확인하지 못했습니다.'));
    }, 400);
    return () => clearTimeout(timer);
  }, [classNo, classroom, color, courseId, grade, isClassWide, schedules, tag, title]);

  const updateSchedule = (index: number, patch: Partial<CourseSchedule>) => {
    setSchedules((current) => current.map((schedule, scheduleIndex) =>
      scheduleIndex === index ? { ...schedule, ...patch } : schedule
    ));
  };

  const addSchedule = () => {
    const available = DAYS.flatMap((scheduleDay) =>
      PERIODS.map((schedulePeriod) => ({ day: scheduleDay, period: schedulePeriod }))
    ).find((candidate) => !schedules.some(
      (schedule) => schedule.day === candidate.day && schedule.period === candidate.period
    ));
    if (!available) {
      Alert.alert('일정 추가', '추가할 수 있는 시간대가 없습니다.');
      return;
    }
    setSchedules((current) => [...current, available]);
  };

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
    if (!title.trim() || !classroom.trim() || !Number.isInteger(gradeNumber) || gradeNumber < 1) {
      Alert.alert('입력 확인', '과목명, 학년, 수업 장소를 모두 올바르게 입력하세요.');
      return;
    }
    if (isClassWide && (!Number.isInteger(classNumber) || classNumber < 1)) {
      Alert.alert('입력 확인', '반 전체 공통 과목에는 대상 반이 필요합니다.');
      return;
    }
    if (!isClassWide && !tag.trim()) {
      Alert.alert('입력 확인', '선택 과목에는 태그가 필요합니다.');
      return;
    }
    const scheduleKeys = schedules.map(({ day, period }) => `${day}-${period}`);
    if (new Set(scheduleKeys).size !== scheduleKeys.length) {
      Alert.alert('입력 확인', '같은 요일과 교시가 중복되어 있습니다.');
      return;
    }
    if (conflictMessage) {
      Alert.alert('시간표 확인', conflictMessage);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        grade: gradeNumber,
        classNo: isClassWide ? classNumber : null,
        tag: isClassWide ? null : tag.trim(),
        classroom: classroom.trim(),
        schedules,
        color,
        isClassWide,
      };
      if (courseId) await courseService.update(courseId, payload);
      else await courseService.create(payload);
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
      automaticallyAdjustKeyboardInsets
    >
      <Text style={[CommonStyles.title, { marginBottom: 12 }]}>{courseId ? '과목 수정' : '과목 추가'}</Text>
      {impactMessage ? <Text style={{ color: '#92400E', marginBottom: 16 }}>{impactMessage}</Text> : null}
      {conflictMessage ? <Text style={{ color: '#DC2626', marginBottom: 16 }}>{conflictMessage}</Text> : null}
      <Field label="과목명" value={title} onChangeText={setTitle} placeholder="예: 물리학" />
      <Field label="학년" value={grade} onChangeText={setGrade} numeric />
      {isClassWide ? (
        <Field label="대상 반" value={classNo} onChangeText={setClassNo} numeric />
      ) : (
        <View style={{ backgroundColor: '#F3F4F6', borderRadius: 12, padding: 14, marginBottom: 20 }}>
          <Text style={{ color: '#444', fontWeight: '600' }}>선택과목은 학년 전체 대상입니다.</Text>
          <Text style={{ color: '#777', fontSize: 12, marginTop: 4 }}>반을 지정하지 않고 같은 학년 학생에게 표시됩니다.</Text>
        </View>
      )}
      <Field label="수업 장소" value={classroom} onChangeText={setClassroom} placeholder="예: 과학실" />

      <View style={rowStyle}>
        <View style={{ flex: 1 }}>
          <Text style={CommonStyles.inputLabel}>반 전체 공통</Text>
          <Text style={{ color: '#777', fontSize: 12 }}>학생 선택 없이 전원 자동 등록</Text>
        </View>
        <Switch value={isClassWide} onValueChange={setIsClassWide} />
      </View>

      {isClassWide ? (
        <View style={{ backgroundColor: '#EEF2FF', borderRadius: 12, padding: 14, marginBottom: 20 }}>
          <Text style={{ color: '#3730A3', fontWeight: '700' }}>
            대상: {grade || '?'}학년 {classNo || '?'}반 전체
          </Text>
          <Text style={{ color: '#6366F1', fontSize: 12, marginTop: 4 }}>
            이 반에 등록된 모든 학생에게 자동으로 추가됩니다.
          </Text>
        </View>
      ) : null}

      {!isClassWide ? (
        <Field label="선택 그룹 태그" value={tag} onChangeText={setTag} placeholder="예: 과학 선택" />
      ) : null}

      <Text style={[CommonStyles.inputLabel, { fontWeight: '700' }]}>수업 일정</Text>
      {schedules.map((schedule, index) => (
        <View
          key={`schedule-${index}`}
          style={{ backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 12 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: '700' }}>일정 {index + 1}</Text>
            {schedules.length > 1 ? (
              <TouchableOpacity onPress={() => setSchedules((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                <Text style={{ color: '#DC2626' }}>삭제</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <OptionGroup
            label="요일"
            options={DAYS}
            selected={schedule.day}
            onSelect={(value) => updateSchedule(index, { day: value })}
          />
          <OptionGroup
            label="교시"
            options={PERIODS.map(String)}
            selected={String(schedule.period)}
            onSelect={(value) => updateSchedule(index, { period: Number(value) })}
          />
        </View>
      ))}
      <TouchableOpacity
        onPress={addSchedule}
        style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: '#4F46E5', borderRadius: 12, padding: 14, marginBottom: 24 }}
      >
        <Text style={{ color: '#4F46E5', fontWeight: '700', textAlign: 'center' }}>+ 일정 추가</Text>
      </TouchableOpacity>

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
        <Text style={CommonStyles.primaryButtonText}>{isSaving ? '저장 중...' : courseId ? '수정 저장' : '과목 저장'}</Text>
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
