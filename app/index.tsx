import { Redirect } from 'expo-router';
import { usePlayer } from '@/src/state/PlayerContext';

export default function Index() {
  const { onboarded } = usePlayer();
  return <Redirect href={onboarded ? '/play' : '/hook'} />;
}
