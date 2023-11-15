import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteurl(path: string) {
  if (typeof window != "undefined") return path;

  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}
