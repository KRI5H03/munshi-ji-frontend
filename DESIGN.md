# Munshi Ji — design options (round 1)

Open http://localhost:3000/design. Each direction has all 7 screens with mock data shaped like `docs/API.md`. To choose one, write `BUILD A`, `BUILD B` or `BUILD C`.

## A — Refined reference

- **Idea:** the reference screens, tidied. Sidebar on desktop, bottom bar on phone, white cards, a side form next to each list.
- **Colours:** indigo `#3730A3` on `#F7F7F7`, white cards, grey borders, red only for errors and delete.
- **Font:** Inter, 16px base, tabular digits for money.
- **Spacing:** roomy. 48px fields and buttons, 12px corners, 24px between cards.
- **Best at:** feeling familiar and calm; nothing to learn if you liked the reference.
- **Gives up:** speed and density. A bill needs scrolling on a small laptop.

## B — Counter mode

- **Idea:** everything for a bill on one screen, driven from the keyboard like Busy or Tally. Ruled entry grid, totals docked on the right, a key bar along the bottom, lists and forms side by side.
- **Colours:** black on white, yellow `#FDE047` fill on the focused field and the selected row, dark green `#14532D` for the one main action.
- **Font:** IBM Plex Sans, with IBM Plex Mono for every number. 16px base.
- **Spacing:** tight. 44px rows, square corners, 1px rules, no cards and no shadows.
- **Best at:** speed for a trained hand; most information per screen.
- **Gives up:** calm and first-day friendliness. It looks like accounting software, and on a phone much of the keyboard advantage is lost.

## C — The bill is the screen

- **Idea:** New bill looks like the paper bill and is filled in where it will print: firm, bill to, items, discount, total, amount in words. One job per screen; the new-bill screen hides the tabs and pins "Save and print" to the bottom.
- **Colours:** warm paper white `#FAFAF7`, near-black ink, one bahi-khata red `#B42318` kept for the main action and the grand total.
- **Font:** Atkinson Hyperlegible Next (made for low vision), Atkinson Hyperlegible Mono for numbers. 18px base.
- **Spacing:** large. 56px fields and buttons, single column, full sentences as hints.
- **Best at:** clarity for a non-technical user, and phone use.
- **Gives up:** density. Lists show fewer rows, and add/edit forms take the whole width.

## Things that are not in the API (my calls)

- Firm picker shows name and role only. Login does not return a GSTIN.
- "Next bill number" from the reference is dropped. No route gives it.
- "Low stock" is a frontend-only rule: 10 or fewer.
- In C, "Save and print" is the main button and Delete customer sits inside Edit.
- The dark strip at the top of each screen is a review aid, not part of any design.
