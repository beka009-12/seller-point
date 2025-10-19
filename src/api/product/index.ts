import { useQuery } from "@tanstack/react-query";
import { api } from "..";

const useGetProduct = () => {
  return useQuery<GETPRODUCT.useGetproductRes, GETPRODUCT.useGetproductReq>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/commodity/products");
      return response.data;
    },
  });
};

export { useGetProduct };
