import { type ReactNode, useCallback, useEffect, useState } from "react";

type CollapsibleSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
};

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export default function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
  className = "",
  actions,
}: CollapsibleSectionProps) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(defaultOpen);

  const open = isMobile ? mobileOpen : true;

  const toggle = useCallback(() => {
    if (isMobile) setMobileOpen((prev) => !prev);
  }, [isMobile]);

  return (
    <section className={`collapsible ${className}`}>
      <div className="collapsible-header">
        <button
          type="button"
          className="collapsible-toggle"
          onClick={toggle}
          aria-expanded={open}
        >
          <span className={`collapsible-chevron ${open ? "is-open" : ""}`}>
            ▶
          </span>
          <h2 className="section-title">{title}</h2>
        </button>
        {actions && open ? (
          <div className="collapsible-actions">{actions}</div>
        ) : null}
      </div>
      {open ? <div className="collapsible-body">{children}</div> : null}
    </section>
  );
}
