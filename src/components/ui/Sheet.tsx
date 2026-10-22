import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/ThemeProvider';
import { radius } from '@/src/theme/tokens';

type Props = { visible: boolean; onClose: () => void; children: ReactNode; scroll?: boolean };

// Bottom sheet. Android back closes it (onRequestClose).
export function Sheet({ visible, onClose, children, scroll }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={[styles.fill, { backgroundColor: c.overlay }]} onPress={onClose} accessibilityLabel="Close" />
        <Animated.View
          entering={SlideInDown.springify().damping(22).stiffness(220)}
          style={[styles.sheet, { backgroundColor: c.surface, paddingBottom: insets.bottom + 20, maxHeight: '88%' }]}
        >
          <View style={[styles.handle, { backgroundColor: c.borderStrong }]} />
          {scroll ? <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView> : children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: 20, paddingTop: 10 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 14 },
});
