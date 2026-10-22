import type { ReactNode, Ref } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';
import { AppHeader } from './AppHeader';
import { Text } from './Text';

type Props = {
  children: ReactNode;
  // tab screens show the Passport · Level · Streak header
  hud?: boolean;
  scroll?: boolean;
  // stack screens sit above the system nav bar; tab screens above the tab bar
  bottomInset?: boolean;
  scrollProps?: ScrollViewProps;
  scrollRef?: Ref<ScrollView>;
  bg?: string;
  // floats above the content (toasts)
  overlay?: ReactNode;
};

export function Screen({ children, hud, scroll = true, bottomInset, scrollProps, scrollRef, bg, overlay }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const pb = (bottomInset ? insets.bottom : 0) + 28;
  return (
    <View style={[styles.root, { backgroundColor: bg ?? c.bg, paddingTop: insets.top }]}>
      {hud && <AppHeader />}
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          {...scrollProps}
          contentContainerStyle={[{ paddingBottom: pb }, scrollProps?.contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingBottom: bottomInset ? insets.bottom : 0 }}>{children}</View>
      )}
      {overlay}
    </View>
  );
}

// Uppercase kicker + Young Serif title, the top of every screen.
export function ScreenTitle({ kicker, title, sub, color }: { kicker: string; title: string; sub?: string; color?: string }) {
  const { c } = useTheme();
  return (
    <View style={styles.title}>
      <Text variant="label" style={{ color: color ?? c.primary }}>{kicker}</Text>
      <Text variant="h1" accessibilityRole="header">{title}</Text>
      {sub ? <Text variant="body" color="inkMuted">{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, gap: 4 },
});
