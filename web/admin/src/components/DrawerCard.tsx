import { PropsWithChildren } from "react";

export function DrawerCard({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <article className="luxury-panel nested-panel drawer-card">
      <div className="drawer-card-header">
        <div>
          <strong>{title}</strong>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </article>
  );
}
