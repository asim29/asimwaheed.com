// ARIA labels for icon-only contact links.
// These must remain short, consistent, and action-oriented.

export const CONTACT_ARIA_LABELS = {
  email: "Email",
  github: "GitHub profile",
  scholar: "Google Scholar profile",
  linkedin: "LinkedIn profile",
} as const;

// Labels for icon-only controls that act on the page rather than linking out.
// The theme label names the action rather than a state: what the button does
// depends on the theme in effect, which may come from the OS rather than a
// previous click, so "switch" stays accurate where "enable dark mode" would not.
export const UI_ARIA_LABELS = {
  themeToggle: "Switch between light and dark theme",
} as const;
