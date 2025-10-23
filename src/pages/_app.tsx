import type { AppProps } from "next/app";
import AOS from "aos";
import { useEffect } from "react";
import { SWRConfig } from "swr";
import Head from "next/head";
import { SnackbarProvider } from "notistack";
import { Box, CssBaseline, Paper, ThemeProvider } from "@mui/material";
import getTheme from "@theme/client-theme";
import { Provider, useDispatch } from "react-redux";
import { store } from "../redux/store";
import "aos/dist/aos.css";
import "moment/locale/ko";
import moment from "moment-timezone";
import AnimatedSpaceBg from "@/components/AnimatedSpaceBg";
import RouteProgressLoader from "@/components/route-progress-loader";
moment.tz.setDefault("Asia/Seoul");

declare global {
  interface Window {
    turnstile: any;
    javascriptCallback: any;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const theme = getTheme();

  useEffect(() => {
    AOS.init({});
  });

  return (
    <SWRConfig
      value={{
        refreshInterval: 2000,
        fetcher: (url: string) =>
          fetch(url).then((response) => response.json()),
      }}
    >
      <Head>
        <title>Monaco</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3} autoHideDuration={2000}>
          <Paper elevation={0}>
            <Provider store={store}>
              {/* 페이지 전환 로딩 */}
              <RouteProgressLoader />

              {/* 배경 레이어 */}
              <Box
                sx={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 0,
                  bgcolor: "black",
                }}
                aria-hidden
              >
                <AnimatedSpaceBg
                  stars={650}
                  parallax={1.2}
                  meteorChance={0.03}
                  speed={3}
                />
              </Box>

              {/* 콘텐츠 레이어 (배경 위로) */}
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Component {...pageProps} />
              </Box>
            </Provider>
          </Paper>
        </SnackbarProvider>
      </ThemeProvider>
    </SWRConfig>
  );
}
