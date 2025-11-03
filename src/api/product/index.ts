import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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

// todo Product
const useGetProduct = () => {
  return useQuery<GETPRODUCT.useGetproductRes, GETPRODUCT.useGetproductReq>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/commodity/products");
      return response.data;
    },
  });
};

// todo Creategory
const useGetCategories = () => {
  return useQuery<GetCategoriesResponse>({
    queryKey: ["get-categories"],
    queryFn: async () => {
      const response = await api.get("/category/categories");
      return response.data;
    },
  });
};

// todo Brand
const useGetBrands = () => {
  return useQuery<GETPRODUCT.useGetBrandsRes, GETPRODUCT.useGetBrandsReq>({
    queryKey: ["brand"],
    queryFn: async () => {
      const response = await api.get("/brand/get-brands");
      return response.data;
    },
  });
};

// todo Updte
const useUpdateProduct = () => {
  return useMutation<
    GETPRODUCT.useUpdateProductRes,
    Error, //
    GETPRODUCT.useUpdateProductReq
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`commodity/product-update/${id}`, data);
      return response.data;
    },
  });
};

export { useGetProduct, useGetCategories, useGetBrands, useUpdateProduct };
