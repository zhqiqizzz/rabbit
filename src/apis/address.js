import httpInstance from "@/utils/http";
// 添加收货地址
export const addAddressApi = (data) => {
  return httpInstance({
    url: "/member/address",
    method: "POST",
    data,
  });
};

// 修改收货地址
export const editAddressApi = (id, data) => {
  return httpInstance({
    url: `/member/address/${id}`,
    method: "PUT",
    data,
  });
};
