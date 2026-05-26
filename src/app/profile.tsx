import { Text, TouchableOpacity, View } from 'react-native';

import BottomNav from '../components/BottomNav';
import { CommonStyles } from './styles';

export default function ProfileScreen() {
  return (
    <View style={CommonStyles.container}>
      {/* 상단 */}
      <View style={CommonStyles.headerSectionLarge}>
        <Text style={CommonStyles.title}>내 정보</Text>
      </View>

      {/* 프로필 카드 */}
      <View style={CommonStyles.profileCard}>
        {/* 프로필 */}
        <View style={CommonStyles.profileSection}>
          {/* 프로필 아이콘 */}
          <View style={CommonStyles.profileIcon}>
            <Text style={CommonStyles.profileIconEmoji}>👤</Text>
          </View>

          <Text style={CommonStyles.profileName}>홍길동</Text>
          <Text style={CommonStyles.profileSubtitle}>2학년 3반</Text>
        </View>

        {/* 정보 영역 */}
        <InfoRow label="아이디" value="hong123" />
        <InfoRow label="학년" value="2학년" />
        <InfoRow label="반" value="3반" />
      </View>

      {/* 수정 버튼 */}
      <TouchableOpacity style={CommonStyles.editButton}>
        <Text style={CommonStyles.editButtonText}>정보 수정</Text>
      </TouchableOpacity>

      {/* 하단 네비게이션 */}
      <View style={CommonStyles.bottomNavContainer}>
        <BottomNav active="profile" />
      </View>
    </View>
  );
}

/* 헬퍼 컴포넌트 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={CommonStyles.infoRow}>
      <Text style={CommonStyles.infoLabel}>{label}</Text>
      <Text style={CommonStyles.infoValue}>{value}</Text>
    </View>
  );
}