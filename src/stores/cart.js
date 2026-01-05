import { defineStore } from "pinia";
import { ref } from "vue";
import { computed } from "vue";
import { insertCartApi, findCartListApi, delCartApi } from "@/apis/cart";
import { useUserStore } from "@/stores/user";
export const useCartStore = defineStore(
  "cart",
  () => {
    const userStore = useUserStore();
    const isLogin = computed(() => userStore.userInfo?.token);
    const cartList = ref([]);
    // 获取购物车列表
    const updateCartList = async () => {
      const res = await findCartListApi();
      cartList.value = res.result;
    };

    // 使用接口获取数据是为了下次登录的时候，数据还在
    // 添加商品到购物车
    const addCart = async (goods) => {
      const { skuId, count } = goods;
      if (isLogin.value) {
        // 已登录 调用接口添加到服务器
        await insertCartApi({ skuId, count });
        // 重新获取购物车列表
        await updateCartList();
      } else {
        const item = cartList.value.find((item) => item.skuId === goods.skuId);
        if (item) {
          // 购物车已存在该商品 数量累加
          item.count += goods.count;
        } else {
          // 购物车不存在该商品 直接添加
          cartList.value.push(goods);
        }
      }
    };

    // 删除购物车商品
    const delCart = async (skuId) => {
      if (isLogin.value) {
        await delCartApi([skuId]);
        // 重新获取购物车列表
        await updateCartList();
      } else {
        cartList.value = cartList.value.filter((item) => item.skuId !== skuId);
      }
    };

    // 清空购物车
    // 清除的是本地数据
    const clearCart = () => {
      cartList.value = [];
    };

    // 计算总数量和总价格
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

    // 计算选中数据
    const isAll = computed(() => {
      return cartList.value.every((item) => item.selected);
    });
    // 也可以用filter返回新数组再利用reduce计算
    // cartList.value.filter((item) => item.selected).reduce((acc, item) => acc + item.count, 0)
    const selectedCount = computed(() => {
      return cartList.value.reduce(
        (selectedCount, item) =>
          item.selected ? selectedCount + item.count : selectedCount,
        0
      );
    });
    const selectedPrice = computed(() => {
      return cartList.value.reduce(
        (selectedPrice, item) =>
          item.selected
            ? selectedPrice + item.price * item.count
            : selectedPrice,
        0
      );
    });

    // 单选商品
    const singleSelect = (skuId, selected) => {
      const item = cartList.value.find((item) => item.skuId === skuId);
      if (item) {
        item.selected = selected;
      }
    };

    // 全选商品
    const allSelected = (selected) => {
      cartList.value.forEach((item) => {
        item.selected = selected;
      });
    };
    return {
      cartList,
      totalCount,
      totalPrice,
      isAll,
      selectedCount,
      selectedPrice,
      addCart,
      delCart,
      singleSelect,
      allSelected,
      clearCart,
      updateCartList,
    };
  },
  {
    persist: true,
  }
);
