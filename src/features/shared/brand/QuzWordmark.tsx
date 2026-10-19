import type { SVGProps } from "react";

// The wide logo. Decorative by default; pass a `title` when it stands alone and needs a name.
export function QuzWordmark({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 250.3 120"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title && <title>{title}</title>}
      <rect width="250.3" height="120" rx="60" fill="#E8B04B" />
      <g transform="translate(41.71 60) scale(0.78) translate(0 -60)">
        <circle cx="36" cy="60" r="24" fill="none" stroke="#3A2606" strokeWidth="13" />
        <path d="M60 36 V112" stroke="#3A2606" strokeWidth="13" strokeLinecap="round" />
        <path
          d="M82 36 V64 A20 20 0 0 0 122 64 V36 M122 36 V84"
          fill="none"
          stroke="#3A2606"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M162 36 H202 L162 84 H202"
          fill="none"
          stroke="#3A2606"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="142" cy="18" r="9" fill="#19141B" />
      </g>
    </svg>
  );
}
