import { cn } from "@/lib/utils"

export function metricValueTypography(value: string) {
  const length = Array.from(value.replace(/\s/g, "")).length

  return cn(
    "block max-w-full whitespace-nowrap font-bold leading-tight tracking-normal tabular-nums transition-[font-size] duration-200",
    length >= 15
      ? "text-[1.125rem] sm:text-xl"
      : length >= 12
        ? "text-[1.375rem] sm:text-2xl"
        : length >= 9
          ? "text-[1.625rem] sm:text-[1.75rem]"
          : "text-3xl"
  )
}
