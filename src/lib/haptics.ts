import * as Haptics from 'expo-haptics';

// Light on pad hits and taps, Medium on correct answers, Heavy on stamps,
// Warning on a wrong guess.
const safe = (p: Promise<void>) => p.catch(() => {});

export const haptic = {
  tap: () => safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  correct: () => safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  stamp: () => safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  wrong: () => safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  select: () => safe(Haptics.selectionAsync()),
  success: () => safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
