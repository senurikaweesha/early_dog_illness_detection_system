import React from "react";
import { ShieldAlertIcon, InfoIcon, AlertTriangleIcon } from "lucide-react";
export const DisclaimerBox = ({
  children,
  variant = "warning",
  className = "",
}) => {
  const icons = {
    warning: ShieldAlertIcon,
    info: InfoIcon,
    alert: AlertTriangleIcon,
  };
  const Icon = icons[variant];
  const styles = {
    warning: "bg-warning/10 border-warning text-warning-dark",
    info: "bg-accent/10 border-accent text-primary",
    alert: "bg-warning/10 border-warning text-warning-dark",
  };
  const iconColors = {
    warning: "text-warning",
    info: "text-accent",
    alert: "text-warning",
  };
  return (
    <div
      className={`border-l-4 p-5 rounded-r-lg flex gap-4 ${styles[variant]} ${className}`}
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${iconColors[variant]}`} />
      <div className="text-sm">{children}</div>
    </div>
  );
};
