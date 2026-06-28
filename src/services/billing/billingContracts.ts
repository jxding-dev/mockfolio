import type { PlanId } from '../../types';

export type BillingRouteState = 'upgrade' | 'subscription' | 'invoice' | 'success' | 'failure' | 'cancel';

export interface CheckoutRequest {
  planId: Exclude<PlanId, 'free'>;
  returnUrl: string;
  cancelUrl: string;
}

export interface BillingService {
  createCheckout(request: CheckoutRequest): Promise<string>;
  openCustomerPortal(): Promise<string>;
}

export const paymentProviderLabel = 'Toss Payments';

