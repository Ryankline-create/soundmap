import { Tabs } from 'expo-router';
import { TabBar, type TabBarProps } from '@/src/components/ui/TabBar';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...(props as unknown as TabBarProps)} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}
    >
      <Tabs.Screen name="play" />
      <Tabs.Screen name="lessons" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="trending" />
      <Tabs.Screen name="deck" />
    </Tabs>
  );
}
