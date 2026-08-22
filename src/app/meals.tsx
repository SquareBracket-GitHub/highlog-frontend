import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { getErrorMessage } from '../services/api';
import { Meal, mealService } from '../services/meals';
import { CommonStyles } from '../styles';

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
};

const moveDate = (value: string, offset: number) => {
  const date = fromDateKey(value);
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
};

const dateLabel = (value: string) => new Intl.DateTimeFormat('ko-KR', {
  month: 'long', day: 'numeric', weekday: 'short',
}).format(fromDateKey(value));

export default function MealsScreen() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const [meals, setMeals] = useState<Meal[]>([]);
  const [fetchedAt, setFetchedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (targetDate: string) => {
    setError('');
    try {
      const result = await mealService.getByDate(targetDate);
      setMeals(result.meals);
      setFetchedAt(result.fetchedAt);
    } catch (loadError) {
      setMeals([]);
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); void load(date); }, [date, load]));

  const selectDate = (nextDate: string) => {
    if (nextDate === date) void load(date);
    else setDate(nextDate);
  };

  return (
    <View style={CommonStyles.container}>
      <View style={CommonStyles.headerSection}>
        <Text style={CommonStyles.title}>급식</Text>
        <Text style={styles.subtitle}>학교에서 제공하는 오늘의 식단을 확인하세요.</Text>
      </View>

      <View style={styles.dateNavigator}>
        <Pressable accessibilityRole="button" accessibilityLabel="이전 날짜" onPress={() => selectDate(moveDate(date, -1))} style={styles.arrowButton}>
          <Text style={styles.arrow}>‹</Text>
        </Pressable>
        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>{dateLabel(date)}</Text>
          {date !== toDateKey(new Date()) ? (
            <TouchableOpacity onPress={() => selectDate(toDateKey(new Date()))}><Text style={styles.today}>오늘로 이동</Text></TouchableOpacity>
          ) : <Text style={styles.today}>오늘</Text>}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="다음 날짜" onPress={() => selectDate(moveDate(date, 1))} style={styles.arrowButton}>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(date); }} />}
        contentContainerStyle={styles.content}
      >
        {loading ? <ActivityIndicator size="large" style={styles.loader} /> : null}
        {!loading && error ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => { setLoading(true); void load(date); }} style={styles.retryButton}><Text style={styles.retryText}>다시 시도</Text></TouchableOpacity>
          </View>
        ) : null}
        {!loading && !error && meals.length === 0 ? (
          <View style={styles.stateCard}><Text style={styles.emptyTitle}>등록된 급식이 없습니다</Text><Text style={styles.emptyDescription}>주말, 공휴일 또는 방학일 수 있어요.</Text></View>
        ) : null}
        {!loading && !error ? meals.map((meal, index) => <MealCard key={`${meal.type}-${index}`} meal={meal} />) : null}
        {!loading && !error && fetchedAt ? <Text style={styles.source}>출처: 나이스 교육정보 개방 포털 · 최근 조회 {new Date(fetchedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</Text> : null}
      </ScrollView>
      <BottomNav active="meals" />
    </View>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  return (
    <View style={styles.mealCard}>
      <View style={styles.cardHeader}><Text style={styles.mealType}>{meal.type || '급식'}</Text>{meal.calories ? <Text style={styles.calories}>{meal.calories}</Text> : null}</View>
      <View style={styles.divider} />
      {meal.dishes.map((dish, index) => (
        <View key={`${dish.name}-${index}`} style={styles.dishRow}>
          <Text style={styles.bullet}>•</Text>
          <View style={styles.dishText}><Text style={styles.dishName}>{dish.name}</Text>{dish.allergens.length ? <Text style={styles.allergens}>알레르기 {dish.allergens.join(', ')}</Text> : null}</View>
        </View>
      ))}
      {meal.nutrition || meal.origin ? (
        <>
          <TouchableOpacity onPress={() => setDetailsOpen((open) => !open)} style={styles.detailsButton}><Text style={styles.detailsButtonText}>{detailsOpen ? '상세 정보 접기' : '영양·원산지 정보 보기'}</Text></TouchableOpacity>
          {detailsOpen ? <View style={styles.details}>{meal.nutrition ? <><Text style={styles.detailTitle}>영양 정보</Text><Text style={styles.detailText}>{meal.nutrition}</Text></> : null}{meal.origin ? <><Text style={styles.detailTitle}>원산지 정보</Text><Text style={styles.detailText}>{meal.origin}</Text></> : null}</View> : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: 8, color: '#6B7280', fontSize: 14 },
  dateNavigator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 24, marginBottom: 16, padding: 10, borderRadius: 16, backgroundColor: '#FFFFFF' },
  arrowButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#F3F4F6' },
  arrow: { color: '#111827', fontSize: 30, lineHeight: 34 },
  dateCenter: { alignItems: 'center' },
  dateText: { color: '#111827', fontSize: 18, fontWeight: '800' },
  today: { marginTop: 3, color: '#4F46E5', fontSize: 12, fontWeight: '700' },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 28 },
  loader: { marginTop: 60 },
  stateCard: { alignItems: 'center', marginTop: 24, padding: 28, borderRadius: 18, backgroundColor: '#FFFFFF' },
  emptyTitle: { color: '#111827', fontSize: 17, fontWeight: '800' },
  emptyDescription: { marginTop: 8, color: '#6B7280', fontSize: 13 },
  errorText: { color: '#B91C1C', textAlign: 'center' },
  retryButton: { marginTop: 14, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: '#111827' },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
  mealCard: { marginBottom: 16, padding: 20, borderRadius: 20, backgroundColor: '#FFFFFF', shadowColor: '#000000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mealType: { color: '#111827', fontSize: 21, fontWeight: '900' },
  calories: { color: '#6B7280', fontSize: 12, fontWeight: '600' },
  divider: { height: 1, marginVertical: 15, backgroundColor: '#EEF0F3' },
  dishRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 11 },
  bullet: { width: 18, color: '#4F46E5', fontSize: 18, lineHeight: 21 },
  dishText: { flex: 1 },
  dishName: { color: '#1F2937', fontSize: 15, lineHeight: 21, fontWeight: '600' },
  allergens: { marginTop: 2, color: '#9A6B16', fontSize: 11 },
  detailsButton: { alignItems: 'center', marginTop: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEF0F3' },
  detailsButtonText: { color: '#4F46E5', fontSize: 13, fontWeight: '700' },
  details: { padding: 12, borderRadius: 12, backgroundColor: '#F8FAFC' },
  detailTitle: { marginTop: 4, marginBottom: 4, color: '#374151', fontSize: 12, fontWeight: '800' },
  detailText: { color: '#6B7280', fontSize: 11, lineHeight: 17 },
  source: { marginTop: 4, color: '#9CA3AF', fontSize: 11, textAlign: 'center' },
});
