import type { SVGProps } from "react";

// The round "Knappen" icon, for places too small for the wordmark. Decorative by default; pass a `title` when it stands alone.
export function QuzIcon({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title && <title>{title}</title>}
      <circle cx="50" cy="50" r="49" fill="#E8B04B" />
      <circle cx="44" cy="51" r="16" fill="none" stroke="#3A2606" strokeWidth="10.5" />
      <path d="M60 35 V82" stroke="#3A2606" strokeWidth="10.5" strokeLinecap="round" />
      <circle cx="74" cy="29" r="7" fill="#19141B" />
    </svg>
  );
}
