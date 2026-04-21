interface ArrowIconProps {
  className?: string;
  currentColor?: string;
  width?: number | string;
  height?: number | string;
}

export const ArrowIcon = ({
  className,
  currentColor,
  width = 9,
  height = 15,
}: ArrowIconProps) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 9 15"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 1L7 7.5L1 14"
        stroke={currentColor || "var(--color-font-high)"}
        strokeWidth="2"
      />
    </svg>
  );
};
