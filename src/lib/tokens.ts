// Design tokens — mirrors CSS custom properties in globals.css
// Use these in JS/JSX contexts where Tailwind classes aren't applicable

export const colors = {
  brandDarkBlue: "#203649",
  brandBlue: "#1182E3",
  brandDarkGray: "#676767",
  brandGray: "#BDBDBD",
  brandLightGray: "#DBDBDB",
  brandLightestGray: "#F3F3F3",
  background: "#FAFAFA",
};

// HSL values for CSS custom properties (format: "H S% L%")
export const cssVars = {
  "--brand-dark-blue": "209 38% 21%",
  "--brand-blue": "210 82% 48%",
  "--brand-dark-gray": "0 0% 40%",
  "--brand-gray": "0 0% 74%",
  "--brand-light-gray": "0 0% 86%",
  "--brand-lightest-gray": "0 0% 95%",
  "--background": "0 0% 98.5%",
  "--foreground": "209 38% 21%",
  "--primary": "210 82% 48%",
  "--primary-foreground": "0 0% 100%",
  "--secondary": "0 0% 95%",
  "--secondary-foreground": "209 38% 21%",
  "--muted": "0 0% 95%",
  "--muted-foreground": "0 0% 40%",
  "--accent": "0 0% 95%",
  "--accent-foreground": "209 38% 21%",
  "--destructive": "0 84% 60%",
  "--destructive-foreground": "0 0% 100%",
  "--border": "0 0% 86%",
  "--input": "0 0% 86%",
  "--ring": "210 82% 48%",
  "--radius": "0.5rem",
};

export const spacing = {
  sidebar: "240px",
  sidebarCollapsed: "64px",
  headerHeight: "64px",
  contentMaxWidth: "1200px",
};

export const typography = {
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
};

export const contentTypes = {
  audio: { label: "Audio", color: colors.brandBlue },
  video: { label: "Video", color: "#8B5CF6" },
  pdf: { label: "PDF", color: "#EF4444" },
  url: { label: "Article", color: "#10B981" },
  text: { label: "Text", color: colors.brandDarkGray },
  podcast: { label: "Podcast", color: "#F59E0B" },
};
