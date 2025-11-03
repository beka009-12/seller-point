interface Category {
  id: number;
  name: string;
  parentId?: number | null;
  parent?: Category | null;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

interface Brand {
  id: number;
  name: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductUpdate {
  categoryId: number;
  brandId: number;
  title: string;
  description: string;
  images: string[];
  sizes: string[];
  colors: string[];
  price: number;
  newPrice?: number | null;
  stockCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  archivedAt?: string | null;
}

namespace GETPRODUCT {
  // ! Brand
  type useGetBrandsRes = {
    id: number;
    name: string;
    logoUrl?: string;
    createdAt: string;
    updatedAt: string;
  }[];
  type useGetBrandsReq = void;

  // ! Product
  type useGetproductRes = {
    id: number;
    shopId: number;
    categoryId: number;
    brandId: number;
    title: string;
    description: string;
    images: string[];
    sizes: string[];
    colors: string[];
    price: number;
    newPrice?: number | null;
    stockCount: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    isArchived?: boolean;
    archivedAt?: string | null;
  }[];
  type useGetproductReq = void;

  type useUpdateProductRes = {
    id: number;
    shopId: number;
    categoryId: number;
    brandId: number;
    title: string;
    description: string;
    images: string[];
    sizes: string[];
    colors: string[];
    price: number;
    newPrice?: number | null;
    stockCount: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    isArchived?: boolean;
    archivedAt?: string | null;
  }[];
  type useUpdateProductReq = {
    id: number;
    data: Partial<ProductUpdate>;
  };
}
