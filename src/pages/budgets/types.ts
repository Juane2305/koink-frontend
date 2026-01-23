export type BudgetPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "ANNUAL";

export interface Budget {
  id: string;
  categoryName: string;
  categoryId: number | string;
  limitAmount: number;
  spentAmount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  currency: string;
}
