export const DIRECTIONS = [
  { letter: "a", name: "Refined reference", line: "Calm, light, indigo. The reference screens, tidied." },
  { letter: "b", name: "Counter mode", line: "Dense and keyboard-first, like Busy or Tally." },
  { letter: "c", name: "The bill is the screen", line: "Fill in the bill the way it looks on paper." },
] as const;

export const SCREENS = [
  { slug: "login", name: "Login and firm picker" },
  { slug: "bills", name: "Bills (home)" },
  { slug: "new-bill", name: "New bill" },
  { slug: "customers", name: "Customers" },
  { slug: "items", name: "Items" },
  { slug: "settings", name: "Firm settings" },
  { slug: "print", name: "Print (A4)" },
] as const;
