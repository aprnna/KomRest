"use client";
import { extendVariants, Button as But } from "@heroui/react";

export const Button = extendVariants(But, {
  variants: {
    // <- modify/add variants
    color: {
      olive: "text-[#000] bg-[#84cc16]",
      orange: "bg-[#ff8c00] text-[#fff]",
      violet: "bg-[#8b5cf6] text-[#fff]",
      primary: "bg-amber-900 text-slate-50 hover:bg-amber-950",
    },
    variant: {
      outline:
        "border border-amber-950 text-[#000] hover:bg-amber-950/50 hover:text-[#fff] bg-transparent",
    },
    isDisabled: {
      true: "bg-[#eaeaea] text-[#000] opacity-50 cursor-not-allowed",
    },
    size: {
      xs: "px-2 min-w-12 h-6 text-tiny gap-1 rounded-small",
      md: "px-4 min-w-20 h-10 text-small gap-2 rounded-small",
      xl: "px-8 min-w-28 h-14 text-lg font-normal rounded-lg",
    },
  },
  defaultVariants: {
    // <- modify/add default variants
    color: "primary",
    size: "md",
  },
  compoundVariants: [
    // <- modify/add compound variants
    {
      isDisabled: true,
      color: "olive",
      class: "bg-[#84cc16]/80 opacity-100",
    },
  ],
});
