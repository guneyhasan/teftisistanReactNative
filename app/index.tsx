import { Redirect } from 'expo-router';
import { useAuthStore } from '@src/stores/authStore';

const IndexScreen = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(main)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
};

export default IndexScreen;
