"use client";
import { FC, useState } from "react";
import scss from "./CreateProduct.module.scss";
import { useForm } from "react-hook-form";
import { useCreateProduct } from "@/api/user";
import toast from "react-hot-toast";

interface FormFields {
  category: string;
  brand: string;
  title: string;
  description: string;
  sizes: string;
  colors: string;
  price: number;
  newPrice?: number;
  stockCount: number;
  inStock: boolean;
  tags: string;
}

const CreateProduct: FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>();
  const { mutate: createProduct, isPending, error } = useCreateProduct();

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // превью картинок
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));

      const previews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setPreviewImages(previews);
    } else {
      setSelectedFiles([]);
      setPreviewImages([]);
    }
  };

  const onSubmit = (data: FormFields) => {
    const formData = new FormData();

    let Bool = (val: any) => (val === "true" || val === true ? true : false);

    formData.append("category", data.category);
    formData.append("brand", data.brand);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", String(data.price));
    if (data.newPrice) formData.append("newPrice", String(data.newPrice));
    formData.append("stockCount", String(data.stockCount));
    data.inStock = Bool(data.inStock);

    if (data.sizes)
      formData.append(
        "sizes",
        JSON.stringify(
          data.sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        )
      );

    if (data.colors)
      formData.append(
        "colors",
        JSON.stringify(
          data.colors
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        )
      );

    if (data.tags)
      formData.append(
        "tags",
        JSON.stringify(
          data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        )
      );

    // добавляем файлы
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    createProduct(formData, {
      onSuccess: () => {
        toast.success("Товар успешно создан");
        reset();
        setSelectedFiles([]);
        setPreviewImages([]);
      },
      onError: (err) => {
        toast.error("Ошибка при создании товара");
      },
    });
  };

  return (
    <section className={scss.CreateProduct}>
      <div className="container">
        <div className={scss.content}>
          <h1>Создание товара</h1>

          <form onSubmit={handleSubmit(onSubmit)} className={scss.form}>
            <div className={scss.formGroup}>
              <label htmlFor="category">Категория *</label>
              <input
                id="category"
                type="text"
                {...register("category", { required: "Категория обязательна" })}
                className={errors.category ? scss.error : ""}
              />
              {errors.category && <span>{errors.category.message}</span>}
            </div>

            <div className={scss.formGroup}>
              <label htmlFor="brand">Бренд *</label>
              <input
                id="brand"
                type="text"
                {...register("brand", { required: "Бренд обязателен" })}
                className={errors.brand ? scss.error : ""}
              />
              {errors.brand && <span>{errors.brand.message}</span>}
            </div>

            <div className={scss.formGroup}>
              <label htmlFor="title">Название товара *</label>
              <input
                id="title"
                type="text"
                {...register("title", { required: "Название обязательно" })}
                className={errors.title ? scss.error : ""}
              />
              {errors.title && <span>{errors.title.message}</span>}
            </div>

            <div className={scss.formGroup}>
              <label htmlFor="description">Описание *</label>
              <textarea
                id="description"
                rows={4}
                {...register("description", {
                  required: "Описание обязательно",
                })}
                className={errors.description ? scss.error : ""}
              />
              {errors.description && <span>{errors.description.message}</span>}
            </div>

            <div className={scss.formRow}>
              <div className={scss.formGroup}>
                <label htmlFor="sizes">Размеры (через запятую)</label>
                <input
                  id="sizes"
                  type="text"
                  placeholder="S, M, L, XL"
                  {...register("sizes")}
                />
              </div>

              <div className={scss.formGroup}>
                <label htmlFor="colors">Цвета (через запятую)</label>
                <input
                  id="colors"
                  type="color"
                  placeholder="Красный, Синий"
                  {...register("colors")}
                />
              </div>
            </div>

            <div className={scss.formRow}>
              <div className={scss.formGroup}>
                <label htmlFor="price">Цена *</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { required: "Цена обязательна" })}
                  className={errors.price ? scss.error : ""}
                />
                {errors.price && <span>{errors.price.message}</span>}
              </div>

              <div className={scss.formGroup}>
                <label htmlFor="newPrice">Новая цена (скидка)</label>
                <input
                  id="newPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("newPrice")}
                />
              </div>
            </div>

            <div className={scss.formRow}>
              <div className={scss.formGroup}>
                <label htmlFor="stockCount">Количество на складе</label>
                <input
                  id="stockCount"
                  type="number"
                  min="0"
                  defaultValue={0}
                  {...register("stockCount")}
                />
              </div>

              <div className={scss.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    {...register("inStock")}
                    defaultChecked
                  />
                  В наличии
                </label>
              </div>
            </div>

            <div className={scss.formGroup}>
              <label htmlFor="tags">Теги (через запятую)</label>
              <input
                id="tags"
                type="text"
                placeholder="новинка, акция"
                {...register("tags")}
              />
            </div>

            {/* Файлы */}
            <div className={scss.formGroup}>
              <label htmlFor="files">Фото товара</label>
              <input
                id="files"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesChange}
              />

              {previewImages.length > 0 && (
                <div className={scss.imagePreview}>
                  {previewImages.map((src, index) => (
                    <img key={index} src={src} alt={`preview-${index}`} />
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className={scss.errorMessage}>Ошибка: {error.message}</div>
            )}

            <div className={scss.formActions}>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setSelectedFiles([]);
                  setPreviewImages([]);
                }}
                disabled={isPending}
              >
                Очистить
              </button>

              <button type="submit" disabled={isPending}>
                {isPending ? "Создание..." : "Создать товар"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CreateProduct;
