import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { CommonStyles } from './styles';

const courses = [
  '물리학Ⅰ',
  '생명과학Ⅰ',
  '화학Ⅰ',
  '지구과학Ⅰ',
  '미술',
  '음악',
  '체육',
  '프로그래밍',
];

export default function CourseSelectScreen() {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const toggleCourse = (course: string) => {
    if (selectedCourses.includes(course)) {
      setSelectedCourses(selectedCourses.filter((item) => item !== course));
    } else {
      setSelectedCourses([...selectedCourses, course]);
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
        {courses.map((course) => {
          const selected = selectedCourses.includes(course);

          return (
            <TouchableOpacity
              key={course}
              onPress={() => toggleCourse(course)}
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
                {course}
              </Text>

              <Text
                style={[
                  CommonStyles.courseSubtext,
                  selected
                    ? CommonStyles.courseSubtextSelected
                    : CommonStyles.courseSubtextUnselected,
                ]}
              >
                {selected ? '선택됨' : '탭하여 선택'}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* 저장 버튼 */}
        <TouchableOpacity style={CommonStyles.saveButton}>
          <Text style={CommonStyles.saveButtonText}>저장하기</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 하단 네비 */}
      <BottomNav active="course" />
    </View>
  );
}