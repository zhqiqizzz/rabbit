import { loginApi } from "@/apis/user";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useCartStore } from "@/stores/cart";
import { mergeCartApi } from "@/apis/cart";

export const useUserStore = defineStore(
  "user",
  () => {
    const userInfo = ref({});
    const cartStore = useCartStore();
    const getUserInfo = async ({ account, password }) => {
      const res = await loginApi({ account, password });
      console.log(res);
      userInfo.value = res.result;
      // 登录成功后 合并购物车
      await mergeCartApi(
        cartStore.cartList.map((item) => {
          return {
            skuId: item.skuId,
            selected: item.selected,
            count: item.count,
          };
        })
      );
      cartStore.updateCartList();
    };
    const clearUserInfo = () => {
      userInfo.value = {};
      // 清空购物车数据
      cartStore.clearCart();
    };
    return {
      userInfo,
      getUserInfo,
      clearUserInfo,
    };
  },
  {
    persist: true,
  }
);
