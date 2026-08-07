import { CheckoutButton } from "@/components/CheckoutButton";
import { WaitlistForm } from "@/components/WaitlistForm";
import { PlanFeatures } from "@/components/PlanFeatures";
import type { PricingPlan } from "@/lib/pricing";

export function PlanCard({
  plan,
  previewCount,
  forceHot = false,
}: {
  plan: PricingPlan;
  /** Feature lines shown before “+N more”; default matches PlanFeatures. */
  previewCount?: number;
  /** Force highlight chrome (e.g. Agency on Foundry kit). */
  forceHot?: boolean;
}) {
  const hot = forceHot || !!plan.highlight;

  return (
    <article className={`plan-shell ${hot ? "is-hot" : ""}`}>
      <div className="plan-shell-body">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <p className="font-display text-xl font-semibold leading-tight tracking-tight text-[var(--ink)]">
            {plan.name}
          </p>
          {plan.badge && <span className="plan-badge">{plan.badge}</span>}
        </div>
        <p className="mt-3">
          <span className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)]">
            {plan.price}
          </span>{" "}
          <span className="text-sm font-medium text-[var(--muted)]">{plan.cadence}</span>
        </p>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--support)]">{plan.description}</p>
        <PlanFeatures features={plan.features} previewCount={previewCount} />
      </div>
      <div className="plan-shell-footer">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]">
          {plan.features.length} inclusions
        </p>
        <div className="plan-shell-actions z-10 min-w-0 overflow-visible">
          {plan.mode === "none" ? (
            <WaitlistForm cta={plan.cta} layout="stack" />
          ) : (
            <CheckoutButton planId={plan.id} label={plan.cta} primary={hot} />
          )}
        </div>
      </div>
    </article>
  );
}
