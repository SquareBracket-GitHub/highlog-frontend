import { StyleSheet } from 'react-native';

export const CommonStyles = StyleSheet.create({
  // ===== 기본 컨테이너 =====
  container: {
    flex: 1,
    backgroundColor: '#F9F9FB',
  },
  
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F9F9FB',
  },

  // ===== 헤더/제목 =====
  headerSection: {
    paddingTop: 70,
    paddingHorizontal: 24,
    marginBottom: 24,
  },

  headerSectionLarge: {
    paddingTop: 70,
    paddingHorizontal: 24,
    marginBottom: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111',
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
  },

  // ===== 로그인 화면 =====
  loginMainContainer: {
    flex: 1,
    backgroundColor: '#F9F9FB',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },

  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#4F46E5',
    letterSpacing: 1,
  },

  logoSubtitle: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },

  inputSection: {
    marginBottom: 16,
  },

  inputSectionLarge: {
    marginBottom: 28,
  },

  inputLabel: {
    marginBottom: 8,
    fontSize: 13,
    color: '#444',
  },

  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
  },

  inputWithMargin: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: 'black',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  primaryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },

  secondaryText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
  },

  helpText: {
    fontSize: 12,
    color: '#AAA',
  },

  // ===== 회원가입 화면 =====
  registerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111',
  },

  registerTitleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },

  // ===== 프로필 화면 =====
  profileCard: {
    marginHorizontal: 24,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  profileSection: {
    alignItems: 'center',
    marginBottom: 28,
  },

  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  profileIconEmoji: {
    fontSize: 34,
  },

  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111',
  },

  profileSubtitle: {
    fontSize: 15,
    color: '#666',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  infoLabel: {
    color: '#777',
    fontSize: 14,
  },

  infoValue: {
    color: '#111',
    fontSize: 14,
    fontWeight: '500',
  },

  editButton: {
    marginHorizontal: 24,
    backgroundColor: 'black',
    paddingVertical: 16,
    borderRadius: 14,
  },

  editButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },

  bottomNavContainer: {
    marginTop: 'auto',
  },

  // ===== 과목선택 화면 =====
  courseItemSelected: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#4F46E5',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  courseItemUnselected: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  courseText: {
    fontSize: 16,
    fontWeight: '600',
  },

  courseTextSelected: {
    color: 'white',
  },

  courseTextUnselected: {
    color: '#111',
  },

  courseSubtext: {
    marginTop: 6,
    fontSize: 13,
  },

  courseSubtextSelected: {
    color: '#E0E7FF',
  },

  courseSubtextUnselected: {
    color: '#777',
  },

  saveButton: {
    backgroundColor: 'black',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 30,
  },

  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },

  // ===== 시간표 화면 =====
  cellBase: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cellHeader: {
    backgroundColor: '#F3F4F6',
  },

  cellSide: {
    backgroundColor: '#FAFAFA',
  },

  cellDefault: {
    backgroundColor: 'white',
  },

  cellText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },

  cellTextHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },

  subjectCellTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
    color: '#222',
    paddingHorizontal: 4,
  },

  subjectCellPlace: {
    marginTop: 4,
    fontSize: 11,
    textAlign: 'center',
    color: '#555',
  },

  subjectTypePattern: {
    position: 'absolute',
    top: 3,
    right: 3,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },

  subjectTypePatternSelected: {
    borderStyle: 'dashed',
  },

  subjectTypePatternCommon: {
    borderStyle: 'solid',
    borderWidth: 2,
  },

  subjectTypeText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '800',
  },

  subjectCellText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#222',
    paddingHorizontal: 4,
  },

  // ===== 공통 유틸 =====
  navItem: {
    alignItems: 'center',
  },

  navItemText: {
    fontSize: 13,
    fontWeight: '500',
  },

  navItemTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },

  centerAlign: {
    alignItems: 'center',
  },

  flexRow: {
    flexDirection: 'row',
  },

  // ===== BottomNav =====
  bottomNavMain: {
    height: 85,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  bottomNavItem: {
    alignItems: 'center',
  },

  bottomNavItemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
  },

  bottomNavItemTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
});

// ===== 과목 색상 맵 =====
export const SubjectColors: { [key: string]: string } = {
  수학: '#FDE68A',
  영어: '#FCD34D',
  국어: '#BBF7D0',
  물리: '#BFDBFE',
  생명: '#C7F9CC',
  체육: '#E9D5FF',
};

export const getSubjectColor = (subject: string): string => {
  for (const [key, color] of Object.entries(SubjectColors)) {
    if (subject.includes(key)) {
      return color;
    }
  }
  return 'white';
};
