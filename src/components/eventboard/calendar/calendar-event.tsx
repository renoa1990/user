import { useState } from "react";
import { styled } from "@mui/system";
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { calendarEventData } from "@prisma/client";

const AttendanceMarker = styled(Box)(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  animation: "pulse 2s infinite",
  "@keyframes pulse": {
    "0%, 100%": {
      transform: "scale(1)",
    },
    "50%": {
      transform: "scale(1.05)",
    },
  },
}));

interface props {
  onMonthChange: (newMonth: string) => void;
  onYearChange: (newYear: string) => void;
  month: string | undefined;
  year: string | undefined;
  calendarDay?: calendarEventData[];
}
export const CalendarEvent: React.FC<props> = (props) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { onMonthChange, onYearChange, month, year, calendarDay } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const prevMonth = () => {
    setCurrentDate((prevDate) => {
      const prevMonthDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() - 1
      );
      onMonthChange(prevMonthDate.getMonth().toString());
      onYearChange(prevMonthDate.getFullYear().toString());
      return prevMonthDate;
    });
  };

  const nextMonth = () => {
    setCurrentDate((prevDate) => {
      const nextMonthDate = new Date(
        prevDate.getFullYear(),
        prevDate.getMonth() + 1
      );
      onMonthChange(nextMonthDate.getMonth().toString());
      onYearChange(nextMonthDate.getFullYear().toString());
      return nextMonthDate;
    });
  };

  const getMonthYearString = (date: Date) => {
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "long" });

    return `${year}년 ${month}`;
  };

  const getDaysOfWeek = () => {
    const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
    return daysOfWeek.map((day, index) => (
      <TableCell
        key={day}
        align="center"
        sx={{
          bgcolor: "background.default",
          borderBottom: (t) => `2px solid ${t.palette.divider}`,
          py: 1.5,
        }}
      >
        <Typography
          variant="body2"
          fontWeight={700}
          color={index === 0 ? "error.main" : "text.primary"}
        >
          {day}
        </Typography>
      </TableCell>
    ));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const offset = firstDayOfMonth.getDay();

    const days = [];
    let currentRow = [];
    for (let i = 0; i < offset; i++) {
      currentRow.push(<TableCell key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSunday = date.getDay() === 0;

      const dateString = date.toISOString().substring(0, 10);
      const isHighlighted = calendarDay?.some(
        (dayData) =>
          new Date(dayData.check).toDateString() === date.toDateString()
      );

      currentRow.push(
        <TableCell
          key={day}
          align="center"
          sx={{
            position: "relative",
            height: { xs: 60, sm: 80 },
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: isHighlighted ? "success.lighter" : "transparent",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: isHighlighted ? "success.light" : "action.hover",
            },
          }}
        >
          {isHighlighted ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap={0.5}
            >
              <AttendanceMarker>
                <CheckCircleIcon fontSize="small" />
              </AttendanceMarker>
              <Typography
                variant="caption"
                fontWeight={600}
                color="success.main"
              >
                출석
              </Typography>
            </Box>
          ) : (
            <Typography
              variant="body2"
              fontWeight={500}
              color={isSunday ? "error.main" : "text.primary"}
            >
              {day}
            </Typography>
          )}
        </TableCell>
      );

      if ((offset + day) % 7 === 0) {
        days.push(<TableRow key={`row-${day}`}>{currentRow}</TableRow>);
        currentRow = [];
      }
    }

    if (currentRow.length > 0) {
      days.push(<TableRow key={`row-${daysInMonth}`}>{currentRow}</TableRow>);
    }

    return days;
  };

  return (
    <Box
      sx={{
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      {/* 달력 헤더 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 2,
          py: 2,
          bgcolor: "background.default",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <IconButton
          onClick={prevMonth}
          size={isMobile ? "small" : "medium"}
          sx={{
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "primary.lighter" },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Typography
          variant={isMobile ? "h6" : "h5"}
          fontWeight={700}
          color="primary.main"
        >
          {getMonthYearString(currentDate)}
        </Typography>

        <IconButton
          onClick={nextMonth}
          size={isMobile ? "small" : "medium"}
          sx={{
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "primary.lighter" },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* 달력 테이블 */}
      <Table sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>{getDaysOfWeek()}</TableRow>
        </TableHead>
        <TableBody>{getDaysInMonth()}</TableBody>
      </Table>
    </Box>
  );
};
