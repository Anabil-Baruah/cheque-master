'use client';
import { Suspense } from 'react';
import { ChequesPage } from '@/views/Cheques';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ChequesPage />
    </Suspense>
  );
}
