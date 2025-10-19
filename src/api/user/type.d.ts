interface Product {
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
}

interface Store {
  id: number;
  name: string;
  description: string;
  address: string;
  region: string;
  logo: string;
  createdAt: string;
  ownerId: number;
  products: Product[];
}

interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  avatar: string | null;
  phone: string | null;
  role: string;
  stores: Store[];
  createdAt: string;
  updatedAt: string;
}

// todo Auth types
namespace AUTH {
  type SignUpReq = { email: string; password: string; name: string };
  type SignUpRes = { message: string; user: User; token: string };
  type SignInReq = { email: string; password: string };
  type SignInRes = { message: string; user: User; token: string };
  type MeRes = {
    user: User;
  };
  type MeReq = void;

  type LogoutRes = { message: string };
  type LogoutReq = void;

  type UpdateProfileReq = {
    name?: string;
    phone?: string;
    avatar?: string;
  };
  type UpdateProfileRes = { message: string; user: User; token: string };
}
// todo Prodcut types
namespace PRODUCT {
  type CreateProductRes = {
    message: string;
    product: Product;
  };

  type CreateProductReq = {
    category: string;
    brand: string;
    title: string;
    description: string;
    sizes?: string[];
    colors?: string[];
    price: number;
    newPrice?: number;
    stockCount?: number;
    inStock?: boolean;
    tags?: string[];
    images?: string[];
  };
}
