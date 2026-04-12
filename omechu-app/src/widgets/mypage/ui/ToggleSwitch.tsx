import clsx from "clsx";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative h-5 w-9 rounded-full transition-colors duration-200",
        checked ? "bg-brand-primary" : "bg-font-disabled",
      )}
    >
      <span
        className={clsx(
          "absolute top-px h-4.5 w-4.5 rounded-full bg-white transition-transform duration-200",
          checked ? "-translate-x-px" : "-translate-x-4.25",
        )}
      />
    </button>
  );
}
