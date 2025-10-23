import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetCartState } from "src/redux/slices/cartSlice";
export const ClearData = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  useEffect(() => {
    dispatch(resetCartState());
  }, [dispatch, router.pathname]);
};
