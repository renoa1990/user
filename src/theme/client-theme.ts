import { Theme, responsiveFontSizes } from "@mui/material";
import { createTheme, ComponentsOverrides } from "@mui/material/styles";
import shadows from "./shadows";

const getTheme = (): Theme =>
  responsiveFontSizes(
    createTheme({
      palette: {
        alternate: {
          main: "#1a2138",
          dark: "#151a30",
        },
        cardShadow: "rgba(0, 0, 0, .11)",
        common: {
          black: "#000",
          white: "#fff",
        },
        mode: "dark",
        primary: {
          main: "#00BFFF", // 시그니처 컬러 (SkyBlue)
          light: "#33CCFF", // 밝은 톤
          dark: "#009ACD", // 어두운 톤
          contrastText: "#fff",
        },
        secondary: {
          light: "#FFEA41",
          main: "#FFE102",
          dark: "#DBBE01",
          contrastText: "rgba(0, 0, 0, 0.87)",
        },
        success: {
          light: "#4caf50",
          main: "#2e7d32",
          dark: "#1b5e20",
          contrastText: "#fff",
        },
        error: {
          light: "#ef5350",
          main: "#d32f2f",
          dark: "#c62828",
          contrastText: "#fff",
        },
        warning: {
          light: "#ff9800",
          main: "#ed6c02",
          dark: "#e65100",
          contrastText: "#fff",
        },
        info: {
          light: "#03a9f4",
          main: "#0288d1",
          dark: "#01579b",
          contrastText: "#fff",
        },
        text: {
          primary: "#EEEEEF",
          secondary: "#AEB0B4",
        },
        divider: "rgba(255, 255, 255, 0.12)",
        background: {
          paper: "rgba(22,22,22,0.6)",
          default: "#000",
          level2: "#121212",
          level1: "#121212",
          inerpaper: "rgba(255, 255, 255, 0.12)",
        },
        custom1: "#BCD2E8",
        custom1hover: "#91BAD6",
      },
      shadows: shadows("dark"),
      typography: {
        fontSize: 12,
        fontFamily:
          "'SCDream', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        button: {
          textTransform: "none",
          fontWeight: "medium" as React.CSSProperties["fontWeight"],
        },
      },
      zIndex: {
        appBar: 1200,
        drawer: 1300,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              fontWeight: 700,
              borderRadius: 5,
              paddingTop: 5,
              paddingBottom: 5,
              fontSize: 14,
            },
            containedSecondary: {},
          } as ComponentsOverrides["MuiButton"],
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              borderRadius: 5,
            },
          } as ComponentsOverrides["MuiInputBase"],
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 5,
            },
            input: {
              borderRadius: 5,
            },
          } as ComponentsOverrides["MuiOutlinedInput"],
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(0,191,255,0.4)", // SkyBlue 외곽선
              boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
              background: "rgba(22,22,22,0.6)",
            },
          },
        },
      },
    })
  );

export default getTheme;
