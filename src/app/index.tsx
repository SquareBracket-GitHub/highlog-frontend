import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { restoreSession } from '../store/auth';

export default function Index() {
  const [destination, setDestination] = useState<'/login' | '/schedules' | null>(null);

  useEffect(() => {
    restoreSession().then((restored) => setDestination(restored ? '/schedules' : '/login'));
  }, []);

  if (!destination) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  }
  return <Redirect href={destination} />;
}
