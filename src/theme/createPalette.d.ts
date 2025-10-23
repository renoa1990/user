// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as createPalette from "@mui/material/styles/createPalette";

declare module "@mui/material/styles/createPalette" {
  interface TypeBackground {
    paper: string;
    default: string;
    level2: string;
    level1: string;
    footer: string;
    inerpaper: string;
  }

  interface PaletteOptions {
    cardShadow?: string;
    alternate?: {
      main: string;
      dark: string;
    };
    action?: {
      active: string;
      hover: string;
      selected: string;
      disabledBackground: string;
      disabled: string;
    };
    background?: string;
    divider?: string;
    error?: string;
    info?: string;
    mode?: string;
    neutral?: any;
    primary?: string;
    secondary?: string;
    success?: string;
    text?: string;
    warning?: string;
    custom1: string;
    custom1hover: string;
  }

  interface Palette {
    cardShadow?: string;
    alternate: {
      main: string;
      dark: string;
    };
  }
}
