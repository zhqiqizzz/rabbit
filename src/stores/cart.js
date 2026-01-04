import { defineStore } from "pinia";
import { ref } from "vue";
import { computed } from "vue";
export const useCartStore = defineStore(
  "cart",
  () => {
    const cartList = ref([]);
    const addCart = (goods) => {
      const item = cartList.value.find((item) => item.skuId === goods.skuId);
      if (item) {
        // 购物车已存在该商品 数量累加
        item.count += goods.count;
      } else {
        // 购物车不存在该商品 直接添加
        cartList.value.push(goods);
      }
    };
    const delCart = (skuId) => {
      cartList.value = cartList.value.filter((item) => item.skuId !== skuId);
    };
    const totalCount = computed(() => {
      return cartList.value.reduce(
        (totalCount, item) => totalCount + item.count,
        0
      );
    });
    const totalPrice = computed(() => {
      return cartList.value.reduce(
        (totalPrice, item) => totalPrice + item.price * item.count,
        0
      );
    });
    return {
      cartList,
      totalCount,
      totalPrice,
      addCart,
      delCart,
    };
  },
  {
    persist: true,
  }
);
