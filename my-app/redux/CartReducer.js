import { createSlice } from "@reduxjs/toolkit";

export const CartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
  },
  reducers: {
    addToCart: (state, action) => {
      const itemPresent = state.cart.find((item) => item._id === action.payload._id);
    
      if (itemPresent) {
        // Nếu sản phẩm đã tồn tại, chỉ cộng dồn số lượng nếu chưa vượt quá stock
        if (itemPresent.quantity + action.payload.quantity <= action.payload.stock) {
          itemPresent.quantity += action.payload.quantity;
        } else {
          alert("You have reached the maximum stock limit!");
        }
      } else {
        // Nếu là sản phẩm hoàn toàn mới, thêm vào giỏ hàng
        state.cart.push({ ...action.payload });
      }
    },
    
        
    removeFromCart: (state, action) => {
      const removeItem = state.cart.filter(
        (item) => item._id !== action.payload._id
      );
      state.cart = removeItem;
    },
    incrementQuantity: (state, action) => {
      const itemPresent = state.cart.find(
        (item) => item._id === action.payload._id
      );
      itemPresent.quantity++;
    },
    decrementQuantity: (state, action) => {
      const itemPresent = state.cart.find(
        (item) => item._id === action.payload._id
      );
      if (itemPresent.quantity === 1) {
        itemPresent.quantity = 0;
        const removeItem = state.cart.filter(
          (item) => item._id !== action.payload._id
        );
        state.cart = removeItem;
      } else {
        itemPresent.quantity--;
      }
    },
    cleanCart:(state) => {
        state.cart = [];
    }
  },
});


export const {addToCart,removeFromCart,incrementQuantity,decrementQuantity,cleanCart} = CartSlice.actions;

export default CartSlice.reducer