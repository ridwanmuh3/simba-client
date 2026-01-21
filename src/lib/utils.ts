import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useCurrentAuth } from "@/api/auth";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getInitialsIdentity = (name: string) => {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U"
  );
};

export const getUserFromCookie = () => {
  const token = document.cookie;

  if (!token) {
    return null;
  }

  const { data: user } = useCurrentAuth();

  return user;
};
