import { clsx } from "clsx";
import type { OverallStatus, NutrientStatus } from "../../convex/lib/tolerances";

interface StatusBadgeProps {
  status: OverallStatus | NutrientStatus;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    CUMPLE: { label: "Cumple", className: "bg-green-100 text-green-800 border-green-300" },
    NO_CUMPLE: { label: "No Cumple", className: "bg-red-100 text-red-800 border-red-300" },
    CUMPLE_S: { label: "Cumple (S)", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    SIN_OBJETIVO: { label: "Sin Objetivo", className: "bg-gray-100 text-gray-800 border-gray-300" },
    C: { label: "C", className: "bg-green-100 text-green-800 border-green-300" },
    NC: { label: "NC", className: "bg-red-100 text-red-800 border-red-300" },
    SUP: { label: "SUP", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    INFO: { label: "Info", className: "bg-gray-100 text-gray-600 border-gray-300" },
  };

  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };

  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium rounded-full border",
        sizeClasses[size],
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
