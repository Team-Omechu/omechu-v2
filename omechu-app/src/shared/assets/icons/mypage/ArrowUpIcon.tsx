interface ArrowUpIconProps {
  className?: string;
}

export const ArrowUpIcon = ({ className }: ArrowUpIconProps) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7.33309 3L7.33309 14.3333M7.33309 3L11.9998 7.66667M7.33309 3L2.66642 7.66667"
        stroke="var(--color-font-high)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
