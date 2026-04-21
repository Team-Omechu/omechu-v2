"use client";

import React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { CloseEyeIcon, OpenEyeIcon, SearchIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/cn.util";

const inputBaseStyles = cva(
  [
    "outline-none border border-font-placeholder",
    "bg-background-secondary text-font-high placeholder:text-font-placeholder",
    "px-4 transition-opacity duration-300",
  ],
  {
    variants: {
      width: {
        default: "w-[336px]",
        md: "w-[236px]",
        sm: "w-[210px]",
        xs: "w-[196px]",
      },
      height: {
        md: "h-12",
        sm: "h-10",
      },
      rounded: {
        sm: "rounded-[10px]",
        md: "rounded-[12px]",
      },
    },
    defaultVariants: {
      width: "default",
      height: "md",
      rounded: "sm",
    },
  },
);

type BaseInputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputBaseStyles> & {
    onSearch?: () => void;
  };

const PasswordInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      className,
      width,
      height,
      rounded,
      disabled,
      placeholder,
      onSearch: _onSearch,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const toggleVisibility = () => setIsVisible((v) => !v);
    const hasValue = typeof props.value === "string" && props.value.length > 0;

    return (
      <div
        className={cn(
          "relative flex items-center",
          inputBaseStyles({ width, height, rounded }),
          className,
        )}
      >
        <input
          ref={ref}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full bg-transparent pr-8 outline-none [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
          value={props.value}
          onChange={props.onChange}
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute right-3 flex items-center"
            aria-label="비밀번호 보기 전환"
          >
            {isVisible ? (
              <OpenEyeIcon className="w-6" />
            ) : (
              <CloseEyeIcon className="w-6" />
            )}
          </button>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

const SearchInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      className,
      width,
      height,
      rounded,
      disabled,
      placeholder,
      onSearch,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "relative",
          inputBaseStyles({ width, height, rounded }),
          className,
        )}
      >
        <input
          ref={ref}
          type="search"
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full min-w-0 flex-1 bg-transparent pr-8 outline-none"
          {...props}
        />
        <button
          type="button"
          onClick={onSearch ?? (() => {})}
          className="absolute right-3 flex items-center"
          aria-label="검색 실행"
        >
          <SearchIcon className="w-5" />
        </button>
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export const Input = React.forwardRef<HTMLInputElement, BaseInputProps>(
  (props, ref) => {
    const {
      type = "text",
      className,
      width,
      height,
      rounded,
      disabled,
      placeholder,
      onSearch,
      ...rest
    } = props;

    if (type === "password") {
      return (
        <PasswordInput
          ref={ref}
          className={className}
          width={width}
          height={height}
          rounded={rounded}
          disabled={disabled}
          placeholder={placeholder}
          onSearch={onSearch}
          {...rest}
        />
      );
    }
    if (type === "search") {
      return (
        <SearchInput
          ref={ref}
          className={className}
          width={width}
          height={height}
          rounded={rounded}
          disabled={disabled}
          placeholder={placeholder}
          onSearch={onSearch}
          {...rest}
        />
      );
    }
    return (
      <input
        ref={ref}
        type={type === "number" ? "number" : type}
        disabled={props.disabled}
        autoComplete="off"
        value={props.value}
        onChange={props.onChange}
        placeholder={placeholder}
        className={cn(
          inputBaseStyles({
            width: props.width,
            height: props.height,
            rounded: props.rounded,
          }),
          props.className,
        )}
      />
    );
  },
);

Input.displayName = "Input";
