// ! 26.01.04 작업 완료
import * as React from "react";

import { cn } from "@/shared/lib/cn.util";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ children, className, ...props }: LabelProps) {
  return (
    <label className={cn("text-body-3-medium", className)} {...props}>
      {children}
    </label>
  );
}

Label.displayName = "Label";
