import type { NextPage } from "next";
import Head from "next/head";
import {
  Backdrop,
  Box,
  CircularProgress,
  Container,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const LoadingPage: NextPage = () => {
  const theme = useTheme();
  const mobileDevice = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <Head>
        <title>Loading: 로딩중입니다</title>
      </Head>
      <Backdrop open={true} style={{ zIndex: 9999 }}>
        <CircularProgress color="primary" />
      </Backdrop>
      <Box
        component="main"
        height={"100vh"}
        sx={{
          alignItems: "center",
          backgroundColor: "background.paper",
          display: "flex",
          flexGrow: 1,
        }}
      >
        <Container maxWidth="xl">
          <Typography
            align="center"
            variant={mobileDevice ? "h4" : "h1"}
            fontWeight={"bold"}
          >
            Game Loading...
          </Typography>
          <Typography align="center" fontWeight={"bold"}>
            게임이 실행되지 않는경우 (창닫기 - 새로고침) 후 재시도해주세요.
          </Typography>
        </Container>
      </Box>
    </>
  );
};

export default LoadingPage;
