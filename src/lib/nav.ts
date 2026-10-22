import { router } from 'expo-router';

// Forward moves use router.push; back falls through to home when there's no
// history (deep links, after a replace), which avoids "GO_BACK not handled".
export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
