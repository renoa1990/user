import type { FC } from "react";
import { Box, Container, Drawer, Typography } from "@mui/material";

import Image from "next/image";

const PARTNERS = [
  { name: "Evolution", src: "/images/partners/logo-ev.png" },
  { name: "BG", src: "/images/partners/logo-bg.png" },
  { name: "AG", src: "/images/partners/logo-ag.png" },
  { name: "Pragmatic", src: "/images/partners/logo-pragmatic.png" },
  { name: "Microgaming", src: "/images/partners/logo-microgaming.png" },
  { name: "OneTouch", src: "/images/partners/logo-onetouch.png" },
  { name: "Playtech", src: "/images/partners/logo-playtech.png" },
  { name: "SkyWind", src: "/images/partners/logo-skywind_white.png" },
];
export const Footer: FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        borderTop: "1px solid rgba(223,227,228,0.14)",
        bgcolor: "rgba(0,0,0,0.6)",
        pb: { xs: 8, md: 0 }, // 모바일에서 하단 네비게이션 여백
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Box
          sx={{
            display: { xs: "none", sm: "none", md: "flex" }, // md부터만 표시
            flexWrap: "wrap",
            gap: { xs: 2, md: 3 },
            justifyContent: "center",
            alignItems: "center",
            opacity: 0.9,
          }}
        >
          {PARTNERS.map((p) => (
            <Box
              key={p.name}
              title={p.name}
              sx={{
                display: "grid",
                placeItems: "center",
                width: 120, // 로고 박스 폭 (통일)
                height: 44, // 로고 박스 높이 (통일)
                px: 1.5,

                transition:
                  "transform .15s ease, opacity .15s ease, filter .15s ease",
                filter: "grayscale(1)",
                "&:hover": {
                  filter: "grayscale(0)",
                  opacity: 1,
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Image
                src={p.src}
                alt={`${p.name} logo`}
                width={96}
                height={28}
                loading="lazy"
                style={{ objectFit: "contain" }}
              />
            </Box>
          ))}
        </Box>
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Image
            src="/images/main_logo.png"
            alt="GGBET"
            width={100}
            height={38}
            priority={false}
          />
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1, color: "text.secondary" }}
          >
            BABEL provides reliable games with official licenses, including
            sports, mini games, casino, and baccarat.
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 1, display: "block" }}
          >
            copyright BABEL © all rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
