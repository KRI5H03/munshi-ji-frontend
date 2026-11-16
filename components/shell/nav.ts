import { FileText, Settings, Tag, Users, type LucideIcon } from "lucide-react";

export type NavLink = { label: string; href: string };

export type Section = {
  /** Every route of the section starts with this path. */
  href: string;
  label: string;
  /** Shorter name for the phone bar. */
  short: string;
  icon: LucideIcon;
  /** The filled button on the section's list page, if it has one. */
  primaryAction?: NavLink;
  /**
   * Second-level menu for the section. Not shown anywhere today; a section that grows
   * several list pages (Reports, say) can fill this and the shell can render it.
   */
  subNav: NavLink[];
};

/**
 * The whole menu. To add Purchases, Payments or Reports later, add one entry here
 * and create its routes; the sidebar and the phone bar follow.
 */
export const SECTIONS: Section[] = [
  {
    href: "/bills",
    label: "Bills",
    short: "Bills",
    icon: FileText,
    primaryAction: { label: "New bill", href: "/bills/new" },
    subNav: [],
  },
  {
    href: "/customers",
    label: "Customers",
    short: "Customers",
    icon: Users,
    primaryAction: { label: "Add customer", href: "/customers/new" },
    subNav: [],
  },
  {
    href: "/items",
    label: "Items",
    short: "Items",
    icon: Tag,
    primaryAction: { label: "Add item", href: "/items/new" },
    subNav: [],
  },
  { href: "/settings", label: "Firm settings", short: "Firm", icon: Settings, subNav: [] },
];

/** The phone bar holds this many places; the last one is always "More". */
export const PHONE_BAR_SLOTS = 5;

export function sectionFor(pathname: string): Section | undefined {
  return SECTIONS.find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`));
}

export function section(href: string): Section {
  const found = SECTIONS.find((s) => s.href === href);
  if (!found) throw new Error(`No section ${href} in nav.ts`);
  return found;
}

/** The sub-nav link whose path is the longest match, for when a sub-nav is shown. */
export function activeSubNav(s: Section, pathname: string): NavLink | undefined {
  return s.subNav
    .filter((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
