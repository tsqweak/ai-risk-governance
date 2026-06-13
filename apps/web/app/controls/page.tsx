import { getControls } from "../data";
import { humanize } from "../components/format";
import { Section } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function ControlsPage() {
  const controls = await getControls();

  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">Control library</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">AI governance controls</h1>
      </header>
      <Section title="Controls">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {controls.map((control) => (
            <article key={control.id} className="rounded-md border border-line bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand">{control.code}</div>
              <h2 className="mt-2 text-base font-semibold text-ink">{control.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{control.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded bg-panel px-2 py-1">{humanize(control.category)}</span>
                <span className="rounded bg-panel px-2 py-1">{control.ownerRole}</span>
                <span className="rounded bg-panel px-2 py-1">{control.testingFrequency}</span>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
