import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Button, CircularProgress, Divider, TextField } from "@mui/material";
import useMutation from "@libs/useMutation";
import LabeledRow from "../LabelRow";

interface props {
  mutate: () => void;
  bonusData: { type: string; name: string; bonus: number }[];
  selectBonus:
    | {
        type: string;
        name: string;
        bonus: number;
      }
    | undefined;
  setSelectBonus: Dispatch<
    SetStateAction<
      | {
          type: string;
          name: string;
          bonus: number;
        }
      | undefined
    >
  >;
}

interface mutation {
  persnalBank: string;
  ok: boolean;
  write: boolean;
  notWrite: boolean;
}

export const DepositBank: FC<props> = (props) => {
  const { mutate, bonusData, selectBonus, setSelectBonus } = props;
  const [bank, setBank] = useState<null | string>(null);
  const [bankAccount, { data, loading, error }] = useMutation<mutation>(
    "/api/deposit/persnalBank"
  );
  const isBonus = (
    item: { type: string; name: string; bonus: number } | undefined
  ) => {
    if (selectBonus === item) setSelectBonus(undefined);
    else setSelectBonus(item);
  };
  const onHandler = () => {
    if (loading) return;
    if (bank) {
      setBank(null);
      return;
    }
    bankAccount({});
  };

  useEffect(() => {
    if (data) {
      if (data.ok) {
        if (data.write) {
          setBank("충전계좌 문의가 완료되었습니다. 고객센터에서 확인해주세요.");
        } else if (data.persnalBank) {
          setBank(data.persnalBank);
        } else if (data.notWrite) {
          setBank("충전계좌 문의가 완료되었습니다. 고객센터에서 확인해주세요.");
        } else {
          setBank("오류발생");
        }
      } else {
        setBank("오류발생");
      }
      mutate();
    }
  }, [data]);

  return (
    <>
      <LabeledRow label="충전계좌 확인" labelMd={2}>
        <Grid container spacing={1}>
          <Grid item xs={13} md={8}>
            <Box
              sx={{
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 1.5,
                border: (t) => `1px solid ${t.palette.divider}`,
                borderRadius: 1,
                bgcolor: (t) => t.palette.background.default,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: { xs: 13, md: 15 }, // 계좌 텍스트 크기 통일
              }}
              aria-live="polite"
            >
              {loading ? <CircularProgress size={18} thickness={5} /> : bank}
            </Box>
          </Grid>
          <Grid item xs={13} md={4} display={"flex"}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ whiteSpace: "nowrap", px: 2.25 }}
              disabled={loading}
              fullWidth
              onClick={onHandler}
            >
              {loading ? (
                <CircularProgress size={18} thickness={5} />
              ) : (
                "계좌확인"
              )}
            </Button>
          </Grid>
        </Grid>
      </LabeledRow>
      <LabeledRow label="이용 게임 선택" labelMd={2}>
        <Grid
          container
          sx={{
            display: "flex",
          }}
        >
          <Grid item xs={12} md={6}>
            <Box
              display={"flex"}
              alignItems={"center"}
              pb={1}
              width={"100%"}
              mt={2}
            >
              <Grid container spacing={1}>
                {bonusData &&
                  bonusData.map((item, index) => {
                    return (
                      <Grid
                        item
                        md={
                          selectBonus === item
                            ? 8
                            : selectBonus === undefined
                            ? 6
                            : 4
                        }
                        xs={
                          selectBonus === item
                            ? 8
                            : selectBonus === undefined
                            ? 6
                            : 4
                        }
                        boxShadow={2}
                        key={index}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          color={
                            selectBonus === item
                              ? "error"
                              : selectBonus === undefined
                              ? "inherit"
                              : "inherit"
                          }
                          onClick={() => isBonus(item)}
                          fullWidth
                          tabIndex={-1}
                        >
                          {selectBonus && selectBonus === item ? (
                            <Typography
                              fontSize={"small"}
                              sx={{ ml: 1 }}
                              fontWeight={"bold"}
                            >
                              {selectBonus?.type} {selectBonus?.name}{" "}
                              {selectBonus?.bonus}%(선택)
                            </Typography>
                          ) : (
                            <Typography fontSize={"small"} fontWeight={"bold"}>
                              {item.type}
                            </Typography>
                          )}
                        </Button>
                      </Grid>
                    );
                  })}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </LabeledRow>
    </>
  );
};
