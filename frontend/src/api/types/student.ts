export interface Card {
  id: number;
  balance: number;
  frozen_balance: number;
  valid_to?: string;
  valid_balance_to?: string;
}
