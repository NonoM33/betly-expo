import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function NewsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.backgroundPrimary },
        headerTintColor: Colors.textPrimary,
        contentStyle: { backgroundColor: Colors.backgroundPrimary },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
