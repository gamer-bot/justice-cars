import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `₦${price.toLocaleString("en-NG")}`;
}

export function loanCalc(price: number, downPct: number, interestPct: number, months: number): number {
  const principal = price * (1 - downPct / 100);
  if (principal <= 0 || months <= 0) return 0;
  if (interestPct === 0) return principal / months;
  const monthlyRate = interestPct / 100 / 12;
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(payment);
}
