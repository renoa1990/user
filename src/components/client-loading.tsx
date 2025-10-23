import type { FC } from "react";

import { Backdrop, CircularProgress } from "@mui/material";

interface props {
  loading: boolean;
}

export const ClientLoading: FC<props> = (props) => {
  const { loading } = props;
  return (
    <Backdrop open={loading} style={{ zIndex: 9999 }}>
      <CircularProgress color="primary" />
    </Backdrop>
  );
};
