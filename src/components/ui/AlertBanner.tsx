import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

const alertBannerVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        success: "bg-success/10 text-success border-success/20",
        warning: "bg-warning/10 text-warning border-warning/20",
        error: "bg-destructive/10 text-destructive border-destructive/20",
        info: "bg-info/10 text-info border-info/20",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBannerVariants> {
  variant: "success" | "warning" | "error" | "info";
  title?: string;
  message: string;
  showIcon?: boolean;
}

function AlertBanner({
  className,
  variant = "info",
  title,
  message,
  showIcon = true,
  ...props
}: AlertBannerProps) {
  const Icon = iconMap[variant];

  return (
    <div
      role="alert"
      className={cn(alertBannerVariants({ variant }), className)}
      {...props}
    >
      {showIcon && <Icon className="h-4 w-4" />}
      <div>
        {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
        <div className="text-sm [&_p]:leading-relaxed opacity-90">{message}</div>
      </div>
    </div>
  );
}

export { AlertBanner, alertBannerVariants };
