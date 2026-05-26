import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { CommonStyles } from '../app/styles';

export default function BottomNav({ active }: { active: string }) {
  return (
    <View style={CommonStyles.bottomNavMain}>
      <NavItem
        label="시간표"
        active={active === 'schedule'}
        onPress={() => router.push('/schedules')}
      />

      <NavItem
        label="과목 설정"
        active={active === 'course'}
        onPress={() => router.push('/courseSelect')}
      />

      <NavItem
        label="내 정보"
        active={active === 'profile'}
        onPress={() => router.push('/profile')}
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