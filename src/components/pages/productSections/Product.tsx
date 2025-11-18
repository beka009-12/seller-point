"use client";
import { FC, useState } from "react";
import scss from "./Product.module.scss";
import {
  useGetProduct,
  useUpdateProduct,
  useGetCategories,
  useGetBrands,
} from "@/api/product";
import { useForm } from "react-hook-form";
import Image from "next/image";

interface ProductUpdate {
  id: number;
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
  inStock?: boolean;
  tags: string[];
  isArchived?: boolean;
  archivedAt?: string | null;
}

const Product: FC = () => {
  const { data: products, refetch } = useGetProduct();
  const { data: categoriesData } = useGetCategories();
  const { data: brandsData } = useGetBrands();
  const { mutateAsync: updateProduct } = useUpdateProduct();

  const [editingProduct, setEditingProduct] = useState<ProductUpdate | null>(
    null
  );

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<ProductUpdate>();
  const watchTags = watch("tags") || [];

  const openEditModal = (product: ProductUpdate) => {
    setEditingProduct(product);
    reset({
      id: product.id,
      categoryId: product.categoryId,
      brandId: product.brandId,
      title: product.title,
      description: product.description,
      images: product.images || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      price: product.price,
      newPrice: product.newPrice ?? null,
      stockCount: product.stockCount,
      inStock: product.inStock,
      tags: product.tags || [],
      isArchived: product.isArchived ?? false,
      archivedAt: product.archivedAt ?? null,
    });
  };

  const closeModal = () => setEditingProduct(null);

  const onSubmit = async (data: ProductUpdate) => {
    if (!editingProduct) return;

    await updateProduct({
      id: editingProduct.id,
      data,
    });

    closeModal();
    refetch();
  };

  const parentCategories =
    categoriesData?.categories.filter((c) => !c.parentId) || [];
  const childCategories =
    categoriesData?.categories.filter((c) => c.parentId) || [];

  return (
    <section className={scss.Product}>
      <div className="container">
        <div className={scss.content}>
          {products?.map((item) => (
            <div key={item.id} className={scss.card}>
              <div className={scss.imageWrapper}>
                {item.images?.[0] && (
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    width={200}
                    height={200}
                    className={scss.productImage}
                  />
                )}
              </div>
              <h3>{item.title}</h3>
              <p>Цена: {item.newPrice ?? item.price} сом</p>
              <button type="button" onClick={() => openEditModal(item)}>
                Редактировать
              </button>
            </div>
          ))}
        </div>

        {editingProduct && (
          <div className={scss.modalOverlay}>
            <div className={scss.modal}>
              <h2>Редактировать товар</h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                <label>Категория</label>
                <select {...register("categoryId", { required: true })}>
                  {parentCategories.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                  {childCategories.map((child) => {
                    const parent = parentCategories.find(
                      (p) => p.id === child.parentId
                    );
                    return (
                      <option key={child.id} value={child.id}>
                        {parent ? `${parent.name} → ${child.name}` : child.name}
                      </option>
                    );
                  })}
                </select>

                <label>Бренд</label>
                <select {...register("brandId", { required: true })}>
                  {brandsData?.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>

                <label>Название</label>
                <input {...register("title", { required: true })} />

                <label>Описание</label>
                <textarea {...register("description")} />

                <label>Цена</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { required: true })}
                />

                <label>Старая цена (необязательно)</label>
                <input type="number" step="0.01" {...register("newPrice")} />

                <label>Количество на складе</label>
                <input
                  type="number"
                  {...register("stockCount", { required: true })}
                />

                <label>Теги (через запятую)</label>
                <input
                  value={watchTags.join(", ")}
                  onChange={(e) =>
                    setValue(
                      "tags",
                      e.target.value.split(",").map((t) => t.trim())
                    )
                  }
                />

                <button type="submit">Сохранить</button>
                <button type="button" onClick={closeModal}>
                  Отмена
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Product;
