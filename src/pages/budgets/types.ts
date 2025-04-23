export type BudgetPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "ANNUAL";

export interface Budget {
    id: number;
    categoryId: number;
    categoryName: string;
    period: BudgetPeriod;
    limitAmount: number;
    spentAmount: number;
    startDate: string;
    endDate: string;
  }