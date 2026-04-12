// ! 26.01.04 작업 완료

import * as React from "react";

import { cn } from "@/shared/lib/cn.util";
import { HelperText } from "@/shared/ui/input/HelperText";
import { Label } from "@/shared/ui/input/Label";

type HelperState = "default" | "error" | "success";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  id: string;
  required?: boolean;

  helperText?: string;
  helperState?: HelperState;

  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}

export function FormField({
  label,
  id,
  helperText,
  helperState,
  rightSlot,
  children,
  className,
  ...props
}: FormFieldProps) {
  const helperId = helperText ? `${id}-helper` : undefined;

  const enhancedChildren = React.isValidElement(children)
    ? React.cloneElement(
        children as React.ReactElement<Record<string, unknown>>,
        {
          id,
          "aria-describedby": helperId,
          "aria-invalid": helperState === "error" ? true : undefined,
        },
      )
    : children;

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Label htmlFor={id}>{label}</Label>

      <div className={cn("mt-2 flex items-center gap-3")}>
        {enhancedChildren}
        {rightSlot}
      </div>

      {helperText && (
        <HelperText id={helperId} state={helperState ?? "default"}>
          {helperText}
        </HelperText>
      )}
    </div>
  );
}

FormField.displayName = "FormField";
