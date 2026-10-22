import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { YoungSerif_400Regular } from '@expo-google-fonts/young-serif';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
} from '@expo-google-fonts/hanken-grotesk';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { PlayerProvider, usePlayer } from '@/src/state/PlayerContext';
import { LearnProvider, useLearn } from '@/src/state/LearnContext';
import { DeckProvider, useDeck } from '@/src/state/DeckContext';
import { ThemeProvider, useTheme } from '@/src/theme/ThemeProvider';
import { MomentHost } from '@/src/components/MomentHost';
import { SoundEngine } from '@/src/audio/SoundEngine';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    YoungSerif_400Regular,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PlayerProvider>
          <LearnProvider>
            <DeckProvider>
              <Themed fontsLoaded={fontsLoaded} />
            </DeckProvider>
          </LearnProvider>
        </PlayerProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Themed({ fontsLoaded }: { fontsLoaded: boolean }) {
  const player = usePlayer();
  return (
    <ThemeProvider mode={player.theme}>
      <Root fontsLoaded={fontsLoaded} />
    </ThemeProvider>
  );
}

function Root({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { c, scheme } = useTheme();
  const player = usePlayer();
  const learn = useLearn();
  const deck = useDeck();
  const ready = fontsLoaded && player.ready && learn.ready && deck.ready;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // sets the audio session (plays in iOS silent mode) before the first sound
  useEffect(() => {
    SoundEngine.init();
  }, []);

  useEffect(() => {
    SoundEngine.setEnabled(player.sound);
  }, [player.sound]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="quiz/[id]" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
      <MomentHost />
    </>
  );
}
