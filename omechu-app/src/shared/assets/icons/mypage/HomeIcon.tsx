interface HomeIconProps {
  className?: string;
}

export const HomeIcon = ({ className }: HomeIconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3 11.5274C3 9.8679 3.77252 8.30292 5.08992 7.29368L8.75659 4.48472C10.6703 3.01862 13.3297 3.01862 15.2434 4.48472L18.9101 7.29368C20.2275 8.30292 21 9.8679 21 11.5274V15.6667C21 18.6122 18.6122 21 15.6667 21H8.33333C5.38782 21 3 18.6122 3 15.6667V11.5274Z"
        stroke="var(--color-font-high)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M14 21V15.75C14 14.6454 13.1046 13.75 12 13.75C10.8954 13.75 10 14.6454 10 15.75V21"
        stroke="var(--color-font-high)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
};
