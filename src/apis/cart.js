import httpInstance from "@/utils/http";
// 加入购物车
export const insertCartApi = ({ skuId, count }) => {
  return httpInstance({
    url: "/member/cart",
    method: "POST",
    data: {
      skuId,
      count,
    },
  });
};

// 获取购物车列表
export const findCartListApi = () => {
  return httpInstance({
    url: "/member/cart",
  });
};

// 删除购物车商品
// "ids": [
//   "300254017",
//   "300283140"
// ]
export const delCartApi = (ids) => {
  return httpInstance({
    url: "/member/cart",
    method: "DELETE",
    data: {
      ids,
    },
  });
};

// 合并购物车
export const mergeCartApi = (data) => {
  return httpInstance({
    url: "/member/cart/merge",
    method: "POST",
    data,
  });
};
