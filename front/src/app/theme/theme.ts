import { createTheme, type Theme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    neutral?: Palette["primary"];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions["primary"];
  }
}

const tokens = {
  primary: "#8C63FF", // твой основной
  secondary: "#D05BFF", // мягкий розово-лиловый
  error: "#FF3B4E", // заметный, но не “яд”
  success: "#2ECC71",
  warning: "#FFB020",

  bg: "#F7F5FF", // слегка тонированный фон
  paper: "#FFFFFF",
  text: "#1B1B1F",
  text2: "#4C4C57",
  divider: "#E6E0F5",

  radiusSm: 12,
  radiusMd: 16,
};

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      html: {
        height: "100%",
      },
      body: {
        height: "100%",
        margin: 0,
        backgroundColor: tokens.bg,
        color: tokens.text,
      },
      "#root": {
        height: "100%",
      },
      a: {
        color: tokens.primary,
        textDecoration: "none",
      },
      a:hover: {
        textDecoration: "underline",
        textUnderlineOffset: 3,
      },
    },
  },

  MuiButton: {
    styleOverrides: {
      root: {
        height: 40,
        minHeight: 40,
        borderRadius: tokens.radiusSm,
        textTransform: "none" as const,
        fontSize: 14,
        fontWeight: 600,
        lineHeight: "18px",
        boxShadow: "none",
      },
      contained: {
        boxShadow: "none",
      },
      containedPrimary: {
        backgroundColor: tokens.primary,
      },
      outlined: {
        borderWidth: 1,
      },
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      sizeSmall: {
        width: 32,
        height: 32,
      },
      sizeMedium: {
        width: 40,
        height: 40,
      },
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        borderRadius: tokens.radiusSm,
        backgroundColor: tokens.paper,
        transition: "border-color 150ms ease, box-shadow 150ms ease",
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 3px rgba(140, 99, 255, 0.18)`,
        },
      }),
      notchedOutline: ({ theme }: { theme: Theme }) => ({
        borderWidth: 1,
        borderColor: theme.palette.divider,
      }),
      input: {
        fontSize: 14,
        lineHeight: "20px",
        fontWeight: 400,
        padding: "10px 12px",
      },
    },
  },

  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontSize: 13,
        fontWeight: 500,
      },
    },
  },

  MuiFormHelperText: {
    styleOverrides: {
      root: {
        fontSize: 12,
        lineHeight: "16px",
        marginLeft: 0,
        marginRight: 0,
        "&.Mui-error": {
          color: tokens.error,
        },
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: tokens.radiusMd,
        backgroundImage: "none",
        boxShadow:
          "0 10px 30px rgba(20, 20, 30, 0.06), 0 2px 10px rgba(20, 20, 30, 0.05)",
      },
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: tokens.radiusMd,
        backgroundImage: "none",
      },
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 20,
      },
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
      },
    },
  },
} as const;

export const themeLight = createTheme({
  palette: {
    mode: "light",
    primary: { main: tokens.primary },
    secondary: { main: tokens.secondary },
    error: { main: tokens.error },
    success: { main: tokens.success },
    warning: { main: tokens.warning },
    background: { default: tokens.bg, paper: tokens.paper },
    divider: tokens.divider,
    text: {
      primary: tokens.text,
      secondary: tokens.text2,
    },
    neutral: { main: "#9AA0A6" },
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    fontSize: 14,
    h1: { fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" },
    body1: { fontSize: 16, lineHeight: 1.55 },
    body2: { fontSize: 14, lineHeight: 1.5 },
  },
  shape: {
    borderRadius: tokens.radiusSm,
  },
  components,
});

export default themeLight;