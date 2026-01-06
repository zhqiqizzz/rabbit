import httpInstance from "@/utils/http";

export const getCheckoutInfoApi = () => {
  return httpInstance({
    url: "/member/order/pre",
  });
};

export const createOrderApi = (data) => {
  return httpInstance({
    url: "/member/order",
    method: "POST",
    data,
  });
};
