import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { BoardPost, boardService } from '../services/board';
import { getErrorMessage } from '../services/api';
import { getCurrentStudent } from '../store/auth';
import { boardMembershipService } from '../services/boardMemberships';

const formatDate = (value: string) => new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function BoardPostScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const postId = Number(Array.isArray(id) ? id[0] : id);
  const [post, setPost] = useState<BoardPost | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [canWrite, setCanWrite] = useState(false);
  const student = getCurrentStudent();

  const load = useCallback(async () => {
    if (!Number.isInteger(postId) || postId <= 0) { setError('올바르지 않은 게시글입니다.'); setLoading(false); return; }
    try { const [postResult, membership] = await Promise.all([boardService.get(postId), boardMembershipService.status()]); setPost(postResult); setCanWrite(membership.status === 'approved'); setError(''); }
    catch (loadError) { setError(getErrorMessage(loadError)); }
    finally { setLoading(false); }
  }, [postId]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const addComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try { await boardService.comment(postId, comment.trim()); setComment(''); await load(); }
    catch (submitError) { Alert.alert('댓글 등록 실패', getErrorMessage(submitError)); }
    finally { setSubmitting(false); }
  };

  const removePost = () => Alert.alert('게시글 삭제', '이 게시글을 삭제할까요?', [{ text: '취소', style: 'cancel' }, { text: '삭제', style: 'destructive', onPress: async () => {
    try { await boardService.remove(postId); router.replace('/board'); } catch (removeError) { Alert.alert('삭제 실패', getErrorMessage(removeError)); }
  } }]);

  const removeComment = (commentId: number) => Alert.alert('댓글 삭제', '이 댓글을 삭제할까요?', [{ text: '취소', style: 'cancel' }, { text: '삭제', style: 'destructive', onPress: async () => {
    try { await boardService.removeComment(commentId); await load(); } catch (removeError) { Alert.alert('삭제 실패', getErrorMessage(removeError)); }
  } }]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.top}><TouchableOpacity onPress={() => router.replace('/board')}><Text style={styles.back}>‹ 게시판</Text></TouchableOpacity></View>
      {loading ? <ActivityIndicator size="large" style={{ flex: 1 }} /> : error || !post ? <View style={styles.state}><Text style={styles.error}>{error}</Text></View> : (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.postCard}>
            <View style={styles.meta}><Text style={styles.anonymous}>{post.isMine ? '내가 쓴 글' : '익명'}</Text><Text style={styles.date}>{formatDate(post.createdAt)}</Text></View>
            <Text style={styles.title}>{post.title}</Text><Text style={styles.body}>{post.content}</Text>
            <View style={styles.actions}>
              {post.isMine ? <><TouchableOpacity onPress={() => router.push({ pathname: '/boardEditor', params: { id: String(postId) } })}><Text style={styles.action}>수정</Text></TouchableOpacity><TouchableOpacity onPress={removePost}><Text style={styles.delete}>삭제</Text></TouchableOpacity></> : null}
              {student?.isAdmin ? <TouchableOpacity onPress={() => router.push({ pathname: '/boardAdmin', params: { id: String(postId) } })}><Text style={styles.admin}>관리자 확인</Text></TouchableOpacity> : null}
            </View>
          </View>
          <Text style={styles.commentHeading}>댓글 {post.comments.length}</Text>
          {post.comments.map((item) => <View key={item.id} style={styles.commentCard}><View style={styles.meta}><Text style={styles.commentNickname}>{item.nickname}{item.isMine ? ' · 나' : ''}</Text><Text style={styles.date}>{formatDate(item.createdAt)}</Text></View><Text style={styles.commentBody}>{item.content}</Text>{item.isMine ? <TouchableOpacity onPress={() => removeComment(item.id)}><Text style={styles.commentDelete}>삭제</Text></TouchableOpacity> : null}</View>)}
          {canWrite ? <View style={styles.commentForm}><TextInput value={comment} onChangeText={setComment} maxLength={500} multiline placeholder="익명으로 댓글을 남겨보세요" style={styles.commentInput} /><TouchableOpacity disabled={submitting || !comment.trim()} onPress={() => void addComment()} style={styles.commentButton}><Text style={styles.commentButtonText}>등록</Text></TouchableOpacity></View> : <Text style={styles.approvalNotice}>댓글 작성은 게시판 이용 승인 후 가능합니다.</Text>}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FB' }, top: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 14 }, back: { color: '#4F46E5', fontSize: 16, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: 40 }, postCard: { padding: 21, borderRadius: 18, backgroundColor: '#FFFFFF' }, meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, anonymous: { color: '#4F46E5', fontSize: 12, fontWeight: '800' }, date: { color: '#9CA3AF', fontSize: 10 },
  title: { marginTop: 15, color: '#111827', fontSize: 21, fontWeight: '900' }, body: { marginTop: 14, color: '#374151', fontSize: 15, lineHeight: 24 }, actions: { flexDirection: 'row', gap: 16, marginTop: 22 }, action: { color: '#4F46E5', fontSize: 12, fontWeight: '700' }, delete: { color: '#DC2626', fontSize: 12, fontWeight: '700' }, admin: { color: '#9A3412', fontSize: 12, fontWeight: '800' },
  commentHeading: { marginTop: 25, marginBottom: 10, color: '#111827', fontSize: 16, fontWeight: '800' }, commentCard: { marginBottom: 8, padding: 15, borderRadius: 14, backgroundColor: '#FFFFFF' }, commentNickname: { color: '#4F46E5', fontSize: 12, fontWeight: '800' }, commentBody: { marginTop: 8, color: '#374151', fontSize: 14, lineHeight: 20 }, commentDelete: { marginTop: 8, color: '#DC2626', fontSize: 11, fontWeight: '700' },
  commentForm: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 12 }, commentInput: { flex: 1, minHeight: 48, maxHeight: 120, padding: 13, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 13, backgroundColor: '#FFFFFF' }, commentButton: { paddingHorizontal: 16, paddingVertical: 15, borderRadius: 12, backgroundColor: '#111827' }, commentButtonText: { color: '#FFFFFF', fontWeight: '800' },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, error: { color: '#B91C1C', textAlign: 'center' },
  approvalNotice: { marginTop: 16, padding: 13, borderRadius: 12, backgroundColor: '#FEF3C7', color: '#92400E', fontSize: 12, textAlign: 'center' },
});
