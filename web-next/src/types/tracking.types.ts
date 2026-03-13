export interface TrackingEvent {
  id: string;
  action: string;
  userId: string;
  payload?: string;
  userAgent?: string;
  userLocation?: string;
  frontendVersion?: string;
  createdAt: string;
}