import type { ReactNode } from 'react';
import AuthGuard from '../../components/AuthGuard';

export default function KitchenLayout({ children }: { children: ReactNode }) {
  return <AuthGuard roles={['cook', 'admin']}>{children}</AuthGuard>;
}