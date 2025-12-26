export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period?: 'month' | 'year' | 'project' | 'unit';
  features: string[];
  recommended?: boolean;
}

export interface DesignServiceOption {
  id: string;
  name: string;
  price: number;
  description: string;
  recommended?: boolean;
}

export type QuantityTier = '1' | '2-3' | '4-6' | '>=6';

export interface BatchOption {
  id: string;
  name: string;
  rangeLabel: string;
  min: number;
  max: number;
  baseMultiplier: number; // For cost calculation
  features: string[];
}

// Handler function type
export type PaymentIntentHandler = (
  planType: string,
  amount: number | string,
  details: any
) => void;
