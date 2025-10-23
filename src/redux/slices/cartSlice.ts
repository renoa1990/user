// slices/cartSlice.ts
import { cartSetup, cartState } from "@datatypes/cart";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartState {
  items: cartState[];
  setup: cartSetup | undefined;
}

const initialState: CartState = {
  items: [],
  setup: {
    minBet: "",
    maxBet: "",
    maxResult: "",
    // 기타 초기값 설정
  },
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<cartState>) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateItem: (
      state,
      action: PayloadAction<{ index: number; item: cartState }>
    ) => {
      const { index, item } = action.payload;
      state.items[index] = item;
    },
    updateCartSetup: (state, action: PayloadAction<cartSetup>) => {
      state.setup = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
    },
    updateCartList: (state, action: PayloadAction<cartState[]>) => {
      state.items = action.payload;
    },
    resetCartState: (state) => {
      state.items = [];
      state.setup = undefined;
    },
  },
});

export const {
  addItem,
  removeItem,
  updateCartSetup,
  clearCart,
  updateCartList,
  updateItem,
  resetCartState,
} = cartSlice.actions;

export default cartSlice.reducer;
