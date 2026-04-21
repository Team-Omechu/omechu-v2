interface ArrowCalenderIconProps {
  className?: string;
  currentColor?: string;
}

export const ArrowCalenderIcon = ({
  className,
  currentColor,
}: ArrowCalenderIconProps) => {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.503 13.7706L5.37461 19.899L3.84277 18.3672L9.20527 13.0047L3.84277 7.64218L5.37461 6.11035L11.503 12.2388C11.7061 12.4419 11.8202 12.7174 11.8202 13.0047C11.8202 13.2919 11.7061 13.5674 11.503 13.7706Z"
        fill={currentColor || "var(--color-font-high)"}
      />
    </svg>
  );
};
