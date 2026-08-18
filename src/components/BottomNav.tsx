import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { CommonStyles } from '../styles';

export default function BottomNav({ active, beforeNavigate }: { active: string; beforeNavigate?: (navigate: () => void) => void }) {
  const navigate = (path: '/schedules' | '/courseSelect' | '/profile') => {
    const action = () => router.push(path);
    beforeNavigate ? beforeNavigate(action) : action();
  };
  return (
    <View style={CommonStyles.bottomNavMain}>
      <NavItem
        label="시간표"
        active={active === 'schedule'}
        onPress={() => navigate('/schedules')}
      />

      <NavItem
        label="과목 설정"
        active={active === 'course'}
        onPress={() => navigate('/courseSelect')}
      />

      <NavItem
        label="내 정보"
        active={active === 'profile'}
        onPress={() => navigate('/profile')}
      />
    </View>
  );
}

function NavItem({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={CommonStyles.bottomNavItem}>
      <Text
        style={[
          active
            ? CommonStyles.bottomNavItemTextActive
            : CommonStyles.bottomNavItemText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
