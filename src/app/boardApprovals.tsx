import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { boardMembershipService, BoardMembershipRequest } from '../services/boardMemberships';
import { getErrorMessage } from '../services/api';
import { getCurrentStudent } from '../store/auth';

const formatDate = (value: string) => new Date(value).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function BoardApprovalsScreen() {
  const [requests, setRequests] = useState<BoardMembershipRequest[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const student = getCurrentStudent();

  const load = useCallback(async () => {
    try { setRequests(await boardMembershipService.pending()); setError(''); }
    catch (loadError) { setError(getErrorMessage(loadError)); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useFocusEffect(useCallback(() => { if (student?.isAdmin) void load(); }, [load, student?.isAdmin]));

  if (!student?.isAdmin) return <View style={styles.center}><Text>관리자 권한이 없습니다.</Text></View>;

  const review = (request: BoardMembershipRequest, decision: 'approved' | 'rejected') => {
    const verb = decision === 'approved' ? '승인' : '거절';
    Alert.alert(`이용 ${verb}`, `${request.grade}학년 ${request.classNo}반 ${request.schoolNumber}번 ${request.username} 학생의 요청을 ${verb}할까요?`, [
      { text: '취소', style: 'cancel' },
      { text: verb, style: decision === 'rejected' ? 'destructive' : 'default', onPress: async () => {
        setProcessingId(request.studentId);
        try { await boardMembershipService.review(request.studentId, decision, notes[request.studentId]?.trim() || ''); await load(); }
        catch (reviewError) { Alert.alert('처리 실패', getErrorMessage(reviewError)); }
        finally { setProcessingId(null); }
      } },
    ]);
  };

  return <View style={styles.container}>
    <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>‹ 게시판</Text></TouchableOpacity><Text style={styles.heading}>승인 요청</Text><Text style={styles.subtitle}>게시판 이용을 신청한 학생의 학적 정보를 확인하세요.</Text></View>
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />} contentContainerStyle={styles.content}>
      {loading ? <ActivityIndicator size="large" style={{ marginTop: 50 }} /> : null}
      {!loading && error ? <View style={styles.state}><Text style={styles.error}>{error}</Text><TouchableOpacity onPress={() => void load()}><Text style={styles.retry}>다시 시도</Text></TouchableOpacity></View> : null}
      {!loading && !error && requests.length === 0 ? <View style={styles.state}><Text style={styles.emptyTitle}>새로운 승인 요청이 없습니다</Text><Text style={styles.emptyCopy}>요청이 들어오면 이곳에 표시됩니다.</Text></View> : null}
      {!loading && !error ? requests.map((request) => <View key={request.studentId} style={styles.requestCard}>
        <View style={styles.cardTop}><View style={styles.avatar}><Text style={styles.avatarText}>{request.username.slice(0, 1)}</Text></View><View style={{ flex: 1 }}><Text style={styles.name}>{request.username}</Text><Text style={styles.schoolInfo}>{request.grade}학년 {request.classNo}반 {request.schoolNumber}번</Text></View><Text style={styles.time}>{formatDate(request.requestedAt)}</Text></View>
        <TextInput value={notes[request.studentId] || ''} onChangeText={(value) => setNotes((current) => ({ ...current, [request.studentId]: value }))} maxLength={200} placeholder="처리 메모 또는 거절 사유 (선택)" style={styles.noteInput} />
        <View style={styles.buttons}><TouchableOpacity disabled={processingId !== null} onPress={() => review(request, 'rejected')} style={styles.rejectButton}><Text style={styles.rejectText}>거절</Text></TouchableOpacity><TouchableOpacity disabled={processingId !== null} onPress={() => review(request, 'approved')} style={styles.approveButton}>{processingId === request.studentId ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.approveText}>승인</Text>}</TouchableOpacity></View>
      </View>) : null}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FB' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, header: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 20 }, back: { color: '#4F46E5', fontSize: 16, fontWeight: '700' }, heading: { marginTop: 20, color: '#111827', fontSize: 28, fontWeight: '900' }, subtitle: { marginTop: 7, color: '#6B7280', fontSize: 13 }, content: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 30 },
  requestCard: { marginBottom: 12, padding: 17, borderRadius: 17, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEF0F3' }, cardTop: { flexDirection: 'row', alignItems: 'center' }, avatar: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderRadius: 21, backgroundColor: '#E0E7FF' }, avatarText: { color: '#4338CA', fontSize: 17, fontWeight: '900' }, name: { color: '#111827', fontSize: 16, fontWeight: '900' }, schoolInfo: { marginTop: 3, color: '#4B5563', fontSize: 12 }, time: { color: '#9CA3AF', fontSize: 10 }, noteInput: { marginTop: 14, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 11, backgroundColor: '#F9FAFB', fontSize: 12 }, buttons: { flexDirection: 'row', gap: 9, marginTop: 12 }, rejectButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 11, backgroundColor: '#FEF2F2' }, rejectText: { color: '#DC2626', fontWeight: '800' }, approveButton: { flex: 2, minHeight: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#111827' }, approveText: { color: '#FFFFFF', fontWeight: '800' },
  state: { alignItems: 'center', marginTop: 30, padding: 28, borderRadius: 17, backgroundColor: '#FFFFFF' }, error: { color: '#B91C1C', textAlign: 'center' }, retry: { marginTop: 10, color: '#4F46E5', fontWeight: '800' }, emptyTitle: { color: '#111827', fontSize: 16, fontWeight: '800' }, emptyCopy: { marginTop: 6, color: '#6B7280', fontSize: 12 },
});
