import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "..";

// ==================== AUTH HOOKS ====================

const useSignUp = () => {
  return useMutation<AUTH.SignUpRes, Error, AUTH.SignUpReq>({
    mutationFn: async (data) => {
      const response = await api.post<AUTH.SignUpRes>(
        "/saller/sign-up-saller",
        data
      );
      return response.data;
    },
  });
};

const useSignIn = () => {
  return useMutation<AUTH.SignInRes, Error, AUTH.SignInReq>({
    mutationFn: async (data) => {
      const response = await api.post<AUTH.SignInRes>(
        "/saller/sign-in-saller",
        data
      );
      return response.data;
    },
  });
};

const useGetMe = () => {
  return useQuery<AUTH.MeRes, Error>({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await api.get<AUTH.MeRes>("/saller/saller-profile");
      return response.data;
    },
  });
};

const useCreateStore = () => {
  return useMutation<STORE.CreateStoreRes, Error, STORE.CreateStoreReq>({
    mutationFn: async (data) => {
      const response = await api.post<STORE.CreateStoreRes>(
        "/saller/create-store",
        data
      );
      return response.data;
    },
  });
};

const useGetMyStore = () => {
  return useQuery<STORE.GetMyStoreRes>({
    queryKey: ["my-store"],
    queryFn: async () => {
      const response = await api.get("/saller/my-store");
      return response.data;
    },
  });
};

// ==================== PRODUCT HOOKS ====================

const useCreateProduct = () => {
  return useMutation<PRODUCT.CreateProductRes, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await api.post<PRODUCT.CreateProductRes>(
        "/commodity/create-product",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
  });
};

export {
  useSignUp,
  useSignIn,
  useGetMe,
  useCreateProduct,
  useCreateStore,
  useGetMyStore,
};
