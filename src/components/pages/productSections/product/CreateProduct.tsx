"use client";
import { FC, useState, useEffect, useMemo } from "react";
import scss from "./CreateProduct.module.scss";
import { useForm } from "react-hook-form";
import { useCreateProduct } from "@/api/user";
import toast from "react-hot-toast";
import { useGetBrands, useGetCategories } from "@/api/product";

interface FormFields {
  parentCategoryId: number;
  categoryId: number;
  brandId: number;
  title: string;
  description: string;
  sizes: string[];
  colors: string[];
  price: number;
  newPrice?: number;
  stockCount: number;
  tags: string;
}

const CreateProduct: FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormFields>({
    defaultValues: {
      stockCount: 0,
      sizes: [],
      colors: [],
    },
  });

  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  const { data: categoriesData } = useGetCategories();
  const { data: brandsData, isLoading: isBrandsLoading } = useGetBrands();

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customSize, setCustomSize] = useState<string>("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState<string>("");
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);

  const parentCategoryId = watch("parentCategoryId");
  const categoryId = watch("categoryId");

  // Мемоизация категорий
  const parentCategories = useMemo(
    () => categoriesData?.categories.filter((cat) => !cat.parentId) || [],
    [categoriesData]
  );

  const subCategories = useMemo(
    () =>
      categoriesData?.categories.filter(
        (cat) => cat.parentId === parentCategoryId
      ) || [],
    [categoriesData, parentCategoryId]
  );

  // Определение типа категории
  const isShoeCategory = useMemo(() => {
    const category = subCategories.find((cat) => cat.id === categoryId);
    return category?.name.toLowerCase().includes("обувь") || false;
  }, [subCategories, categoryId]);

  // Доступные размеры
  const availableSizes = useMemo(() => {
    const clothingSizes = ["XS", "S", "M", "L", "XL", "XXL"];
    const shoeSizes = Array.from({ length: 13 }, (_, i) => (35 + i).toString());
    return isShoeCategory ? shoeSizes : clothingSizes;
  }, [isShoeCategory]);

  const predefinedColors = [
    { name: "Красный", value: "#FF0000" },
    { name: "Синий", value: "#0000FF" },
    { name: "Зелёный", value: "#008000" },
    { name: "Чёрный", value: "#000000" },
    { name: "Белый", value: "#FFFFFF" },
    { name: "Жёлтый", value: "#FFD700" },
    { name: "Розовый", value: "#FFC0CB" },
    { name: "Серый", value: "#808080" },
  ];

  // Сброс подкатегории при смене родительской категории
  useEffect(() => {
    if (parentCategoryId) {
      setValue("categoryId", 0);
    }
  }, [parentCategoryId, setValue]);

  // Обработка файлов
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      setPreviewImages([]);
      return;
    }

    const validFiles = Array.from(files).filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Файл ${file.name} слишком большой (максимум 5 МБ)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // Удаление изображения
  const handleRemoveImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Обработка размеров
  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Добавление кастомного размера
  const handleAddCustomSize = () => {
    const trimmedSize = customSize.trim();
    if (!trimmedSize) {
      toast.error("Введите размер");
      return;
    }
    if (selectedSizes.includes(trimmedSize)) {
      toast.error("Этот размер уже добавлен");
      return;
    }
    setSelectedSizes([...selectedSizes, trimmedSize]);
    setCustomSize("");
    toast.success("Размер добавлен");
  };

  // Обработка цветов
  const handleColorToggle = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  // Добавление кастомного цвета
  const handleAddCustomColor = () => {
    const trimmedColor = customColor.trim();
    if (!trimmedColor) {
      toast.error("Введите название цвета");
      return;
    }
    if (selectedColors.includes(trimmedColor)) {
      toast.error("Этот цвет уже добавлен");
      return;
    }
    setSelectedColors([...selectedColors, trimmedColor]);
    setCustomColor("");
    toast.success("Цвет добавлен");
  };

  // Отправка формы
  const onSubmit = async (data: FormFields) => {
    // Валидация
    if (!data.parentCategoryId) {
      toast.error("Выберите родительскую категорию");
      return;
    }
    if (!data.categoryId) {
      toast.error("Выберите подкатегорию");
      return;
    }
    if (selectedSizes.length === 0) {
      toast.error("Выберите хотя бы один размер");
      return;
    }
    if (selectedColors.length === 0) {
      toast.error("Выберите хотя бы один цвет");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Добавьте хотя бы одно изображение товара");
      return;
    }

    const formData = new FormData();

    // Основные поля
    formData.append("categoryId", String(data.categoryId));
    formData.append("brandId", String(data.brandId));
    formData.append("title", data.title.trim());
    formData.append("description", data.description.trim());
    formData.append("price", String(data.price));

    if (data.newPrice && data.newPrice > 0) {
      if (data.newPrice >= data.price) {
        toast.error("Новая цена должна быть меньше старой");
        return;
      }
      formData.append("newPrice", String(data.newPrice));
    }

    formData.append("stockCount", String(data.stockCount));

    // Размеры и цвета
    formData.append("sizes", JSON.stringify(selectedSizes));
    formData.append("colors", JSON.stringify(selectedColors));

    // Теги
    if (data.tags?.trim()) {
      const tagsArray = data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(tagsArray));
    }

    // Файлы
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await createProduct(formData);
      toast.success("Товар успешно создан!");
      handleResetForm();
    } catch (error: any) {
      toast.error(error?.message || "Ошибка при создании товара");
    }
  };

  // Полный сброс формы
  const handleResetForm = () => {
    reset();
    setSelectedFiles([]);
    setPreviewImages([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setCustomSize("");
    setCustomColor("");
    setShowSubcategoryDropdown(false);
  };

  // Очистка URL объектов при размонтировании
  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  return (
    <section className={scss.CreateProduct}>
      <div className={scss.container}>
        <div className={scss.content}>
          <h1>Создание товара</h1>

          <form onSubmit={handleSubmit(onSubmit)} className={scss.form}>
            {/* Родительская категория */}
            <div className={scss.formGroup}>
              <label>Родительская категория *</label>
              <div className={scss.parentCategoryButtons}>
                {parentCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={
                      parentCategoryId === cat.id ? scss.activeParent : ""
                    }
                    onClick={() => setValue("parentCategoryId", cat.id)}
                    disabled={isPending}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              {errors.parentCategoryId && (
                <span className={scss.errorText}>
                  {errors.parentCategoryId.message}
                </span>
              )}
            </div>

            {/* Подкатегория */}
            {parentCategoryId > 0 && (
              <div className={scss.formGroup}>
                <label>Подкатегория *</label>
                <div
                  className={`${scss.customSelect} ${
                    showSubcategoryDropdown ? scss.open : ""
                  }`}
                >
                  <div
                    className={`${scss.selectHeader} ${
                      categoryId ? scss.active : ""
                    }`}
                    onClick={() =>
                      !isPending && setShowSubcategoryDropdown((prev) => !prev)
                    }
                  >
                    <span>
                      {subCategories.find((c) => c.id === categoryId)?.name ||
                        "Выберите подкатегорию"}
                    </span>
                    <div className={scss.arrow}></div>
                  </div>

                  {showSubcategoryDropdown && (
                    <div className={`${scss.dropdown} ${scss.open}`}>
                      {subCategories.length > 0 ? (
                        subCategories.map((cat) => (
                          <div
                            key={cat.id}
                            className={`${scss.dropdownItem} ${
                              categoryId === cat.id ? scss.selected : ""
                            }`}
                            onClick={() => {
                              setValue("categoryId", cat.id);
                              setShowSubcategoryDropdown(false);
                            }}
                          >
                            {cat.name}
                          </div>
                        ))
                      ) : (
                        <div className={scss.dropdownItem}>
                          Нет подкатегорий
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.categoryId && (
                  <span className={scss.errorText}>
                    {errors.categoryId.message}
                  </span>
                )}
              </div>
            )}

            {/* Бренд */}
            <div className={scss.formGroup}>
              <label htmlFor="brandId">Бренд *</label>
              <select
                id="brandId"
                {...register("brandId", {
                  required: "Выберите бренд",
                  valueAsNumber: true,
                })}
                className={errors.brandId ? scss.error : ""}
                disabled={isBrandsLoading || isPending}
              >
                <option value="">Выберите бренд</option>
                {brandsData?.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brandId && (
                <span className={scss.errorText}>{errors.brandId.message}</span>
              )}
            </div>

            {/* Название */}
            <div className={scss.formGroup}>
              <label htmlFor="title">Название товара *</label>
              <input
                id="title"
                type="text"
                placeholder="Введите название товара"
                {...register("title", {
                  required: "Название обязательно",
                  minLength: { value: 3, message: "Минимум 3 символа" },
                  maxLength: { value: 200, message: "Максимум 200 символов" },
                })}
                className={errors.title ? scss.error : ""}
                disabled={isPending}
              />
              {errors.title && (
                <span className={scss.errorText}>{errors.title.message}</span>
              )}
            </div>

            {/* Описание */}
            <div className={scss.formGroup}>
              <label htmlFor="description">Описание *</label>
              <textarea
                id="description"
                rows={5}
                placeholder="Подробное описание товара..."
                {...register("description", {
                  required: "Описание обязательно",
                  minLength: { value: 20, message: "Минимум 20 символов" },
                  maxLength: { value: 2000, message: "Максимум 2000 символов" },
                })}
                className={errors.description ? scss.error : ""}
                disabled={isPending}
              />
              {errors.description && (
                <span className={scss.errorText}>
                  {errors.description.message}
                </span>
              )}
            </div>

            {/* Размеры */}
            <div className={scss.formGroup}>
              <label>Размеры *</label>
              <div className={scss.sizeSelector}>
                {availableSizes.map((size) => (
                  <label
                    key={size}
                    className={`${scss.checkboxLabel} ${
                      selectedSizes.includes(size) ? scss.selected : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => handleSizeToggle(size)}
                      disabled={isPending}
                    />
                    {size}
                  </label>
                ))}
              </div>
              <div className={scss.customColor}>
                <input
                  type="text"
                  placeholder="Добавить свой размер"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddCustomSize())
                  }
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  disabled={isPending || !customSize.trim()}
                  className={scss.addColorButton}
                >
                  Добавить
                </button>
              </div>
              {selectedSizes.length === 0 && (
                <span className={scss.errorText}>
                  Выберите хотя бы один размер
                </span>
              )}
              {selectedSizes.length > 0 && (
                <div className={scss.selectedColors}>
                  Выбрано размеров: {selectedSizes.join(", ")}
                </div>
              )}
            </div>

            {/* Цвета */}
            <div className={scss.formGroup}>
              <label>Цвета *</label>
              <div className={scss.colorSelector}>
                {predefinedColors.map((color) => (
                  <label
                    key={color.name}
                    className={`${scss.checkboxLabel} ${
                      selectedColors.includes(color.name) ? scss.selected : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color.name)}
                      onChange={() => handleColorToggle(color.value)}
                      disabled={isPending}
                    />
                    <span
                      className={scss.colorBox}
                      style={{ backgroundColor: color.value }}
                    ></span>
                    {color.name}
                  </label>
                ))}
              </div>
              <div className={scss.customColor}>
                <input
                  type="text"
                  placeholder="Добавить свой цвет"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddCustomColor())
                  }
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  disabled={isPending || !customColor.trim()}
                  className={scss.addColorButton}
                >
                  Добавить
                </button>
              </div>
              {selectedColors.length === 0 && (
                <span className={scss.errorText}>
                  Выберите хотя бы один цвет
                </span>
              )}
              {selectedColors.length > 0 && (
                <div className={scss.selectedColors}>
                  Выбрано цветов: {selectedColors.join(", ")}
                </div>
              )}
            </div>

            {/* Цены */}
            <div className={scss.formRow}>
              <div className={scss.formGroup}>
                <label htmlFor="price">Цена * (сом)</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("price", {
                    required: "Цена обязательна",
                    min: {
                      value: 0,
                      message: "Цена не может быть отрицательной",
                    },
                    valueAsNumber: true,
                  })}
                  className={errors.price ? scss.error : ""}
                  disabled={isPending}
                />
                {errors.price && (
                  <span className={scss.errorText}>{errors.price.message}</span>
                )}
              </div>

              <div className={scss.formGroup}>
                <label htmlFor="newPrice">Цена со скидкой (сом)</label>
                <input
                  id="newPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("newPrice", {
                    min: {
                      value: 0,
                      message: "Цена не может быть отрицательной",
                    },
                    valueAsNumber: true,
                  })}
                  className={errors.newPrice ? scss.error : ""}
                  disabled={isPending}
                />
                {errors.newPrice && (
                  <span className={scss.errorText}>
                    {errors.newPrice.message}
                  </span>
                )}
              </div>
            </div>

            {/* Остаток и наличие */}
            <div className={scss.formRow}>
              <div className={scss.formGroup}>
                <label htmlFor="stockCount">Количество на складе</label>
                <input
                  id="stockCount"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("stockCount", {
                    min: {
                      value: 0,
                      message: "Количество не может быть отрицательным",
                    },
                    valueAsNumber: true,
                  })}
                  className={errors.stockCount ? scss.error : ""}
                  disabled={isPending}
                />
                {errors.stockCount && (
                  <span className={scss.errorText}>
                    {errors.stockCount.message}
                  </span>
                )}
              </div>
            </div>

            {/* Теги */}
            <div className={scss.formGroup}>
              <label htmlFor="tags">Теги (через запятую)</label>
              <input
                id="tags"
                type="text"
                placeholder="новинка, акция, хит продаж"
                {...register("tags")}
                disabled={isPending}
              />
            </div>

            {/* Фото */}
            <div className={scss.formGroup}>
              <label htmlFor="files">Фото товара *</label>
              <input
                id="files"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesChange}
                disabled={isPending}
              />
              {previewImages.length > 0 && (
                <div className={scss.imagePreview}>
                  {previewImages.map((src, index) => (
                    <div key={index} className={scss.imageWrapper}>
                      <img src={src} alt={`preview-${index}`} />
                      <button
                        type="button"
                        className={scss.removeImageButton}
                        onClick={() => handleRemoveImage(index)}
                        disabled={isPending}
                        title="Удалить изображение"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Кнопки действий */}
            <div className={scss.formActions}>
              <button
                type="button"
                className={scss.resetButton}
                onClick={handleResetForm}
                disabled={isPending}
              >
                Очистить форму
              </button>

              <button
                type="submit"
                className={scss.submitButton}
                disabled={isPending}
              >
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
