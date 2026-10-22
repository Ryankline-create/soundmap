import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { BookOpenIcon, CardsIcon, FadersIcon, GlobeHemisphereWestIcon, NewspaperIcon, type Icon } from './icons';
import { useTheme } from '@/src/theme/ThemeProvider';

// Local shape of the props expo-router's Tabs passes to tabBar, so we don't
// import types from @react-navigation/bottom-tabs.
export type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

const TABS: Record<string, { label: string; icon: Icon }> = {
  play: { label: 'Play', icon: GlobeHemisphereWestIcon },
  lessons: { label: 'Lessons', icon: BookOpenIcon },
  learn: { label: 'Learn', icon: CardsIcon },
  trending: { label: 'Trending', icon: NewspaperIcon },
  deck: { label: 'SoundDeck', icon: FadersIcon },
};

export function TabBar({ state, navigation }: TabBarProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { backgroundColor: c.surface, borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === i;
        const color = focused ? c.primary : c.inkFaint;
        const TabIcon = tab.icon;
        return (
          <PressableScale
            key={route.key}
            feedback="select"
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            onPress={() => {
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
            }}
            style={styles.item}
          >
            <View style={[styles.tick, { backgroundColor: focused ? c.primary : 'transparent' }]} />
            <TabIcon size={24} color={color} weight={focused ? 'fill' : 'regular'} />
            <Text
              variant="label"
              numberOfLines={1}
              style={{ color, fontSize: 10, letterSpacing: 0.4, textTransform: 'none', fontFamily: focused ? undefined : 'HankenGrotesk_600SemiBold' }}
            >
              {tab.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 4 },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingTop: 2, minHeight: 52 },
  tick: { width: 18, height: 3, borderRadius: 2, marginBottom: 3 },
});
