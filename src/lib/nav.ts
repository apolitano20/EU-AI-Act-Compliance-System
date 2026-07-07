// Grouped navigation for the module routes. Items are added as modules are
// built so the nav never links to routes that don't exist yet.

export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Inventory",
    items: [{ label: "Inventory", href: "/inventory" }],
  },
  {
    label: "Classification",
    items: [
      { label: "Entity Type", href: "/entity-type" },
      { label: "AI System Definition", href: "/ai-system-definition" },
      { label: "EU Scope", href: "/eu-scope" },
      { label: "Exclusions", href: "/exclusions" },
    ],
  },
];
