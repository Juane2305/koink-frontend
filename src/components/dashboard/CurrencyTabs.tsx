import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface Props {
  currency: "ARS" | "USD";
  onChange: (currency: "ARS" | "USD") => void;
}

export const CurrencyTabs = ({ currency, onChange }: Props) => {
  return (
    <div className="flex p-1 bg-slate-100 rounded-lg max-w-fit mb-6">
      <Button
        variant="ghost"
        onClick={() => onChange("ARS")}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-all",
          currency === "ARS"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-slate-500 hover:text-slate-700 bg-transparent hover:bg-transparent",
        )}
      >
        🇦🇷 Pesos
      </Button>
      <Button
        variant="ghost"
        onClick={() => onChange("USD")}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-all",
          currency === "USD"
            ? "bg-white text-indigo-600 shadow-sm"
            : "text-slate-500 hover:text-slate-700 bg-transparent hover:bg-transparent",
        )}
      >
        🇺🇸 Dólares
      </Button>
    </div>
  );
};
