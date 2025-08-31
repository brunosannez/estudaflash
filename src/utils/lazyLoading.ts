import { lazy, Suspense } from 'react';
import { PageLoading } from '@/components/common/LoadingStates';

// Lazy load major pages for better performance
export const LazyUpload = lazy(() => import('@/pages/Upload'));
export const LazyMyFlashcards = lazy(() => import('@/pages/MyFlashcards'));
export const LazyMyProgress = lazy(() => import('@/pages/MyProgress'));
export const LazySocial = lazy(() => import('@/pages/Social'));
export const LazyAdminPanel = lazy(() => import('@/pages/AdminPanel'));