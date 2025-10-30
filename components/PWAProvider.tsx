'use client';

import PWAInstallPrompt from './PWAInstallPrompt';
import PWARegister from './PWARegister';

export default function PWAProvider() {
  return (
    <>
      <PWARegister />
      <PWAInstallPrompt />
    </>
  );
}
