import { alpha, createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    neutral?: Palette["primary"];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions["primary"];
  }
}

const tokens = {
  primary: "#8C63FF",
  primaryHover: "#521CEB",
  secondary: "#5550F2",

  error: "#FF3B4E",
  success: "#2ECC71",
  warning: "#FFB020",

  bg: "#FAFAFA",
  paper: "#FFFFFF",
  divider: "#DBDBDB",

  text: "#1B1B1F",
  text2: "#737373",

  radius: 12,
} as const;

export const themeLight = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: tokens.primary },
    secondary: { main: tokens.secondary },
    error: { main: tokens.error },
    success: { main: tokens.success },
    warning: { main: tokens.warning },

    background: { default: tokens.bg, paper: tokens.paper },
    divider: tokens.divider,
    text: { primary: tokens.text, secondary: tokens.text2 },

    neutral: { main: "#9AA0A6" },
  },

  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    fontSize: 14,
    body1: { fontSize: 16, lineHeight: 1.55 },
    body2: { fontSize: 14, lineHeight: 1.5 },
  },

  shape: { borderRadius: tokens.radius },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: "100%" },
        body: {
          height: "100%",
          margin: 0,
          backgroundColor: tokens.bg,
          color: tokens.text,
        },
        "#root": { height: "100%" },
      },
    },

    MuiDivider: { styleOverrides: { root: { borderColor: tokens.divider } } },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: tokens.radius,
          boxShadow: "none",
        },
        contained: { boxShadow: "none" },
        containedPrimary: {
          backgroundColor: tokens.primary,
          "&:hover": { backgroundColor: tokens.primaryHover },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: tokens.radius,
          backgroundColor: tokens.paper,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.18)}`,
          },
        }),
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: 12,
          lineHeight: "16px",
          marginLeft: 0,
          marginRight: 0,
        },
      },
    },
  },
});

export default themeLight;
