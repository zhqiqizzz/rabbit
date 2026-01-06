import httpInstance from "@/utils/http";

export const getPayInfoApi = (id) => {
  return httpInstance({
    url: `/member/order/${id}`,
  });
};
