import httpInstance from "@/utils/http";
/*
params: {
  orderState:0, // tab栏状态 0全部订单，1待付款，2待发货，3待收货...
  page:1,
  pageSize:2
}
*/
export const getUserOrderApi = (params) => {
  return httpInstance({
    url: "/member/order",
    params,
  });
};
