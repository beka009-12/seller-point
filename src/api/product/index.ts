import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "..";

interface Category {
  id: number;
  name: string;
  parentId?: number | null;
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

interface GetCategoriesResponse {
  categories: Category[];
}

const useGetProduct = () => {
  return useQuery<GETPRODUCT.useGetproductRes, GETPRODUCT.useGetproductReq>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/commodity/products");
      return response.data;
    },
  });
};

const useGetCategories = () => {
  return useQuery<GetCategoriesResponse>({
    queryKey: ["get-categories"],
    queryFn: async () => {
      const response = await api.get("/category/categories");
      return response.data;
    },
  });
};

const useGetBrands = () => {
  return useQuery<GETPRODUCT.useGetBrandsRes, GETPRODUCT.useGetBrandsReq>({
    queryKey: ["brand"],
    queryFn: async () => {
      const response = await api.get("/brand/get-brands");
      return response.data;
    },
  });
};

const useUpdateProduct = () => {
  return useMutation<
    GETPRODUCT.useUpdateProductRes,
    Error,
    GETPRODUCT.useUpdateProductReq
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`commodity/product-update/${id}`, data);
      return response.data;
    },
  });
};

export { useGetProduct, useGetCategories, useGetBrands, useUpdateProduct };
