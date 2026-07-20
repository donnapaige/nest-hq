import { Suspense } from 'react';
import { LoginScreen } from '@/src/screens/Auth/LoginScreen';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginScreen />
    </Suspense>
  );
}
