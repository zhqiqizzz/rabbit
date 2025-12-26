import httpInstance from "@/utils/http";

// 获取二级分类
export const getTopCategoryAPI = (id) => {
  return httpInstance({
    url: "/category",
    params: {
      id,
    },
  });
};
