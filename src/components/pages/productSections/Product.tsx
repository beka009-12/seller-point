"use client";

import { FC, useState } from "react";
import scss from "./Product.module.scss";
import { useGetProduct, useUpdateProduct } from "@/api/product";
import { useForm } from "react-hook-form";

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

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<ProductUpdate>();

  const watchTags = watch("tags", []);

  const openEditModal = (product: any) => {
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

  const onSubmit = async (data: ProductUpdate) => {
    if (!editingProduct) return;

    // Отправляем только то, что можно менять
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
                    {item.newPrice !== null ? (
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
        <div className={scss.modalOverlay} onClick={closeModal}>
          <div className={scss.modal} onClick={(e) => e.stopPropagation()}>
            <div className={scss.modalHeader}>
              <h2 className={scss.modalTitle}>Редактировать товар</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={scss.modalBody}>
              <div className={scss.formGroup}>
                <label className={scss.label}>Название товара *</label>
                <input
                  className={scss.input}
                  {...register("title", { required: true })}
                  placeholder="Например: Кроссовки Nike Air Max"
                />
              </div>

              <div className={scss.formGroup}>
                <label className={scss.label}>Описание</label>
                <textarea
                  className={scss.textarea}
                  rows={5}
                  {...register("description")}
                  placeholder="Расскажите о товаре: материал, особенности, для кого..."
                />
              </div>

              <div className={scss.formGroup}>
                <label className={scss.label}>
                  Цена со скидкой (необязательно)
                </label>
                <input
                  type="number"
                  step="1"
                  className={scss.input}
                  placeholder="Оставьте пустым, если нет скидки"
                  {...register("newPrice", { valueAsNumber: true })}
                />
              </div>

              <div className={scss.formGroup}>
                <label className={scss.label}>Количество на складе *</label>
                <input
                  type="number"
                  step="1"
                  className={scss.input}
                  {...register("stockCount", {
                    required: true,
                    valueAsNumber: true,
                    min: 0,
                  })}
                  placeholder="Количество доступных единиц товара"
                />
              </div>

              <div className={scss.formGroup}>
                <label className={scss.label}>Теги (через запятую)</label>
                <input
                  className={scss.input}
                  value={Array.isArray(watchTags) ? watchTags.join(", ") : ""}
                  onChange={(e) =>
                    setValue(
                      "tags",
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="новинка, лето, хит, акция"
                />
              </div>
            </form>

            <div className={scss.modalFooter}>
              <button
                type="button"
                onClick={closeModal}
                className={`${scss.btn} ${scss.btnSecondary}`}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isPending}
                onClick={handleSubmit(onSubmit)}
                className={`${scss.btn} ${scss.btnPrimary}`}
              >
                {isPending ? "Сохраняется..." : "Сохранить изменения"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Product;
