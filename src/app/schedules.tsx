import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { CommonStyles, getSubjectColor } from './styles';
import { generateStudentSchedule } from '../services/apiClient';
import { getStudentId } from '../utils/auth';

const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시'];
const days = ['월', '화', '수', '목', '금'];
const screenWidth = Dimensions.get('window').width;
const cellWidth = (screenWidth - 24) / 6;

export default function ScheduleScreen() {
  const [timetable, setTimetable] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const studentId = await getStudentId();
      if (!studentId) {
        setError('로그인 정보를 찾을 수 없습니다.');
        return;
      }

      const schedule = await generateStudentSchedule(studentId);
      setTimetable(schedule);
    } catch (err: any) {
      const message = err?.data?.message || '시간표를 불러올 수 없습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={CommonStyles.container}>
      {/* 상단 */}
      <View style={CommonStyles.headerSection}>
        <Text style={CommonStyles.title}>내 시간표</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10 }}>시간표를 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
        </View>
      ) : timetable ? (
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
            {timetable.map((row, rowIndex) => (
              <View key={rowIndex} style={CommonStyles.flexRow}>
                {/* 교시 */}
                <Cell text={periods[rowIndex]} side />

                {/* 과목 */}
                {row.map((subject, colIndex) => (
                  <SubjectCell key={colIndex} subject={subject} />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}

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