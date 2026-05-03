import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/shared/lib/cn";

const buttonStyles = cva(
  [
    "flex items-center justify-center",
    "active:bg-statelayer-pressed",
    "disabled:bg-statelayer-disabled disabled:cursor-not-allowed disabled:active:bg-statelayer-disabled",
    "transition-colors",
  ],
  {
    variants: {
      bgColor: {
        default: "bg-statelayer-default",
        white: "bg-[#F6F6F6] border border-font-disabled",
        grey: "bg-brand-tertiary",
        primary: "bg-brand-primary",
        outline:
          "bg-brand-secondary border border-font-placeholder active:bg-brand-secondary",
      },
      width: {
        xs: "w-[75.67px] text-body-3-regular",
        sm: "w-[116px] text-body-2-medium",
        md: "w-[160px] text-body-3-regular",
        lg: "w-50 text-base",
        xl: "w-[335px] text-body-4-regular",
        auto: "",
      },
      height: {
        sm: "h-10",
        md: "h-12",
        auto: "",
      },
      radius: {
        sm: "rounded-[10px]",
        md: "rounded-[12px]",
        xl: "rounded-xl",
      },
      fontColor: {
        default: "text-brand-secondary",
        black: "text-font-medium active:text-brand-secondary",
        placeholder: "text-font-placeholder",
      },
    },
    defaultVariants: {
      fontColor: "default",
      bgColor: "default",
      width: "xl",
      height: "md",
      radius: "sm",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & {
    /**
     * Toggle state. When provided, overrides bgColor/fontColor to primary/outline styling.
     * Used for onboarding options, random draw picks, question list answers.
     */
    selected?: boolean;
  };

export function Button({
  fontColor,
  bgColor,
  width,
  height,
  radius,
  selected,
  className,
  children,
  ...props
}: ButtonProps) {
  const resolvedBg =
    selected === undefined ? bgColor : selected ? "primary" : "outline";
  const resolvedFont =
    selected === undefined ? fontColor : selected ? "default" : "placeholder";

  return (
    <button
      type="button"
      className={cn(
        buttonStyles({
          bgColor: resolvedBg,
          width,
          height,
          radius,
          fontColor: resolvedFont,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
