namespace GETPRODUCT {
  type useGetproductRes = {
    id: number;
    shopId: number;
    category: string;
    brand: string;
    title: string;
    description: string;
    images: string[];
    sizes: string[];
    colors: string[];
    price: number;
    newPrice?: number | null;
    stockCount: number;
    inStock: boolean;
    tags: string[];
    createdAt: string;
  }[];

  type useGetproductReq = void;
}
