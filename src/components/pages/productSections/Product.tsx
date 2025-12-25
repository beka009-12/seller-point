"use client";

import { FC, useState } from "react";
import scss from "./Product.module.scss";
import { useGetProduct, useUpdateProduct } from "@/api/product";
import { useForm } from "react-hook-form";
import EditProductModal from "./product/EditProductModal";

interface ProductUpdate {
  id: number;
  title: string;
  description: string;
  price: number;
  newPrice?: number | null;
  tags: string[];
  categoryId: number;
  brandId: number;
  stockCount: number;
  images: string[];
}

const Product: FC = () => {
  const { data: products, refetch } = useGetProduct();
  const { mutateAsync: updateProduct, isPending } = useUpdateProduct();

  const [editingProduct, setEditingProduct] = useState<ProductUpdate | null>(
    null
  );

  const { reset, watch } = useForm<ProductUpdate>();

  const watchTags = watch("tags", []);

  const openEditModal = (product: ProductUpdate) => {
    setEditingProduct(product);
    reset({
      id: product.id,
      title: product.title,
      description: product.description,
      newPrice: product.newPrice ?? undefined,
      tags: product.tags || [],
      categoryId: product.categoryId,
      brandId: product.brandId,
      stockCount: product.stockCount,
      images: product.images || [],
    });
  };

  const closeModal = () => {
    setEditingProduct(null);
    reset();
  };

  const onSubmit = async (data: {
    title: string;
    description: string;
    newPrice?: number | null;
    stockCount: number;
    tags: string[];
  }) => {
    if (!editingProduct) return;

    await updateProduct({
      id: editingProduct.id,
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        newPrice: data.newPrice || null,

        tags: data.tags,
        stockCount: data.stockCount || 0,
      },
    });

    refetch();
    closeModal();
  };

  return (
    <>
      <section className={scss.Product}>
        <div className={scss.container}>
          <header className={scss.header}>
            <h1 className={scss.title}>Мои товары</h1>
            <p className={scss.subtitle}>
              Редактируйте название, описание, цену и теги
            </p>
          </header>

          <div className={scss.content}>
            {products?.map((item) => (
              <div key={item.id} className={scss.card}>
                <div className={scss.imageWrapper}>
                  {item.images?.[0] ? (
                    <img loading="lazy" src={item.images[0]} alt={item.title} />
                  ) : (
                    <img
                      loading="lazy"
                      src="https://серебро.рф/img/placeholder.png"
                      alt="фото товара нет"
                    />
                  )}
                </div>

                <div className={scss.info}>
                  <h3 className={scss.productTitle}>{item.title}</h3>

                  <div className={scss.price}>
                    {item.newPrice !== null && item.newPrice !== 0 ? (
                      item.newPrice! < item.price ? (
                        <>
                          <span className={scss.currentPrice}>
                            {item.newPrice} сом
                          </span>
                          <span className={scss.oldPrice}>
                            {item.price} сом
                          </span>
                        </>
                      ) : (
                        <span className={scss.currentPrice}>
                          {item.newPrice} сом
                        </span>
                      )
                    ) : (
                      <span className={scss.currentPrice}>
                        {item.price} сом
                      </span>
                    )}
                  </div>

                  {item.stockCount > 0 ? (
                    <span className={scss.inStock}>
                      В наличии {item.stockCount} шт
                    </span>
                  ) : (
                    <span className={scss.outOfStock}>Нет в наличии</span>
                  )}

                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className={scss.editBtn}
                  >
                    Редактировать
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isPending={isPending}
          onClose={closeModal}
          onSave={onSubmit}
        />
      )}
    </>
  );
};

export default Product;
