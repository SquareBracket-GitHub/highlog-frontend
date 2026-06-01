import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Dimensions, ScrollView, Text, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { courseService, enrolmentService } from '../services';
import { getCurrentStudent } from '../store/auth';
import { CommonStyles, getSubjectColor } from './styles';

interface TimetableData {
  [day: string]: { [period: number]: string };
}

const days = ['월', '화', '수', '목', '금'];
const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시'];
const screenWidth = Dimensions.get('window').width;
const cellWidth = (screenWidth - 24) / 6;

export default function ScheduleScreen() {
  const [timetable, setTimetable] = useState<TimetableData>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadSchedule();
    }, [])
  );

  const loadSchedule = async () => {
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

        // 과목의 요일과 교시 정보 처리
        if (course.days && Array.isArray(course.days)) {
          for (const schedule of course.days) {
            const day = schedule.day;
            const period = schedule.period;

            if (!timetableData[day]) {
              timetableData[day] = {};
            }

            timetableData[day][period] = course.title;
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
  };

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
                const subject = timetable[day]?.[periodIndex + 1] || '';

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
          height: 54,
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

function SubjectCell({ subject }: { subject: string }) {
  const backgroundColor = getSubjectColor(subject);

  return (
    <View
      style={[
        CommonStyles.cellBase,
        {
          width: cellWidth,
          height: 54,
          backgroundColor,
        },
      ]}
    >
      <Text style={CommonStyles.subjectCellText}>{subject}</Text>
    </View>
  );
}