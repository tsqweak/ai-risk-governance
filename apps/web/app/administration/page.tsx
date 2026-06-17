import Link from "next/link";
import { ClipboardCheck, Database, Library, Map, Settings, UserPlus, Users } from "lucide-react";
import { Breadcrumbs, GroupedSecondaryNav, Section } from "../components/ui";
import { administrationNavigationGroups } from "../navigation-model";

export const dynamic = "force-dynamic";

const adminAreas = [
  {
    title: "Onboarding",
    items: [
      ["/onboarding", "Onboarding", "Current AI system onboarding workflow.", UserPlus],
      ["/onboarding/repositories", "Repository Discovery", "Repository-driven intake and manifest discovery.", Database],
      ["/onboarding/travel-brain-pilot", "Pilot Assessments", "Travel Brain pilot validation and onboarding evidence.", ClipboardCheck]
    ]
  },
  {
    title: "Standards",
    items: [
      ["/governance-manifest", "AI Manifest", "Manifest standard, declaration model, and governance requirements.", Settings],
      ["/governance-manifest/registry", "Manifest Registry", "Registered AI Governance manifests and status review.", ClipboardCheck],
      ["/governance-framework", "Framework", "Governance framework and status vocabulary configuration.", Library]
    ]
  },
  {
    title: "Platform Operations",
    items: [
      ["/platform-review", "Platform Review", "Internal route, feature, evidence, navigation, and architecture review workspace.", ClipboardCheck],
      ["/platform-review/package", "Review Package", "Review package summary and assurance state.", ClipboardCheck],
      ["/platform-review/export", "Export", "Platform review export workspace.", ClipboardCheck],
      ["/evidence-assurance/sources", "Connector Sources", "Connector source inventory and evidence collection status.", Database]
    ]
  },
  {
    title: "Libraries",
    items: [
      ["/controls", "Control Libraries", "Control catalog and regulatory mappings.", Library],
      ["/regulatory", "Regulatory Libraries", "Regulatory obligations, requirements, and controls.", Map]
    ]
  },
  {
    title: "Support",
    items: [
      ["/walkthroughs", "Walkthroughs", "Guided product walkthroughs and review aids.", UserPlus],
      ["/administration#owners", "Owner Management", "Business, technology, risk, and executive owner management.", Users]
    ]
  }
] as const;

export default function AdministrationPage() {
  return (
    <>
      <header>
        <Breadcrumbs items={[{ label: "Administration" }]} />
        <p className="text-sm font-medium text-brand">Administration</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Governance configuration and intake</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Administrative entry points for intake, owner management, framework configuration, control libraries, and regulatory libraries.
        </p>
        <GroupedSecondaryNav groups={administrationNavigationGroups} />
      </header>

      {adminAreas.map((group) => (
        <Section key={group.title} id={group.title === "Support" ? "owners" : undefined} title={group.title}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {group.items.map(([href, title, detail, Icon]) => (
              <Link key={title} href={href} className="rounded-md border border-line bg-white p-4 hover:bg-panel">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Icon className="h-4 w-4 text-brand" />
                  {title}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
              </Link>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}
