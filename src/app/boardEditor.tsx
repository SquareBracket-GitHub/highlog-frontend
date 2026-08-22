import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { boardService } from '../services/board';
import { getErrorMessage } from '../services/api';

export default function BoardEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const postId = Number(Array.isArray(id) ? id[0] : id);
  const editing = Number.isInteger(postId) && postId > 0;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) return;
    boardService.get(postId).then((post) => { setTitle(post.title); setContent(post.content); })
      .catch((loadError) => setError(getErrorMessage(loadError))).finally(() => setLoading(false));
  }, [editing, postId]);

  const save = async () => {
    if (!title.trim() || !content.trim()) { setError('제목과 내용을 모두 입력해 주세요.'); return; }
    setSaving(true); setError('');
    try {
      const result = editing ? await boardService.update(postId, { title: title.trim(), content: content.trim() }) : await boardService.create({ title: title.trim(), content: content.trim() });
      router.replace({ pathname: '/boardPost', params: { id: String(result.id) } });
    } catch (saveError) { setError(getErrorMessage(saveError)); setSaving(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>‹ 게시판</Text></TouchableOpacity>
        <Text style={styles.heading}>{editing ? '게시글 수정' : '익명으로 글쓰기'}</Text>
        <Text style={styles.notice}>다른 학생에게 신원은 공개되지 않습니다. 운영자는 신고 대응을 위해 작성자를 확인할 수 있습니다.</Text>
        {loading ? <ActivityIndicator size="large" /> : <>
          <Text style={styles.label}>제목</Text><TextInput value={title} onChangeText={setTitle} maxLength={100} placeholder="제목을 입력하세요" style={styles.input} />
          <Text style={styles.label}>내용</Text><TextInput value={content} onChangeText={setContent} maxLength={5000} placeholder="서로를 존중하는 글을 작성해 주세요" multiline textAlignVertical="top" style={[styles.input, styles.contentInput]} />
          <Text style={styles.counter}>{content.length}/5000</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity disabled={saving} onPress={() => void save()} style={[styles.save, saving && { opacity: 0.5 }]}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>{editing ? '수정 저장' : '등록하기'}</Text>}</TouchableOpacity>
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FB' }, content: { padding: 24, paddingTop: 56, paddingBottom: 40 },
  back: { color: '#4F46E5', fontSize: 16, fontWeight: '700' }, heading: { marginTop: 22, color: '#111827', fontSize: 28, fontWeight: '900' },
  notice: { marginTop: 9, marginBottom: 26, padding: 13, color: '#6B7280', fontSize: 12, lineHeight: 18, borderRadius: 12, backgroundColor: '#EEF2FF' },
  label: { marginBottom: 8, color: '#374151', fontSize: 13, fontWeight: '800' }, input: { marginBottom: 20, padding: 15, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 13, backgroundColor: '#FFFFFF', color: '#111827', fontSize: 15 },
  contentInput: { minHeight: 220 }, counter: { marginTop: -14, marginBottom: 16, color: '#9CA3AF', fontSize: 11, textAlign: 'right' },
  error: { marginBottom: 12, color: '#B91C1C', textAlign: 'center' }, save: { minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#111827' }, saveText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
