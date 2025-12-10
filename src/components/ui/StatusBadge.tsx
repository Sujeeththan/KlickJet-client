import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        pending: "bg-status-pending text-status-pending-foreground",
        processing: "bg-status-processing text-status-processing-foreground",
        shipped: "bg-status-shipped text-status-shipped-foreground",
        delivered: "bg-status-delivered text-status-delivered-foreground",
        cancelled: "bg-status-cancelled text-status-cancelled-foreground",
        approved: "bg-status-approved text-status-approved-foreground",
        rejected: "bg-status-rejected text-status-rejected-foreground",
        active: "bg-status-active text-status-active-foreground",
        inactive: "bg-status-inactive text-status-inactive-foreground",
      },
      variant: {
        default: "",
        outline: "bg-transparent border",
      },
    },
    compoundVariants: [
      {
        status: "pending",
        variant: "outline",
        className: "border-status-pending text-status-pending",
      },
      {
        status: "processing",
        variant: "outline",
        className: "border-status-processing text-status-processing",
      },
      {
        status: "shipped",
        variant: "outline",
        className: "border-status-shipped text-status-shipped",
      },
      {
        status: "delivered",
        variant: "outline",
        className: "border-status-delivered text-status-delivered",
      },
      {
        status: "cancelled",
        variant: "outline",
        className: "border-status-cancelled text-status-cancelled",
      },
      {
        status: "approved",
        variant: "outline",
        className: "border-status-approved text-status-approved",
      },
      {
        status: "rejected",
        variant: "outline",
        className: "border-status-rejected text-status-rejected",
      },
      {
        status: "active",
        variant: "outline",
        className: "border-status-active text-status-active",
      },
      {
        status: "inactive",
        variant: "outline",
        className: "border-status-inactive text-status-inactive",
      },
    ],
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "approved"
    | "rejected"
    | "active"
    | "inactive";
}

function StatusBadge({
  className,
  status,
  variant,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ status, variant }), className)}
      {...props}
    >
      {children || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants };
