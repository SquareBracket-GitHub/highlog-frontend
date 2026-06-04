import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Dimensions, ScrollView, Text, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { courseService, enrolmentService } from '../services';
import { getCurrentStudent } from '../store/auth';
import { CommonStyles, getSubjectColor } from './styles';

interface TimetableCell {
  title: string;
  classroom: string;
}

interface TimetableData {
  [day: string]: { [period: string]: TimetableCell };
}

const days = ['월', '화', '수', '목', '금'];
const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시'];
const screenWidth = Dimensions.get('window').width;
const cellWidth = (screenWidth - 24) / 6;
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
  const [loading, setLoading] = useState(true);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const student = getCurrentStudent();
      if (!student) {
        Alert.alert('오류', '로그인 정보가 없습니다');
        return;
      }

      // 학생의 등록된 과목들 조회
      const enrolments = await enrolmentService.getByStudent(student.id);

      // 과목 정보 조회 및 시간표 구성
      const timetableData: TimetableData = {};

      for (const enrolment of enrolments) {
        const course = await courseService.getById(enrolment.course_id);

        if (course.days && Array.isArray(course.days)) {
          for (const schedule of course.days) {
            const day = normalizeDay(schedule.day);
            const period = normalizePeriod(schedule.period);

            if (!day || !period) {
              continue;
            }

            if (!timetableData[day]) {
              timetableData[day] = {};
            }

            timetableData[day][period] = {
              title: course.title,
              classroom: course.classroom,
            };
          }
        }
      }

      setTimetable(timetableData);
    } catch (error) {
      Alert.alert('오류', '시간표를 불러올 수 없습니다');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSchedule();
    }, [loadSchedule])
  );

  if (loading) {
    return (
      <View style={CommonStyles.container}>
        <View style={CommonStyles.headerSection}>
          <Text style={CommonStyles.title}>내 시간표</Text>
        </View>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          시간표를 불러오는 중...
        </Text>
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
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <View>
          {/* 요일 헤더 */}
          <View style={CommonStyles.flexRow}>
            <Cell text="" header />
            {days.map((day) => (
              <Cell key={day} text={day} header />
            ))}
          </View>

          {/* 시간표 */}
          {periods.map((period, periodIndex) => (
            <View key={periodIndex} style={CommonStyles.flexRow}>
              {/* 교시 */}
              <Cell text={period} side />

              {/* 각 요일의 과목 */}
              {days.map((day) => {
                const subject = timetable[day]?.[periodIndex + 1];

                return (
                  <SubjectCell key={`${day}-${periodIndex}`} subject={subject} />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNav active="schedule" />
    </View>
  );
}

/* 헬퍼 컴포넌트 */
function Cell({
  text,
  header,
  side,
}: {
  text: string;
  header?: boolean;
  side?: boolean;
}) {
  return (
    <View
      style={[
        CommonStyles.cellBase,
        {
          width: cellWidth,
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

function SubjectCell({ subject }: { subject?: TimetableCell }) {
  const title = subject?.title || '';
  const classroom = subject?.classroom || '';
  const backgroundColor = getSubjectColor(title);

  return (
    <View
      style={[
        CommonStyles.cellBase,
        {
          width: cellWidth,
          height: cellHeight,
          backgroundColor,
          paddingHorizontal: 4,
          paddingVertical: 6,
        },
        !title && CommonStyles.cellDefault,
      ]}
    >
      <Text style={CommonStyles.subjectCellTitle}>{title}</Text>
      {classroom ? (
        <Text style={CommonStyles.subjectCellPlace}>{classroom}</Text>
      ) : null}
    </View>
  );
}