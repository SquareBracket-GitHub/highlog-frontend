import { Dimensions, ScrollView, Text, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { CommonStyles, getSubjectColor } from './styles';

const timetable = [
  ['수학', '영어', '국어', '한국사', '수학'],
  ['영어', '수학', '영어', '국어', '영어'],
  ['국어', '국어', '수학', '영어', '국어'],
  ['물리학Ⅰ', '체육', '음악', '물리학Ⅰ', '체육'],
  ['자율활동', '창체', '진로', '창체', '자율활동'],
  ['', '', '생명과학Ⅰ', '', ''],
  ['', '', '', '', ''],
];

const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시'];

const days = ['월', '화', '수', '목', '금'];
const screenWidth = Dimensions.get('window').width;
const cellWidth = (screenWidth - 24) / 6;

export default function ScheduleScreen() {
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