import { FileText, Settings, Tag, Users, type LucideIcon } from "lucide-react";

export type SectionTab = { label: string; href: string };

export type Section = {
  /** Every route of the section starts with this path. */
  href: string;
  label: string;
  /** Shorter name for the phone bar. */
  short: string;
  icon: LucideIcon;
  /** Small second-level menu shown at the top of the section's pages. Leave empty for none. */
  tabs: SectionTab[];
};

/**
 * The whole menu. To add Purchases, Payments or Reports later, add one entry here
 * and create its routes; the sidebar, the phone bar and the page tabs follow.
 */
export const SECTIONS: Section[] = [
  {
    href: "/bills",
    label: "Bills",
    short: "Bills",
    icon: FileText,
    tabs: [
      { label: "All bills", href: "/bills" },
      { label: "New bill", href: "/bills/new" },
    ],
  },
  {
    href: "/customers",
    label: "Customers",
    short: "Customers",
    icon: Users,
    tabs: [
      { label: "All customers", href: "/customers" },
      { label: "Add customer", href: "/customers/new" },
    ],
  },
  {
    href: "/items",
    label: "Items",
    short: "Items",
    icon: Tag,
    tabs: [
      { label: "All items", href: "/items" },
      { label: "Add item", href: "/items/new" },
    ],
  },
  { href: "/settings", label: "Firm settings", short: "Firm", icon: Settings, tabs: [] },
];

/** The phone bar holds this many sections; with more, the last place becomes "More". */
export const PHONE_BAR_SLOTS = 5;

export function sectionFor(pathname: string): Section | undefined {
  return SECTIONS.find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`));
}

/** The tab whose path is the longest match, so /bills/new picks "New bill", not "All bills". */
export function activeTab(section: Section, pathname: string): SectionTab | undefined {
  return section.tabs
    .filter((t) => pathname === t.href || pathname.startsWith(`${t.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
