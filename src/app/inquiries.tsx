import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { getErrorMessage } from '../services/api';
import { Inquiry, inquiryService } from '../services/inquiries';
import { getCurrentStudent } from '../store/auth';
import { CommonStyles } from '../styles';

const formatDate = (value: string) => new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const statusText = { open: '답변 대기', answered: '답변 완료', closed: '처리 종료' } as const;

export default function InquiriesScreen() {
  const student = getCurrentStudent();
  const [mode, setMode] = useState<'mine' | 'admin'>('mine');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try { setInquiries(mode === 'admin' ? await inquiryService.all() : await inquiryService.mine()); }
    catch (loadError) { setError(getErrorMessage(loadError)); }
    finally { setLoading(false); setRefreshing(false); }
  }, [mode]);
  useFocusEffect(useCallback(() => { setLoading(true); void load(); }, [load]));

  const create = async () => {
    if (!title.trim() || !content.trim()) { Alert.alert('입력 확인', '제목과 문의 내용을 모두 입력해 주세요.'); return; }
    setSaving(true);
    try { await inquiryService.create(title.trim(), content.trim()); setTitle(''); setContent(''); setFormOpen(false); await load(); }
    catch (createError) { Alert.alert('등록 실패', getErrorMessage(createError)); }
    finally { setSaving(false); }
  };

  const respond = async (inquiry: Inquiry, close = false) => {
    const response = responses[inquiry.id]?.trim();
    if (!response) { Alert.alert('답변 입력', '답변 내용을 입력해 주세요.'); return; }
    setSaving(true);
    try { await inquiryService.respond(inquiry.id, response, close); setResponses((current) => ({ ...current, [inquiry.id]: '' })); await load(); }
    catch (responseError) { Alert.alert('답변 실패', getErrorMessage(responseError)); }
    finally { setSaving(false); }
  };

  return <KeyboardAvoidingView style={CommonStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={[CommonStyles.headerSection, styles.header]}><View><Text style={CommonStyles.title}>문의</Text><Text style={styles.subtitle}>불편한 점이나 필요한 도움을 알려주세요.</Text></View>{mode === 'mine' ? <TouchableOpacity onPress={() => setFormOpen((open) => !open)} style={styles.newButton}><Text style={styles.newText}>{formOpen ? '닫기' : '문의하기'}</Text></TouchableOpacity> : null}</View>
    {student?.isAdmin ? <View style={styles.tabs}><TouchableOpacity onPress={() => setMode('mine')} style={[styles.tab, mode === 'mine' && styles.activeTab]}><Text style={[styles.tabText, mode === 'mine' && styles.activeTabText]}>내 문의</Text></TouchableOpacity><TouchableOpacity onPress={() => setMode('admin')} style={[styles.tab, mode === 'admin' && styles.activeTab]}><Text style={[styles.tabText, mode === 'admin' && styles.activeTabText]}>전체 문의</Text></TouchableOpacity></View> : null}
    <ScrollView keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />} contentContainerStyle={styles.content}>
      {formOpen && mode === 'mine' ? <View style={styles.form}><Text style={styles.formTitle}>새 문의</Text><Text style={styles.formNotice}>비밀번호, 전화번호 등 불필요한 개인정보는 적지 마세요.</Text><TextInput value={title} onChangeText={setTitle} maxLength={100} placeholder="문의 제목" style={styles.input} /><TextInput value={content} onChangeText={setContent} maxLength={5000} multiline textAlignVertical="top" placeholder="문의 내용을 자세히 적어주세요" style={[styles.input, styles.contentInput]} /><TouchableOpacity disabled={saving} onPress={() => void create()} style={styles.submit}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>문의 등록</Text>}</TouchableOpacity></View> : null}
      {loading ? <ActivityIndicator size="large" style={{ marginTop: 45 }} /> : null}
      {!loading && error ? <View style={styles.state}><Text style={styles.error}>{error}</Text><TouchableOpacity onPress={() => void load()}><Text style={styles.retry}>다시 시도</Text></TouchableOpacity></View> : null}
      {!loading && !error && inquiries.length === 0 ? <View style={styles.state}><Text style={styles.emptyTitle}>등록된 문의가 없습니다</Text></View> : null}
      {!loading && !error ? inquiries.map((inquiry) => <View key={inquiry.id} style={styles.card}>
        <View style={styles.cardTop}><Text style={[styles.status, styles[`status_${inquiry.status}`]]}>{statusText[inquiry.status]}</Text><Text style={styles.date}>{formatDate(inquiry.createdAt)}</Text></View>
        {mode === 'admin' && inquiry.student ? <Text style={styles.student}>{inquiry.student.username} · {inquiry.student.grade}학년 {inquiry.student.classNo}반 {inquiry.student.schoolNumber}번</Text> : null}
        <Text style={styles.title}>{inquiry.title}</Text><Text style={styles.body}>{inquiry.content}</Text>
        {inquiry.adminResponse ? <View style={styles.answer}><Text style={styles.answerLabel}>관리자 답변{inquiry.respondedAt ? ` · ${formatDate(inquiry.respondedAt)}` : ''}</Text><Text style={styles.answerBody}>{inquiry.adminResponse}</Text></View> : null}
        {mode === 'admin' ? <View style={styles.responseForm}><TextInput value={responses[inquiry.id] || ''} onChangeText={(value) => setResponses((current) => ({ ...current, [inquiry.id]: value }))} multiline maxLength={5000} placeholder="답변 입력" style={[styles.input, { minHeight: 80 }]} /><View style={styles.responseButtons}><TouchableOpacity disabled={saving} onPress={() => void respond(inquiry)} style={styles.answerButton}><Text style={styles.answerButtonText}>답변 저장</Text></TouchableOpacity><TouchableOpacity disabled={saving} onPress={() => void respond(inquiry, true)} style={styles.closeButton}><Text style={styles.closeText}>답변 후 종료</Text></TouchableOpacity></View></View> : null}
      </View>) : null}
    </ScrollView><BottomNav active="inquiries" />
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, subtitle: { marginTop: 7, color: '#6B7280', fontSize: 13 }, newButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 11, backgroundColor: '#111827' }, newText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, padding: 4, borderRadius: 12, backgroundColor: '#E5E7EB' }, tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 9 }, activeTab: { backgroundColor: '#FFFFFF' }, tabText: { color: '#6B7280', fontSize: 12, fontWeight: '700' }, activeTabText: { color: '#111827' }, content: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 25 },
  form: { marginBottom: 16, padding: 18, borderRadius: 17, backgroundColor: '#FFFFFF' }, formTitle: { color: '#111827', fontSize: 17, fontWeight: '900' }, formNotice: { marginTop: 6, marginBottom: 14, color: '#9A3412', fontSize: 11 }, input: { marginBottom: 11, padding: 13, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 11, backgroundColor: '#FFFFFF', color: '#111827' }, contentInput: { minHeight: 140 }, submit: { minHeight: 47, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#111827' }, submitText: { color: '#FFFFFF', fontWeight: '800' },
  card: { marginBottom: 12, padding: 18, borderRadius: 17, backgroundColor: '#FFFFFF' }, cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, status: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, fontSize: 10, fontWeight: '800' }, status_open: { color: '#92400E', backgroundColor: '#FEF3C7' }, status_answered: { color: '#166534', backgroundColor: '#DCFCE7' }, status_closed: { color: '#4B5563', backgroundColor: '#F3F4F6' }, date: { color: '#9CA3AF', fontSize: 10 }, student: { marginTop: 11, color: '#4F46E5', fontSize: 12, fontWeight: '800' }, title: { marginTop: 13, color: '#111827', fontSize: 17, fontWeight: '900' }, body: { marginTop: 8, color: '#4B5563', fontSize: 14, lineHeight: 21 }, answer: { marginTop: 15, padding: 14, borderRadius: 12, backgroundColor: '#EEF2FF' }, answerLabel: { color: '#4338CA', fontSize: 11, fontWeight: '900' }, answerBody: { marginTop: 7, color: '#374151', fontSize: 13, lineHeight: 20 }, responseForm: { marginTop: 15 }, responseButtons: { flexDirection: 'row', gap: 8 }, answerButton: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 10, backgroundColor: '#111827' }, answerButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' }, closeButton: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 10, backgroundColor: '#F3F4F6' }, closeText: { color: '#4B5563', fontSize: 12, fontWeight: '800' },
  state: { alignItems: 'center', marginTop: 30, padding: 28, borderRadius: 17, backgroundColor: '#FFFFFF' }, error: { color: '#B91C1C', textAlign: 'center' }, retry: { marginTop: 10, color: '#4F46E5', fontWeight: '800' }, emptyTitle: { color: '#111827', fontWeight: '800' },
});
