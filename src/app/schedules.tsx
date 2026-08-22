import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import BottomNav from '../components/BottomNav';
import { getErrorMessage } from '../services/api';
import { PersonalTimetableEntry, personalTimetableService } from '../services/personalTimetables';
import { CommonStyles } from '../styles';

const DAYS = ['월', '화', '수', '목', '금'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const CELL_HEIGHT = 72;

export default function ScheduleScreen() {
  const [entries, setEntries] = useState<PersonalTimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const { width } = useWindowDimensions();
  const cellWidth = Math.max(58, (width - 40) / 6);

  const load = useCallback(async () => {
    setError('');
    try {
      setEntries(await personalTimetableService.getMine());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const openEditor = (day: string, period: number, entry?: PersonalTimetableEntry) => {
    const params = new URLSearchParams({ day, period: String(period) });
    if (entry) {
      params.set('subjectName', entry.subjectName);
      params.set('className', entry.className);
      params.set('color', entry.color);
    }
    router.push(`/scheduleEntry?${params.toString()}` as Href);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={CommonStyles.container}>
      <View style={CommonStyles.headerSection}>
        <Text style={CommonStyles.title}>내 시간표</Text>
        <Text style={styles.subtitle}>빈 칸을 눌러 과목을 직접 입력해 보세요.</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        contentContainerStyle={styles.scrollContent}
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => void load()}><Text style={styles.retry}>다시 시도</Text></TouchableOpacity>
          </View>
        ) : null}
        <ScrollView horizontal contentContainerStyle={styles.gridPadding}>
          <View style={{ minWidth: cellWidth * 6 }}>
            <View style={CommonStyles.flexRow}>
              <HeaderCell text="" width={cellWidth} />
              {DAYS.map((day) => <HeaderCell key={day} text={day} width={cellWidth} />)}
            </View>
            {PERIODS.map((period) => (
              <View key={period} style={CommonStyles.flexRow}>
                <View style={[styles.periodCell, { width: cellWidth }]}><Text style={styles.periodText}>{period}교시</Text></View>
                {DAYS.map((day) => {
                  const entry = entries.find((item) => item.day === day && item.period === period);
                  return <ScheduleCell key={`${day}-${period}`} entry={entry} width={cellWidth} onPress={() => openEditor(day, period, entry)} />;
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
      <BottomNav active="schedule" />
    </View>
  );
}

function HeaderCell({ text, width }: { text: string; width: number }) {
  return <View style={[styles.headerCell, { width }]}><Text style={styles.headerText}>{text}</Text></View>;
}

function ScheduleCell({ entry, width, onPress }: { entry?: PersonalTimetableEntry; width: number; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={entry ? `${entry.day}요일 ${entry.period}교시 ${entry.subjectName}, ${entry.className}` : '빈 시간표 칸'}
      accessibilityHint={entry ? '입력한 과목을 수정합니다.' : '새 과목을 입력합니다.'}
      onPress={onPress}
      style={({ pressed }) => [styles.scheduleCell, { width, backgroundColor: entry?.color || '#FFFFFF', opacity: pressed ? 0.72 : 1 }]}
    >
      {entry ? (
        <>
          <Text numberOfLines={2} style={styles.subjectName}>{entry.subjectName}</Text>
          <Text numberOfLines={1} style={styles.className}>{entry.className}</Text>
        </>
      ) : <Text style={styles.plus}>＋</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', backgroundColor: '#F9F9FB' },
  subtitle: { marginTop: 8, color: '#6B7280', fontSize: 14 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  gridPadding: { paddingHorizontal: 20 },
  headerCell: { height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  headerText: { color: '#374151', fontSize: 13, fontWeight: '700' },
  periodCell: { height: CELL_HEIGHT, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E7EB' },
  periodText: { color: '#4B5563', fontSize: 12, fontWeight: '600' },
  scheduleCell: { height: CELL_HEIGHT, alignItems: 'center', justifyContent: 'center', padding: 5, borderWidth: 1, borderColor: '#E5E7EB' },
  subjectName: { color: '#111827', fontSize: 12, lineHeight: 16, fontWeight: '800', textAlign: 'center' },
  className: { marginTop: 4, color: '#374151', fontSize: 10, textAlign: 'center' },
  plus: { color: '#CBD5E1', fontSize: 22, fontWeight: '300' },
  errorBox: { alignItems: 'center', marginHorizontal: 20, marginBottom: 14, padding: 14, borderRadius: 12, backgroundColor: '#FEF2F2' },
  errorText: { color: '#B91C1C', textAlign: 'center' },
  retry: { marginTop: 8, color: '#4F46E5', fontWeight: '700' },
});
