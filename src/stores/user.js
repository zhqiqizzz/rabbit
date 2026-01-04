import { loginApi } from "@/apis/user";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore(
  "user",
  () => {
    const userInfo = ref({});
    const getUserInfo = async ({ account, password }) => {
      const res = await loginApi({ account, password });
      console.log(res);
      userInfo.value = res.result;
    };
    const clearUserInfo = () => {
      userInfo.value = {};
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
