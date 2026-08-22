import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { BoardAuthor, boardService } from '../services/board';
import { getErrorMessage } from '../services/api';
import { getCurrentStudent } from '../store/auth';

export default function BoardAdminScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const postId = Number(Array.isArray(id) ? id[0] : id);
  const [reason, setReason] = useState('');
  const [author, setAuthor] = useState<BoardAuthor | null>(null);
  const [loading, setLoading] = useState(false);
  const student = getCurrentStudent();

  if (!student?.isAdmin) return <View style={styles.center}><Text>관리자 권한이 없습니다.</Text></View>;

  const reveal = async () => {
    if (reason.trim().length < 2) { Alert.alert('사유 필요', '작성자 확인 사유를 2자 이상 입력하세요.'); return; }
    setLoading(true);
    try { setAuthor(await boardService.revealAuthor(postId, reason.trim())); }
    catch (error) { Alert.alert('확인 실패', getErrorMessage(error)); }
    finally { setLoading(false); }
  };

  const moderate = () => {
    if (reason.trim().length < 2) { Alert.alert('사유 필요', '삭제 사유를 2자 이상 입력하세요.'); return; }
    Alert.alert('관리자 삭제', '운영 기록을 남기고 이 게시글을 삭제할까요?', [{ text: '취소', style: 'cancel' }, { text: '삭제', style: 'destructive', onPress: async () => {
      setLoading(true); try { await boardService.moderateRemove(postId, reason.trim()); router.replace('/board'); } catch (error) { Alert.alert('삭제 실패', getErrorMessage(error)); setLoading(false); }
    } }]);
  };

  return <ScrollView contentContainerStyle={styles.content}>
    <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>‹ 게시글</Text></TouchableOpacity>
    <Text style={styles.heading}>게시판 관리</Text><Text style={styles.warning}>작성자 확인과 관리자 삭제는 모두 사유와 함께 감사 로그에 기록됩니다.</Text>
    <Text style={styles.label}>운영 사유</Text><TextInput value={reason} onChangeText={setReason} maxLength={200} multiline placeholder="예: 괴롭힘 신고 접수 확인" style={styles.input} />
    <TouchableOpacity disabled={loading} onPress={() => void reveal()} style={styles.primary}>{loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>작성자 확인</Text>}</TouchableOpacity>
    {author ? <View style={styles.authorCard}><Text style={styles.cardTitle}>작성자 정보</Text><Info label="이름" value={author.student.username} /><Info label="로그인 ID" value={author.student.loginId} /><Info label="학적" value={`${author.student.grade}학년 ${author.student.classNo}반 ${author.student.schoolNumber}번`} /></View> : null}
    <TouchableOpacity disabled={loading} onPress={moderate} style={styles.deleteButton}><Text style={styles.deleteText}>관리자 권한으로 게시글 삭제</Text></TouchableOpacity>
  </ScrollView>;
}

function Info({ label, value }: { label: string; value: string }) { return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>; }
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, content: { flexGrow: 1, padding: 24, paddingTop: 56, backgroundColor: '#F9F9FB' }, back: { color: '#4F46E5', fontSize: 16, fontWeight: '700' }, heading: { marginTop: 24, color: '#111827', fontSize: 28, fontWeight: '900' }, warning: { marginTop: 10, marginBottom: 24, padding: 13, borderRadius: 12, backgroundColor: '#FFF7ED', color: '#9A3412', fontSize: 12, lineHeight: 18 }, label: { marginBottom: 8, color: '#374151', fontWeight: '800' }, input: { minHeight: 90, padding: 14, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 13, backgroundColor: '#FFFFFF', textAlignVertical: 'top' }, primary: { minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 14, borderRadius: 13, backgroundColor: '#111827' }, primaryText: { color: '#FFFFFF', fontWeight: '800' }, authorCard: { marginTop: 20, padding: 18, borderRadius: 16, backgroundColor: '#FFFFFF' }, cardTitle: { marginBottom: 10, color: '#111827', fontSize: 17, fontWeight: '900' }, info: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }, infoLabel: { color: '#6B7280' }, infoValue: { color: '#111827', fontWeight: '700' }, deleteButton: { alignItems: 'center', marginTop: 22, padding: 14 }, deleteText: { color: '#DC2626', fontWeight: '800' },
});
