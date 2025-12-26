import { defineStore } from "pinia";
import { getBannerApi } from "@/apis/home";
import { onMounted, ref } from "vue";

// 获取轮播图数据
export const userBannerStore = defineStore("banner", () => {
  const bannerList = ref([]);
  const getBanner = async () => {
    const res = await getBannerApi({
      distributionSite: "2",
    });
    bannerList.value = res.result;
  };

  return {
    bannerList,
    getBanner,
  };
});
