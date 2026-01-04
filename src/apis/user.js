import httpInstance from "@/utils/http";
export const loginApi = ({ account, password }) => {
  return httpInstance({
    url: "/login",
    method: "POST",
    data: {
      account,
      password,
    },
  });
};
