import { onBeforeRouteUpdate, useRoute } from "vue-router";
import { ref, watch } from "vue";
import { getTopCategoryAPI } from "@/apis/category";
export function useCategory() {
  // 获取一级分类数据
  const categoryData = ref({});
  const route = useRoute();

  const getTopCategory = async () => {
    const res = await getTopCategoryAPI(route.params.id);
    categoryData.value = res.result;
  };

  // 监听路由参数变化，获取对应分类数据
  watch(
    () => route.params.id,
    () => getTopCategory(),
    { immediate: true }
  );
  return {
    categoryData,
  };
  // 目标：在路由参数变化的时候，重新获取分类数据
  // onBeforeRouteUpdate((to) => {
  //     console.log(to);
  //     //上面的函数需要接收一个参数
  //     getTopCategory(to.params.id)
  // })
}
