import React from "react";
import Box from "@mui/material/Box";

interface Props {
  children: React.ReactNode;
  // All other props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

const Container = ({ children, ...rest }: Props): JSX.Element => (
  <Box
    maxWidth={{ sm: 720, md: 1236 }}
    width={1}
    margin={"0 auto"}
    paddingX={{ xs: 0, sm: 1, md: 2 }}
    {...rest}
  >
    {children}
  </Box>
);

export default Container;
