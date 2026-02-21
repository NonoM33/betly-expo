// Services barrel export

export { analytics, AnalyticsEvents } from './analytics';
export { revenueCat, PRODUCTS, ENTITLEMENTS } from './revenueCat';
export type { Product, Offering, CustomerInfo } from './revenueCat';
export { deepLinks } from './deepLinks';
export type { DeepLinkResult } from './deepLinks';
export { localNotifications } from './notifications';
export { oneSignal } from './oneSignal';
export type { NotificationData } from './oneSignal';
export { rateApp } from './rateApp';

// Initialize all services
export async function initializeServices(): Promise<void> {
  const { analytics } = await import('./analytics');
  const { revenueCat } = await import('./revenueCat');
  const { deepLinks } = await import('./deepLinks');
  const { localNotifications } = await import('./notifications');
  const { oneSignal } = await import('./oneSignal');

  await Promise.all([
    analytics.initialize(),
    revenueCat.initialize(),
    deepLinks.initialize(),
    localNotifications.initialize(),
    oneSignal.initialize(),
  ]);

  console.log('[Services] All services initialized');
}
