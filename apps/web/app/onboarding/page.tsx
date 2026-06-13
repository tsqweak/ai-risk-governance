import { CheckCircle2 } from "lucide-react";
import { LearningPanel, Section } from "../components/ui";

export const dynamic = "force-dynamic";

const steps = [
  {
    name: "Basic profile",
    detail: "Capture name, description, business purpose, lifecycle status, environment, and whether this is a new or existing AI system."
  },
  {
    name: "Ownership",
    detail: "Assign business owner, technology owner, risk owner, executive sponsor, and governance committee accountability."
  },
  {
    name: "System characteristics",
    detail: "Identify customer-facing use, internal users, material business processes, regulated activity, autonomy, transactions, and third-party dependencies."
  },
  {
    name: "Data and jurisdictions",
    detail: "Record personal data use, data classification, source systems, retention expectations, and operating jurisdictions."
  },
  {
    name: "Risk assessment",
    detail: "Score customer, financial, privacy, operational, regulatory, autonomy, third-party, sensitivity, and explainability dimensions."
  },
  {
    name: "Review and submit",
    detail: "Review generated risk tier, required controls, evidence expectations, next review date, and approval routing."
  }
];

export default function OnboardingPage() {
  return (
    <>
      <header>
        <p className="text-sm font-medium text-brand">AI System onboarding</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Register existing and future AI systems</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          A guided workflow for intake teams, developers, IT Risk, Compliance, Internal Audit, executives, and the AI Governance Committee.
        </p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-md border border-line bg-white">
          {steps.map((step, index) => (
            <div key={step.name} className="flex gap-4 border-b border-line p-5 last:border-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">{index + 1}</div>
              <div>
                <h2 className="text-sm font-semibold text-ink">{step.name}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-700">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <LearningPanel title="Why onboarding exists">
            AI onboarding creates a consistent record before risk decisions become tribal knowledge. It gives audit and oversight teams the same facts developers and business owners use.
          </LearningPanel>
          <LearningPanel title="Existing systems count too">
            Bank-grade registries must capture both new builds and already deployed AI capabilities, including spreadsheets, prompts, vendor tools, APIs, and embedded workflow automation.
          </LearningPanel>
        </div>
      </div>

      <Section title="Review gates">
        <div className="grid gap-3 md:grid-cols-3">
          {["Business accountable owner confirmed", "Risk tier calculated", "Controls and evidence generated"].map((gate) => (
            <div key={gate} className="flex items-center gap-3 rounded-md border border-line bg-white p-4 text-sm font-medium text-ink">
              <CheckCircle2 className="h-5 w-5 text-brand" />
              {gate}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
