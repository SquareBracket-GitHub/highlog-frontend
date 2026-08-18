import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { classTimetableService, courseService, enrolmentService } from '../services';
import { getCurrentStudent } from '../store/auth';
import { CommonStyles, getSubjectColor } from '../styles';
import { getErrorMessage } from '../services/api';

interface TimetableCell {
  title: string;
  classroom: string;
  color?: string;
  kind: '선택' | '공통';
}

interface TimetableData {
  [day: string]: { [period: string]: TimetableCell };
}

interface SelectedTimetableCell {
  subject: TimetableCell;
  day: string;
  period: number;
}

const days = ['월', '화', '수', '목', '금'];
const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시'];
const cellHeight = 66;

const dayNameMap: Record<string, string> = {
  월요일: '월',
  화요일: '화',
  수요일: '수',
  목요일: '목',
  금요일: '금',
};

const normalizeDay = (day: string): string => {
  const trimmed = day?.trim();
  if (!trimmed) return '';
  if (dayNameMap[trimmed]) return dayNameMap[trimmed];
  return trimmed.slice(0, 1);
};

const normalizePeriod = (period: number | string): string => {
  if (period === undefined || period === null) {
    return '';
  }
  const value = typeof period === 'number' ? period.toString() : period.toString().trim();
  const digits = value.match(/\d+/)?.[0];
  if (digits) {
    return String(parseInt(digits, 10));
  }
  return value;
};

export default function ScheduleScreen() {
  const [timetable, setTimetable] = useState<TimetableData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCell, setSelectedCell] = useState<SelectedTimetableCell | null>(null);
  const { width } = useWindowDimensions();
  const cellWidth = Math.max(58, (width - 24) / 6);

  const loadSchedule = useCallback(async () => {
    if (!isRefreshing) setIsLoading(true);
    setErrorMessage('');
    try {
      const student = getCurrentStudent();
      if (!student) {
        setErrorMessage('로그인 정보가 없습니다.');
        return;
      }

      const [enrolments, slots] = await Promise.all([
        enrolmentService.getByStudent(student.id),
        classTimetableService.getMine(),
      ]);
      const selectedCourses = await Promise.all(
        enrolments.map((enrolment) => courseService.getById(enrolment.courseId))
      );
      const timetableData: TimetableData = {};

      if (slots.length > 0) {
        const selectedByTag = new Map(
          selectedCourses.map((course) => [course.tag, course])
        );

        for (const slot of slots) {
          const day = normalizeDay(slot.day);
          const period = normalizePeriod(slot.period);
          if (!day || !period) continue;

          const selectedCourse = slot.courseId
            ? selectedCourses.find((course) => course.id === Number(slot.courseId))
            : slot.tag
              ? selectedByTag.get(slot.tag)
              : undefined;
          if (!timetableData[day]) timetableData[day] = {};
          timetableData[day][period] = {
            title: selectedCourse?.title || slot.label,
            classroom: selectedCourse?.classroom || '',
            color: selectedCourse?.color,
            kind: slot.tag ? '선택' : '공통',
          };
        }
      } else {
        // 반별 틀이 아직 없으면 기존 courses.days 일정을 사용한다.
        for (const course of selectedCourses) {

          if (course.days && Array.isArray(course.days)) {
            for (const schedule of course.days) {
              const day = normalizeDay(schedule.day);
              const period = normalizePeriod(schedule.period);

              if (!day || !period) continue;

              if (!timetableData[day]) timetableData[day] = {};

              timetableData[day][period] = {
                title: course.title,
                classroom: course.classroom,
                color: course.color,
                kind: course.tag ? '선택' : '공통',
              };
            }
          }
        }
      }

      setTimetable(timetableData);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSchedule();
    }, [loadSchedule])
  );

  if (isLoading) {
    return (
      <View style={CommonStyles.container}>
        <View style={CommonStyles.headerSection}>
          <Text style={CommonStyles.title}>내 시간표</Text>
        </View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={CommonStyles.container}>
      {/* 상단 */}
      <View style={CommonStyles.headerSection}>
        <Text style={CommonStyles.title}>내 시간표</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); void loadSchedule(); }} />
        }
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      >
        <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 20 }}>
        <View style={{ minWidth: cellWidth * 6 }}>
          {errorMessage ? (
            <View style={{ width: cellWidth * 6, alignItems: 'center', padding: 24 }}>
              <Text style={{ color: '#B91C1C', textAlign: 'center', marginBottom: 12 }}>{errorMessage}</Text>
              <TouchableOpacity onPress={() => void loadSchedule()} style={CommonStyles.primaryButton}>
                <Text style={[CommonStyles.primaryButtonText, { paddingHorizontal: 24 }]}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {!errorMessage && Object.keys(timetable).length === 0 ? (
            <Text style={{ width: cellWidth * 6, textAlign: 'center', color: '#777', paddingVertical: 16 }}>
              등록된 시간표가 없습니다. 아래로 당겨 새로고침해 보세요.
            </Text>
          ) : null}
          {/* 요일 헤더 */}
          <View style={CommonStyles.flexRow}>
            <Cell text="" header width={cellWidth} />
            {days.map((day) => (
              <Cell key={day} text={day} header width={cellWidth} />
            ))}
          </View>

          {/* 시간표 */}
          {periods.map((period, periodIndex) => (
            <View key={periodIndex} style={CommonStyles.flexRow}>
              {/* 교시 */}
              <Cell text={period} side width={cellWidth} />

              {/* 각 요일의 과목 */}
              {days.map((day) => {
                const subject = timetable[day]?.[periodIndex + 1];

                return (
                  <SubjectCell
                    key={`${day}-${periodIndex}`}
                    subject={subject}
                    width={cellWidth}
                    day={day}
                    period={periodIndex + 1}
                    onPress={() => subject && setSelectedCell({ subject, day, period: periodIndex + 1 })}
                  />
                );
              })}
            </View>
          ))}
        </View>
        </ScrollView>
      </ScrollView>

      <SubjectDetailModal
        selectedCell={selectedCell}
        onClose={() => setSelectedCell(null)}
      />

      <BottomNav active="schedule" />
    </View>
  );
}

/* 헬퍼 컴포넌트 */
function Cell({
  text,
  header,
  side,
  width,
}: {
  text: string;
  header?: boolean;
  side?: boolean;
  width: number;
}) {
  return (
    <View
      style={[
        CommonStyles.cellBase,
        {
          width,
          height: header ? 54 : cellHeight,
        },
        header && CommonStyles.cellHeader,
        side && CommonStyles.cellSide,
        !header && !side && CommonStyles.cellDefault,
      ]}
    >
      <Text
        style={[
          header ? CommonStyles.cellTextHeader : CommonStyles.cellText,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const getContrastingTextColor = (backgroundColor: string): string => {
  const hex = backgroundColor.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return '#111827';
  const [red, green, blue] = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16));
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.55 ? '#111827' : '#FFFFFF';
};

function SubjectCell({
  subject,
  width,
  day,
  period,
  onPress,
}: {
  subject?: TimetableCell;
  width: number;
  day: string;
  period: number;
  onPress: () => void;
}) {
  const title = subject?.title || '';
  const classroom = subject?.classroom || '';
  const backgroundColor = subject?.color || getSubjectColor(title);
  const textColor = getContrastingTextColor(backgroundColor);
  const accessibilityLabel = title
    ? `${day}요일 ${period}교시, ${title}, ${classroom || '장소 미정'}, ${subject?.kind} 과목`
    : `${day}요일 ${period}교시, 수업 없음`;

  return (
    <Pressable
      accessible
      accessibilityRole={title ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={title ? '두 번 탭하여 과목 상세 정보를 확인합니다.' : undefined}
      disabled={!title}
      onPress={onPress}
      style={[
        CommonStyles.cellBase,
        {
          width,
          height: cellHeight,
          backgroundColor,
          paddingHorizontal: 4,
          paddingVertical: 6,
        },
        !title && CommonStyles.cellDefault,
      ]}
    >
      {title ? (
        <View
          importantForAccessibility="no-hide-descendants"
          style={[
            CommonStyles.subjectTypePattern,
            subject?.kind === '선택'
              ? CommonStyles.subjectTypePatternSelected
              : CommonStyles.subjectTypePatternCommon,
          ]}
        >
          <Text style={[CommonStyles.subjectTypeText, { color: textColor }]}>{subject?.kind}</Text>
        </View>
      ) : null}
      <Text style={[CommonStyles.subjectCellTitle, { color: textColor }]}>{title}</Text>
      {classroom ? (
        <Text style={[CommonStyles.subjectCellPlace, { color: textColor }]}>{classroom}</Text>
      ) : null}
    </Pressable>
  );
}

function SubjectDetailModal({
  selectedCell,
  onClose,
}: {
  selectedCell: SelectedTimetableCell | null;
  onClose: () => void;
}) {
  const subject = selectedCell?.subject;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={selectedCell !== null}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={detailStyles.overlay}>
        <Pressable
          accessibilityLabel="과목 상세 창 닫기"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View
          accessibilityViewIsModal
          style={detailStyles.dialog}
        >
          <Text style={detailStyles.heading}>과목 상세</Text>
          <DetailRow label="과목명" value={subject?.title || ''} />
          <DetailRow label="장소" value={subject?.classroom || '장소 미정'} />
          <DetailRow label="요일" value={selectedCell ? `${selectedCell.day}요일` : ''} />
          <DetailRow label="교시" value={selectedCell ? `${selectedCell.period}교시` : ''} />
          <DetailRow label="구분" value={subject ? `${subject.kind} 과목` : ''} />
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onClose}
            style={detailStyles.closeButton}
          >
            <Text style={detailStyles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  heading: {
    marginBottom: 18,
    color: '#111827',
    fontSize: 22,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1D5DB',
  },
  label: {
    width: 72,
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  value: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#111827',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
