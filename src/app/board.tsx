import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { BoardPostSummary, boardService } from '../services/board';
import { getErrorMessage } from '../services/api';
import { legalService } from '../services/legal';
import { CommonStyles } from '../styles';
import { boardMembershipService, BoardMembership } from '../services/boardMemberships';
import { getCurrentStudent } from '../store/auth';

const formatDate = (value: string) => new Date(value).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function BoardScreen() {
  const [posts, setPosts] = useState<BoardPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState<boolean | null>(null);
  const [acceptingConsent, setAcceptingConsent] = useState(false);
  const [membership, setMembership] = useState<BoardMembership | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const student = getCurrentStudent();

  const load = useCallback(async () => {
    setError('');
    try {
      const [result, consent, membershipResult] = await Promise.all([boardService.list(1), legalService.status(), boardMembershipService.status()]);
      setPosts(result.posts); setPage(1); setHasMore(result.hasMore); setConsentAgreed(consent.agreed); setMembership(membershipResult);
      if (student?.isAdmin) setPendingCount((await boardMembershipService.pending()).length);
    }
    catch (loadError) { setError(getErrorMessage(loadError)); }
    finally { setLoading(false); setRefreshing(false); }
  }, [student?.isAdmin]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const result = await boardService.list(page + 1);
      setPosts((current) => [...current, ...result.posts]);
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (loadError) { setError(getErrorMessage(loadError)); }
    finally { setLoadingMore(false); }
  };

  const acceptConsent = async () => {
    setAcceptingConsent(true);
    try { await legalService.accept(); setConsentAgreed(true); }
    catch (consentError) { setError(getErrorMessage(consentError)); }
    finally { setAcceptingConsent(false); }
  };

  const write = () => {
    if (!consentAgreed || membership?.status !== 'approved') return;
    router.push('/boardEditor');
  };

  const requestMembership = async () => {
    setRequesting(true); setError('');
    try { await boardMembershipService.request(); setMembership(await boardMembershipService.status()); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setRequesting(false); }
  };

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <View style={CommonStyles.container}>
      <View style={[CommonStyles.headerSection, styles.header]}>
        <View><Text style={CommonStyles.title}>익명게시판</Text><Text style={styles.subtitle}>서로를 존중하며 자유롭게 이야기해요.</Text></View>
        <View style={styles.headerActions}>{student?.isAdmin ? <TouchableOpacity onPress={() => router.push('/boardApprovals')} style={styles.approvalButton}><Text style={styles.approvalText}>승인 요청{pendingCount ? ` ${pendingCount}` : ''}</Text></TouchableOpacity> : null}<TouchableOpacity accessibilityRole="button" disabled={!consentAgreed || membership?.status !== 'approved'} onPress={write} style={[styles.writeButton, (!consentAgreed || membership?.status !== 'approved') && styles.writeDisabled]}><Text style={styles.writeText}>글쓰기</Text></TouchableOpacity></View>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />} contentContainerStyle={styles.content}>
        {consentAgreed === false ? <View style={styles.consentCard}>
          <Text style={styles.consentTitle}>게시판 이용 동의가 필요합니다</Text>
          <Text style={styles.consentText}>게시글과 댓글은 학생에게 익명으로 표시되지만, 신고 처리와 안전한 운영을 위해 내부 작성자 ID가 계정과 연결됩니다. 권한이 있는 관리자는 운영 사유를 입력한 뒤 작성자를 확인할 수 있고 조회 기록이 남습니다. 회원 정보와 작성자 연결 정보는 회원 탈퇴 시까지 처리되며, 동의를 거부하면 게시판 작성 기능을 이용할 수 없습니다.</Text>
          <Text style={styles.consentText}>만 14세 미만이라면 법정대리인의 동의를 받은 후 진행해 주세요.</Text>
          <TouchableOpacity disabled={acceptingConsent} onPress={() => void acceptConsent()} style={styles.consentButton}>{acceptingConsent ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.consentButtonText}>필수 내용 확인 및 동의</Text>}</TouchableOpacity>
        </View> : null}
        {consentAgreed && membership && membership.status !== 'approved' ? <View style={styles.membershipCard}>
          <Text style={styles.consentTitle}>{membership.status === 'pending' ? '승인 요청을 확인하고 있습니다' : membership.status === 'suspended' ? '게시판 이용이 정지되었습니다' : membership.status === 'rejected' ? '이용 신청이 거절되었습니다' : '게시판 이용 신청'}</Text>
          <Text style={styles.consentText}>{membership.status === 'pending' ? '관리자가 승인하면 글과 댓글을 작성할 수 있습니다. 기다리는 동안 게시글은 읽을 수 있어요.' : membership.status === 'suspended' ? (membership.reviewNote || '자세한 내용은 운영자에게 문의해 주세요.') : membership.status === 'rejected' ? (membership.reviewNote || '사유를 확인한 뒤 다시 신청할 수 있습니다.') : '최초 한 번 이용 신청을 보내면 관리자가 학적 정보와 이름을 확인한 뒤 승인합니다.'}</Text>
          {(membership.status === 'not_requested' || membership.status === 'rejected') ? <TouchableOpacity disabled={requesting} onPress={() => void requestMembership()} style={styles.consentButton}>{requesting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.consentButtonText}>{membership.status === 'rejected' ? '다시 신청하기' : '이용 승인 신청'}</Text>}</TouchableOpacity> : null}
        </View> : null}
        {loading ? <ActivityIndicator size="large" style={styles.loader} /> : null}
        {!loading && error ? <View style={styles.state}><Text style={styles.error}>{error}</Text><TouchableOpacity onPress={() => void load()}><Text style={styles.retry}>다시 시도</Text></TouchableOpacity></View> : null}
        {!loading && !error && posts.length === 0 ? <View style={styles.state}><Text style={styles.emptyTitle}>아직 게시글이 없습니다</Text><Text style={styles.emptyCopy}>첫 이야기를 남겨보세요.</Text></View> : null}
        {!loading && !error ? posts.map((post) => (
          <Pressable key={post.id} onPress={() => router.push({ pathname: '/boardPost', params: { id: String(post.id) } })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <View style={styles.meta}><Text style={styles.anonymous}>{post.isMine ? '내가 쓴 글' : '익명'}</Text><Text style={styles.date}>{formatDate(post.createdAt)}</Text></View>
            <Text numberOfLines={1} style={styles.postTitle}>{post.title}</Text>
            <Text numberOfLines={2} style={styles.preview}>{post.content}</Text>
            <Text style={styles.comments}>댓글 {post.commentCount}</Text>
          </Pressable>
        )) : null}
        {!loading && !error && hasMore ? <TouchableOpacity disabled={loadingMore} onPress={() => void loadMore()} style={styles.moreButton}>{loadingMore ? <ActivityIndicator /> : <Text style={styles.moreText}>게시글 더 보기</Text>}</TouchableOpacity> : null}
      </ScrollView>
      <BottomNav active="board" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subtitle: { marginTop: 7, color: '#6B7280', fontSize: 13 },
  writeButton: { paddingHorizontal: 15, paddingVertical: 11, borderRadius: 12, backgroundColor: '#111827' },
  writeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  writeDisabled: { opacity: 0.35 },
  headerActions: { alignItems: 'flex-end', gap: 7 },
  approvalButton: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, backgroundColor: '#FEF3C7' },
  approvalText: { color: '#92400E', fontSize: 11, fontWeight: '800' },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 },
  loader: { marginTop: 50 },
  card: { marginBottom: 12, padding: 18, borderRadius: 17, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEF0F3' },
  pressed: { opacity: 0.7 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  anonymous: { color: '#4F46E5', fontSize: 12, fontWeight: '800' },
  date: { color: '#9CA3AF', fontSize: 11 },
  postTitle: { color: '#111827', fontSize: 17, fontWeight: '800' },
  preview: { marginTop: 7, color: '#4B5563', fontSize: 13, lineHeight: 19 },
  comments: { marginTop: 12, color: '#6B7280', fontSize: 11, fontWeight: '700' },
  state: { alignItems: 'center', marginTop: 32, padding: 28, borderRadius: 18, backgroundColor: '#FFFFFF' },
  error: { color: '#B91C1C', textAlign: 'center' }, retry: { marginTop: 12, color: '#4F46E5', fontWeight: '800' },
  emptyTitle: { color: '#111827', fontSize: 17, fontWeight: '800' }, emptyCopy: { marginTop: 7, color: '#6B7280' },
  moreButton: { alignItems: 'center', marginTop: 4, paddingVertical: 14, borderRadius: 12, backgroundColor: '#EEF2FF' },
  moreText: { color: '#4338CA', fontSize: 13, fontWeight: '800' },
  consentCard: { marginBottom: 14, padding: 17, borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 16, backgroundColor: '#EEF2FF' },
  consentTitle: { color: '#312E81', fontSize: 15, fontWeight: '900' },
  consentText: { marginTop: 8, color: '#4B5563', fontSize: 11, lineHeight: 17 },
  consentButton: { minHeight: 45, alignItems: 'center', justifyContent: 'center', marginTop: 13, borderRadius: 11, backgroundColor: '#4338CA' },
  consentButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  membershipCard: { marginBottom: 14, padding: 17, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, backgroundColor: '#FFFFFF' },
});
