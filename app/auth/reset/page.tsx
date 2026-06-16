import { Suspense } from 'react';
import { ResetPasswordScreen } from '@/src/screens/Auth/ResetPasswordScreen';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordScreen />
    </Suspense>
  );
}
