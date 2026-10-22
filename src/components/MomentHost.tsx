import { useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { Stamp, StampLanding } from '@/src/components/stamp/Stamp';
import { usePlayer } from '@/src/state/PlayerContext';
import { useTheme } from '@/src/theme/ThemeProvider';
import { PACK_LOOK } from '@/src/data/packMeta';
import { PACK_UNLOCKS } from '@/src/data/levels';
import { radius, shadow } from '@/src/theme/tokens';
import { sfx } from '@/src/lib/sfx';
import { haptic } from '@/src/lib/haptics';

// Level-ups and pack unlocks, shown over whatever screen earned them.
export function MomentHost() {
  const { c, ink } = useTheme();
  const p = usePlayer();
  const level = p.moments.find((m) => m.kind === 'level');
  const pack = p.moments.find((m) => m.kind === 'pack');
  const visible = p.moments.length > 0;

  useEffect(() => {
    if (!visible) return;
    if (pack) sfx.unlock();
    else {
      sfx.correct();
      haptic.success();
    }
  }, [visible, pack]);

  const close = () => p.moments.forEach(() => p.dismissMoment());
  const nextPack = level?.kind === 'level' ? PACK_UNLOCKS.find((x) => x.xp > p.xp) : undefined;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <View style={[styles.root, { backgroundColor: c.overlay }]}>
        <Animated.View entering={ZoomIn.springify().damping(16)} style={[styles.card, { backgroundColor: c.surface }, shadow.raised]}>
          {level?.kind === 'level' && (
            <View style={styles.center}>
              <Text variant="label" style={{ color: c.gold }}>Level up</Text>
              <Text variant="display" style={{ color: c.gold, fontSize: 64, lineHeight: 82 }} tabular>
                {level.level}
              </Text>
              {!pack && (
                <Text variant="body" color="inkMuted" center>
                  {nextPack ? `${nextPack.xp - p.xp} XP more opens the ${nextPack.name} pack in SoundDeck.` : 'Every SoundDeck pack is open.'}
                </Text>
              )}
            </View>
          )}
          {pack?.kind === 'pack' && (
            <View style={styles.center}>
              <StampLanding run delay={level ? 350 : 120}>
                <Stamp
                  shape="circle"
                  ink={ink(PACK_LOOK[pack.packId].region)}
                  place={PACK_LOOK[pack.packId].stamp}
                  glyph={PACK_LOOK[pack.packId].glyph}
                  date={Date.now()}
                  size={150}
                  rotate={-5}
                />
              </StampLanding>
              <Animated.View entering={FadeIn.delay(500)} style={styles.center}>
                <Text variant="h2" center>{pack.name} pack unlocked</Text>
                <Text variant="body" color="inkMuted" center>
                  New pads and a new keyboard voice are waiting in SoundDeck.
                </Text>
              </Animated.View>
            </View>
          )}
          <View style={{ gap: 8, alignSelf: 'stretch', marginTop: 8 }}>
            {pack?.kind === 'pack' && (
              <Button
                label="Open SoundDeck"
                onPress={() => {
                  close();
                  if (router.canDismiss()) router.dismissAll();
                  router.navigate({ pathname: '/deck', params: { pack: pack.packId } });
                }}
              />
            )}
            <Button label={pack ? 'Later' : 'Keep going'} variant={pack ? 'ghost' : 'primary'} onPress={close} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 380, borderRadius: radius.xl, padding: 24, alignItems: 'center', gap: 12 },
  center: { alignItems: 'center', gap: 8 },
});
