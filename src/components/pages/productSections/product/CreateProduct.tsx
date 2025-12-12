"use client";

import { FC, useState, useEffect, useMemo, Fragment } from "react";
import scss from "./CreateProduct.module.scss";
import { useForm } from "react-hook-form";
import { useCreateProduct } from "@/api/user";
import toast from "react-hot-toast";
import { useGetBrands, useGetCategories } from "@/api/product";
import {
  Upload,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Package,
  Palette,
  Ruler,
} from "lucide-react";

interface FormFields {
  categoryId: number;
  brandId: number;
  title: string;
  description: string;
  price: number;
  newPrice?: number;
  stockCount: number;
  tags: string;
}

// Иконки для категорий (можно расширять)

const CreateProduct: FC = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  const { register, handleSubmit, setValue, trigger, getValues, reset, watch } =
    useForm<FormFields>();

  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  const { data: categoriesData } = useGetCategories();
  const { data: brandByCategoryData } = useGetBrands();

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Хлебные крошки для категорий
  const [categoryPath, setCategoryPath] = useState<number[]>([]);

  const selectedCategoryId = categoryPath[categoryPath.length - 1] || 0;

  // Получаем текущие подкатегории
  const currentSubcategories = useMemo(() => {
    if (!categoriesData?.categories) return [];
    if (categoryPath.length === 0) {
      return categoriesData.categories.filter((c) => !c.parentId);
    }
    const parentId = categoryPath[categoryPath.length - 1];
    return categoriesData.categories.filter((c) => c.parentId === parentId);
  }, [categoriesData, categoryPath]);

  // Есть ли подкатегории дальше?
  const hasSubcategories = currentSubcategories.length > 0;

  // Определяем, обувь ли это (по названию финальной категории)
  const finalCategory = categoriesData?.categories.find(
    (c) => c.id === selectedCategoryId
  );
  const isShoeCategory = useMemo(() => {
    const checkIfShoe = (catId: number): boolean => {
      const cat = categoriesData?.categories.find((c) => c.id === catId);
      if (!cat) return false;

      if (cat.name.toLowerCase().includes("обувь")) return true;

      if (cat.parentId) return checkIfShoe(cat.parentId);

      return false;
    };

    return selectedCategoryId > 0 ? checkIfShoe(selectedCategoryId) : false;
  }, [categoriesData, selectedCategoryId]);

  let availableSizes = isShoeCategory
    ? Array.from({ length: 16 }, (_, i) => (34 + i).toString())
    : ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];
  const colors = [
    { name: "Белый", hex: "#FFFFFF" },
    { name: "Чёрный", hex: "#000000" },
    { name: "Серый", hex: "#6B7280" },
    { name: "Красный", hex: "#EF4444" },
    { name: "Синий", hex: "#3B82F6" },
    { name: "Зелёный", hex: "#10B981" },
    { name: "Жёлтый", hex: "#F59E0B" },
    { name: "Розовый", hex: "#EC4899" },
    { name: "Оранжевый", hex: "#FB923C" },
  ];

  const selectedBrandId = watch("brandId");
  useEffect(() => {
    if (selectedCategoryId > 0) {
      setValue("categoryId", selectedCategoryId);
    }
  }, [selectedCategoryId, setValue]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    if (previewImages.length + files.length > 6) {
      toast("Можно загрузить максимум 6 фото", {
        icon: "⚠️",
      });
      return;
    }

    const valid = Array.from(files).filter((f) => f.size <= 5 * 1024 * 1024);
    if (valid.length < files.length) toast.error("Некоторые файлы больше 5МБ");

    setSelectedFiles((p) => [...p, ...valid]);
    setPreviewImages((p) => [
      ...p,
      ...valid.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previewImages[i]);
    setPreviewImages((p) => p.filter((_, idx) => idx !== i));
    setSelectedFiles((p) => p.filter((_, idx) => idx !== i));
  };

  const validateStep = async () => {
    switch (step) {
      case 1:
        return (
          selectedFiles.length > 0 || (toast.error("Добавьте фото"), false)
        );
      case 2:
        return (
          selectedCategoryId > 0 || (toast.error("Выберите категорию"), false)
        );
      case 3:
        return (
          getValues("brandId") > 0 || (toast.error("Выберите бренд"), false)
        );
      case 4:
        return await trigger(["title", "description"]);
      case 5:
        return (
          (selectedSizes.length > 0 && selectedColors.length > 0) ||
          (toast.error("Выберите размеры и цвета"), false)
        );
      case 6:
        const ok = await trigger(["price", "stockCount"]);
        if (!ok) return false;
        if (getValues("newPrice")! >= getValues("price")) {
          toast.error("Цена со скидкой должна быть ниже обычной");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const next = async () => {
    if (await validateStep()) {
      if (step === 2 && !hasSubcategories && selectedCategoryId > 0) {
        setStep((s) => Math.min(s + 1, totalSteps));
      } else {
        setStep((s) => Math.min(s + 1, totalSteps));
      }
    }
  };

  const back = () => {
    if (step === 2 && categoryPath.length > 0) {
      setCategoryPath((prev) => prev.slice(0, -1));
    } else if (step === 2 && categoryPath.length === 0) {
      setStep((s) => Math.max(s - 1, 1));
    } else {
      setStep((s) => Math.max(s - 1, 1));
    }
  };

  useEffect(() => {
    if (selectedCategoryId > 0) {
      setValue("categoryId", selectedCategoryId);
    }
  }, []);

  const onSubmit = async (data: FormFields) => {
    if (!(await validateStep())) return;

    const formData = new FormData();
    formData.append("categoryId", String(data.categoryId));
    formData.append("brandId", String(data.brandId));
    formData.append("title", data.title.trim());
    formData.append("description", data.description.trim());
    formData.append("price", String(data.price));
    if (data.newPrice !== undefined)
      formData.append("newPrice", String(data.newPrice));
    formData.append("stockCount", String(data.stockCount));

    // sizes и colors как массив строк
    formData.append("sizes", JSON.stringify(selectedSizes));
    formData.append("colors", JSON.stringify(selectedColors));

    // tags как массив строк
    if (data.tags) {
      formData.append(
        "tags",
        JSON.stringify(
          data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        )
      );
    }

    selectedFiles.forEach((f) => formData.append("files", f));

    try {
      await createProduct(formData);
      toast.success("Товар успешно создан!");
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Ошибка при создании товара");
    }
  };

  const resetForm = () => {
    reset();
    previewImages.forEach(URL.revokeObjectURL);
    setPreviewImages([]);
    setSelectedFiles([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setCategoryPath([]);
    setStep(1);
  };

  const progress = (step / totalSteps) * 100;

  // Хлебные крошки
  const breadcrumbs = categoryPath
    .map((id, idx) => {
      const cat = categoriesData?.categories.find((c) => c.id === id);
      const pathSoFar = categoryPath.slice(0, idx + 1);
      return cat ? { ...cat, pathSoFar } : null;
    })
    .filter(Boolean);

  return (
    <section className={scss.createProduct}>
      <div className={scss.container}>
        <div className={scss.header}>
          <h1>Создать товар</h1>
          <div className={scss.progressWrapper}>
            <div className={scss.progressBar}>
              <div
                className={scss.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={scss.stepCounter}>
              Шаг {step} из {totalSteps}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={scss.form}>
          <div className={scss.stepContent}>
            {/* ШАГ 1 — Фото */}
            {step === 1 && (
              <div className={scss.uploadStep}>
                <Package className={scss.icon} />
                <h2>Загрузите фото товара</h2>
                <p className={scss.subtitle}>
                  Можно добавить до 6 фото. Первое — главное
                </p>

                {previewImages.length > 0 ? (
                  <div className={scss.gallery}>
                    {previewImages.map((src, i) => (
                      <div key={i} className={scss.imageCard}>
                        {i === 0 && (
                          <span className={scss.mainBadge}>Главное</span>
                        )}
                        <img src={src} alt={`Превью ${i + 1}`} />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className={scss.removeBtn}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                    {previewImages.length < 6 && (
                      <label className={scss.uploadAreaSmall}>
                        <Upload size={28} />
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFilesChange}
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <label className={scss.uploadArea}>
                    <Upload className={scss.uploadIcon} />
                    <span>Нажмите для выбора фотографий товара</span>
                    <span className={scss.uploadHint}>До 6 фото, максимум</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFilesChange}
                    />
                  </label>
                )}
              </div>
            )}

            {/* ШАГ 2 — Категории (многоуровневые) */}
            {step === 2 && (
              <div className={scss.categoryStep}>
                <div className={scss.breadcrumbs}>
                  <span
                    onClick={() => setCategoryPath([])}
                    className={scss.breadcrumbHome}
                  >
                    Все категории
                  </span>
                  {breadcrumbs.map((crumb: any) => (
                    <Fragment key={crumb.id}>
                      <span>/</span>
                      <span
                        onClick={() => setCategoryPath(crumb.pathSoFar)}
                        className={scss.breadcrumb}
                      >
                        {crumb.name}
                      </span>
                    </Fragment>
                  ))}
                </div>

                <h2>
                  {categoryPath.length === 0
                    ? "Выберите категорию"
                    : "Выберите подкатегорию"}
                </h2>

                <div className={scss.categoryGrid}>
                  {currentSubcategories.map((cat) => {
                    const subcats =
                      categoriesData?.categories.filter(
                        (c) => c.parentId === cat.id
                      ) || [];
                    const hasChildren = subcats.length > 0;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (hasChildren) {
                            setCategoryPath((prev) => [...prev, cat.id]);
                          } else {
                            setCategoryPath((prev) => [
                              ...prev.slice(0, -1),
                              cat.id,
                            ]);
                            next();
                          }
                        }}
                        className={scss.categoryCard}
                      >
                        <span className={scss.categoryName}>{cat.name}</span>
                        {hasChildren && (
                          <ArrowRight size={20} className={scss.arrowRight} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {categoryPath.length > 0 &&
                  !hasSubcategories &&
                  finalCategory && (
                    <div className={scss.selectedCategory}>
                      <Check size={24} />
                      <span>
                        Выбрано: <strong>{finalCategory.name}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={next}
                        className={scss.continueBtn}
                      >
                        Продолжить
                      </button>
                    </div>
                  )}
              </div>
            )}

            {/* ШАГ 3 — Бренд */}
            {step === 3 && (
              <div className={scss.brandStep}>
                <h2>Выберите бренд</h2>

                <div className={scss.brandScroll}>
                  {brandByCategoryData?.map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      className={`${scss.brandCard} ${
                        selectedBrandId === brand.id ? scss.active : ""
                      }`}
                      onClick={() => setValue("brandId", brand.id)}
                    >
                      <img src={brand.logoUrl} alt={brand.name} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className={scss.textStep}>
                <h2>Название и описание</h2>
                <label className={scss.label}>Введите название товара *</label>
                <input
                  type="text"
                  {...register("title", { required: true })}
                  placeholder="Название товара"
                />
                <label className={scss.label}>
                  Напишите подробное описание товара *
                </label>
                <textarea
                  rows={6}
                  {...register("description", {
                    required: true,
                  })}
                  placeholder="Описание товара"
                />
              </div>
            )}

            {step === 5 && (
              <div className={scss.sizesColorsStep}>
                <h2>Размеры и цвета</h2>
                <div className={scss.section}>
                  <h3>
                    <Ruler size={20} /> Размеры {isShoeCategory && "(EU)"}
                  </h3>
                  <div className={scss.chips}>
                    {availableSizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={selectedSizes.includes(s) ? scss.active : ""}
                        onClick={() =>
                          setSelectedSizes((p) =>
                            p.includes(s) ? p.filter((x) => x !== s) : [...p, s]
                          )
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={scss.section}>
                  <h3>
                    <Palette size={20} /> Цвета
                  </h3>
                  <div className={scss.colorChips}>
                    {colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        className={
                          selectedColors.includes(c.name) ? scss.active : ""
                        }
                        onClick={() =>
                          setSelectedColors((p) =>
                            p.includes(c.name)
                              ? p.filter((x) => x !== c.name)
                              : [...p, c.name]
                          )
                        }
                      >
                        <span style={{ background: `${c.hex}` }}></span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className={scss.priceStep}>
                <h2>Цена и наличие</h2>
                <div className={scss.inputGroup}>
                  <label className={scss.label}>Цена *</label>
                  <input
                    type="number"
                    {...register("price", {
                      required: true,
                      valueAsNumber: true,
                    })}
                    placeholder="Обычная цена (сом)"
                  />
                  <label className={scss.label}>
                    Цена со скидкой{" "}
                    <span className={scss.warning}>(необязательно)</span>
                  </label>
                  <input
                    type="number"
                    {...register("newPrice", { valueAsNumber: true })}
                    placeholder="Цена со скидкой "
                  />
                  <label className={scss.label}>Количество на складе *</label>
                  <input
                    type="number"
                    {...register("stockCount", {
                      required: true,
                      valueAsNumber: true,
                    })}
                    placeholder="Количество на складе"
                  />
                </div>
              </div>
            )}

            {step === 7 && (
              <div className={scss.finalStep}>
                <Check className={scss.successIcon} />
                <h2>Всё готово!</h2>
                <p>Проверьте данные и опубликуйте товар</p>
              </div>
            )}
          </div>

          <div className={scss.actions}>
            {step > 1 && (
              <button type="button" onClick={back} className={scss.backBtn}>
                <ArrowLeft className={scss.arrowL} /> Назад
              </button>
            )}
            <div className={scss.rightActions}>
              {step === totalSteps ? (
                <button
                  type="submit"
                  disabled={isPending}
                  className={scss.submitBtn}
                >
                  {isPending ? "Создаём..." : "Опубликовать товар"}
                </button>
              ) : (
                <button type="button" onClick={next} className={scss.nextBtn}>
                  {step === totalSteps - 1
                    ? "Проверить и опубликовать"
                    : "Далее"}{" "}
                  <ArrowRight className={scss.arrowR} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateProduct;
