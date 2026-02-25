"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import Image from "next/image";

export interface RouletteHandle {
  start: () => void;
  stop: () => void;
  getAngle: () => number;
  setAngle: (nextAngle: number) => void;
  animateToAngle: (nextAngle: number, durationMs?: number) => Promise<void>;
}

type RouletteProps = {
  menus: {
    menuId: string;
    menuName: string;
    centerAngle: number;
    color: string;
  }[];
  disabled?: boolean;
};

export const Roulette = forwardRef<RouletteHandle, RouletteProps>(
  ({ menus, disabled = false }, ref) => {
    const [spinning, setSpinning] = useState(false);
    const [angle, setAngle] = useState(0);
    const angleRef = useRef(0);
    const animationRef = useRef<number | null>(null);

    const SPEED = 12;

    const normalize = (value: number) => ((value % 360) + 360) % 360;
    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

    const resolveDuration = (delta: number, manualDurationMs?: number) => {
      if (typeof manualDurationMs === "number") return manualDurationMs;
      const degreesPerMs = 0.7; // 700deg/s
      const computed = delta / degreesPerMs;
      return Math.max(220, Math.min(700, computed));
    };

    const animateToAngleInternal = (nextAngle: number, durationMs?: number) =>
      new Promise<void>((resolve) => {
        const start = angleRef.current;
        const startNormalized = normalize(start);
        const targetNormalized = normalize(nextAngle);
        let delta = targetNormalized - startNormalized;

        if (delta < 0) delta += 360;
        const finalDuration = resolveDuration(delta, durationMs);
        const target = start + delta;

        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }

        if (delta === 0) {
          angleRef.current = target;
          setAngle(target);
          resolve();
          return;
        }

        const startedAt = performance.now();

        const tick = (now: number) => {
          const elapsed = now - startedAt;
          const progress = Math.min(1, elapsed / finalDuration);
          const eased = easeOutCubic(progress);
          const current = start + delta * eased;

          angleRef.current = current;
          setAngle(current);

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(tick);
            return;
          }

          angleRef.current = target;
          setAngle(target);
          animationRef.current = null;
          resolve();
        };

        animationRef.current = requestAnimationFrame(tick);
      });

    useImperativeHandle(ref, () => ({
      start: () => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        setSpinning(true);
      },
      stop: () => setSpinning(false),
      getAngle: () => normalize(angleRef.current),
      setAngle: (nextAngle: number) => {
        const current = angleRef.current;
        const currentNormalized = normalize(current);
        const nextNormalized = normalize(nextAngle);
        let delta = nextNormalized - currentNormalized;
        if (delta < 0) delta += 360;
        const target = current + delta;
        angleRef.current = target;
        setAngle(target);
      },
      animateToAngle: async (nextAngle: number, durationMs?: number) => {
        setSpinning(false);
        await animateToAngleInternal(nextAngle, durationMs);
      },
    }));

    useEffect(() => {
      if (!spinning || disabled) return;

      const id = setInterval(() => {
        setAngle((prev) => {
          const next = prev + SPEED;
          angleRef.current = next;
          return next;
        });
      }, 16);

      return () => clearInterval(id);
    }, [spinning, disabled]);

    useEffect(() => {
      return () => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, []);

    const toRad = (deg: number) => (deg * Math.PI) / 180;

    return (
      <div className="relative flex flex-col items-center">
        <div className="relative h-100 w-100">
          <svg
            className="pointer-events-none absolute inset-0 z-10"
            viewBox="-200 -200 400 400"
          >
            {menus.map((m) => {
              const r = 180;
              const rad = toRad(m.centerAngle - 90);
              return (
                <text
                  key={m.menuId}
                  x={Math.cos(rad) * r}
                  y={Math.sin(rad) * r}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fill="#333"
                >
                  {m.menuName}
                </text>
              );
            })}
          </svg>

          <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2">
            <svg className="absolute inset-0 z-20" viewBox="-160 -160 320 320">
              {menus.map((m) => {
                const rad = toRad(m.centerAngle - 90);
                return (
                  <line
                    key={m.menuId}
                    x1={Math.cos(rad) * 40}
                    y1={Math.sin(rad) * 40}
                    x2={Math.cos(rad) * 150}
                    y2={Math.sin(rad) * 150}
                    stroke={m.color}
                    strokeWidth={15}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            <Image
              src="/menubattle/roulette.svg"
              alt="roulette"
              fill
              priority
            />

            <div
              className="absolute inset-0 z-30 flex items-center justify-center"
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: "50% 50%",
              }}
            >
              <div
                className="w-2 rounded border border-white bg-[#FF7A9E]"
                style={{
                  height: 160,
                  transform: "translateY(-80px)",
                  transformOrigin: "bottom",
                }}
              />
            </div>

            <div className="absolute top-1/2 left-1/2 z-40 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF7A9E]" />
          </div>
        </div>
      </div>
    );
  },
);

Roulette.displayName = "Roulette";
