import httpInstance from "@/utils/http";
// 获取首页轮播图
export function getBannerApi() {
  return httpInstance({
    url: "/home/banner",
  });
}

// 获取新鲜好物
export function findNewApi() {
  return httpInstance({
    url: "/home/new",
  });
}

// 获取人气推荐
export function findHotApi() {
  return httpInstance({
    url: "/home/hot",
  });
}

// 获取商品列表
export function getGoodsApi() {
  return httpInstance({
    url: "/home/goods",
  });
}
