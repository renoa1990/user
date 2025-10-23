import { keyframes } from "@mui/material/styles";

// 애니메이션 키프레임
export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

export const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

export const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(25, 118, 210, 0.6);
  }
`;

// 공통 스타일
export const authContainerStyle = {
  position: "relative" as const,
  minHeight: "100dvh",
  backgroundColor: "#000",
  background: "linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)",
};

export const authCardStyle = {
  position: "relative" as const,
  zIndex: 1,
  minHeight: "100dvh",
  display: "grid",
  placeItems: "center",
  px: 2,
  py: 4,
};

export const authFormCardStyle = {
  width: { xs: "100%", sm: 420, md: 480 },
  maxWidth: "100%",
  borderRadius: 2,
  boxShadow:
    "0 8px 32px rgba(0, 191, 255, 0.1), 0 0 0 1px rgba(0, 191, 255, 0.1)",
  backgroundColor: "rgba(22, 22, 22, 0.8)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(0, 191, 255, 0.2)",
  animation: `${fadeInUp} 0.6s ease-out`,
  "&:hover": {
    boxShadow:
      "0 12px 40px rgba(0, 191, 255, 0.15), 0 0 0 1px rgba(0, 191, 255, 0.2)",
    transform: "translateY(-2px)",
    transition: "all 0.3s ease",
  },
};

export const authLogoStyle = {
  display: "flex",
  justifyContent: "center",
  mb: 3,
  animation: `${pulse} 2s infinite`,
};

export const authTitleStyle = {
  textAlign: "center" as const,
  mb: 1,
  color: "#00BFFF",
  fontWeight: 700,
  fontSize: { xs: "1.75rem", sm: "2rem" },
  textShadow: "0 0 10px rgba(0, 191, 255, 0.3)",
};

export const authSubtitleStyle = {
  textAlign: "center" as const,
  mb: 4,
  color: "#AEB0B4",
  fontSize: "1rem",
  lineHeight: 1.6,
};

export const authTextFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    transition: "all 0.3s ease",
    "&:hover": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#00BFFF",
        boxShadow: "0 0 0 2px rgba(0, 191, 255, 0.1)",
      },
    },
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: 2,
        borderColor: "#00BFFF",
        boxShadow: "0 0 0 3px rgba(0, 191, 255, 0.1)",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 500,
    color: "#AEB0B4",
    "&.Mui-focused": {
      color: "#00BFFF",
    },
  },
  "& .MuiInputBase-input": {
    color: "#EEEEEF",
  },
};

export const authButtonStyle = {
  borderRadius: 1,
  py: 1.5,
  fontSize: "1rem",
  fontWeight: 600,
  textTransform: "none" as const,
  boxShadow: "0 4px 16px rgba(0, 191, 255, 0.2)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 6px 20px rgba(0, 191, 255, 0.3)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
};

export const authLinkStyle = {
  color: "#00BFFF",
  textDecoration: "none",
  fontWeight: 500,
  transition: "all 0.3s ease",
  "&:hover": {
    color: "#33CCFF",
    textDecoration: "underline",
    textShadow: "0 0 8px rgba(0, 191, 255, 0.5)",
  },
};

export const authDividerStyle = {
  my: 3,
  "&::before, &::after": {
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
};

export const authStepIndicatorStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  mb: 3,
  "& .step": {
    display: "flex",
    alignItems: "center",
    "& .step-number": {
      width: 32,
      height: 32,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 600,
      fontSize: "0.875rem",
      transition: "all 0.3s ease",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: "#AEB0B4",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    "& .step-line": {
      width: 40,
      height: 2,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      margin: "0 8px",
      transition: "all 0.3s ease",
    },
    "&.active .step-number": {
      backgroundColor: "#00BFFF",
      color: "white",
      borderColor: "#00BFFF",
      boxShadow: "0 0 10px rgba(0, 191, 255, 0.3)",
      animation: `${glow} 2s infinite`,
    },
    "&.completed .step-number": {
      backgroundColor: "#2e7d32",
      color: "white",
      borderColor: "#2e7d32",
    },
    "&.completed .step-line": {
      backgroundColor: "#2e7d32",
    },
  },
};

export const authFormSectionStyle = {
  mb: 4,
  "& .section-title": {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#EEEEEF",
    mb: 2,
    display: "flex",
    alignItems: "center",
    "& .icon": {
      mr: 1,
      color: "#00BFFF",
    },
  },
};

export const authLoadingOverlayStyle = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
  borderRadius: 3,
};

export const authErrorStyle = {
  color: "#d32f2f",
  fontSize: "0.875rem",
  mt: 0.5,
  display: "flex",
  alignItems: "center",
  "& .icon": {
    mr: 0.5,
    fontSize: "1rem",
  },
};

export const authSuccessStyle = {
  color: "#2e7d32",
  fontSize: "0.875rem",
  mt: 0.5,
  display: "flex",
  alignItems: "center",
  "& .icon": {
    mr: 0.5,
    fontSize: "1rem",
  },
};
