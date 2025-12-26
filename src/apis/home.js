import httpInstance from "@/utils/http";
// 获取首页轮播图
export function getBannerApi(params = {}) {
  // distributionSite: 1 代表首页轮播图 2 代表分类轮播图
  const { distributionSite = "1" } = params;
  return httpInstance({
    url: "/home/banner",
    params: {
      distributionSite,
    },
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
