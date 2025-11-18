"use client";

import { FC, useState, useEffect, useMemo } from "react";
import scss from "./CreateProduct.module.scss";
import { useForm } from "react-hook-form";
import { useCreateProduct } from "@/api/user";
import toast from "react-hot-toast";
import { useGetBrands, useGetCategories } from "@/api/product";
import { Upload, ArrowLeft, ArrowRight, Check, X, Package } from "lucide-react";

interface FormFields {
  parentCategoryId: number;
  categoryId: number;
  brandId: number;
  title: string;
  description: string;
  price: number;
  newPrice?: number;
  stockCount: number;
  tags: string;
}

const CreateProduct: FC = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 8;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
    reset,
  } = useForm<FormFields>({
    defaultValues: {
      parentCategoryId: 0,
      categoryId: 0,
      brandId: 0,
      price: 0,
      stockCount: 0,
    },
  });

  const { mutateAsync: createProduct, isPending } = useCreateProduct();
  const { data: categoriesData } = useGetCategories();
  const { data: brandsData } = useGetBrands();

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const parentCategoryId = watch("parentCategoryId");
  const categoryId = watch("categoryId");

  const parentCategories = useMemo(
    () => categoriesData?.categories.filter((c) => !c.parentId) || [],
    [categoriesData]
  );
  const subCategories = useMemo(
    () =>
      categoriesData?.categories.filter(
        (c) => c.parentId === parentCategoryId
      ) || [],
    [categoriesData, parentCategoryId]
  );

  const isShoeCategory = useMemo(() => {
    const cat = subCategories.find((c) => c.id === categoryId);
    return cat?.name.toLowerCase().includes("обувь");
  }, [subCategories, categoryId]);

  const availableSizes = isShoeCategory
    ? Array.from({ length: 16 }, (_, i) => (34 + i).toString())
    : ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

  const colors = [
    { name: "Белый", hex: "#FFFFFF" },
    { name: "Чёрный", hex: "#000000" },
    { name: "Серый", hex: "#6B7280" },
    { name: "Красный", hex: "#EF4444" },
    { name: "Оранжевый", hex: "#fb4517" },
    { name: "Синий", hex: "#3B82F6" },
    { name: "Зелёный", hex: "#10B981" },
    { name: "Жёлтый", hex: "#F59E0B" },
    { name: "Розовый", hex: "#EC4899" },
  ];

  useEffect(() => setValue("categoryId", 0), [parentCategoryId, setValue]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const valid = Array.from(files).filter((f) => f.size <= 5 * 1024 * 1024);
    if (valid.length < files.length) toast.error("Некоторые файлы > 5МБ");

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
          parentCategoryId > 0 || (toast.error("Выберите категорию"), false)
        );
      case 3:
        return categoryId > 0 || (toast.error("Выберите подкатегорию"), false);
      case 4:
        return (
          getValues("brandId") > 0 || (toast.error("Выберите бренд"), false)
        );
      case 5:
        return await trigger(["title", "description"]);
      case 6:
        return (
          (selectedSizes.length > 0 && selectedColors.length > 0) ||
          (toast.error("Выберите размеры и цвета"), false)
        );
      case 7:
        const ok = await trigger(["price", "stockCount"]);
        if (!ok) return false;
        if (getValues("newPrice")) {
          toast.error("Цена со скидкой должна быть ниже");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const next = async () => {
    if (await validateStep()) setStep((s) => Math.min(s + 1, totalSteps));
  };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: FormFields) => {
    if (!(await validateStep())) return;

    const formData = new FormData();
    formData.append("categoryId", String(data.categoryId));
    formData.append("brandId", String(data.brandId));
    formData.append("title", data.title.trim());
    formData.append("description", data.description.trim());
    formData.append("price", String(data.price));
    if (data.newPrice) formData.append("newPrice", String(data.newPrice));
    formData.append("stockCount", String(data.stockCount));
    formData.append("sizes", JSON.stringify(selectedSizes));
    formData.append("colors", JSON.stringify(selectedColors));
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
    selectedFiles.forEach((f) => formData.append("files", f));

    try {
      await createProduct(formData);
      toast.success("Товар создан!");
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || "Ошибка");
    }
  };

  const resetForm = () => {
    reset();
    previewImages.forEach(URL.revokeObjectURL);
    setPreviewImages([]);
    setSelectedFiles([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setStep(1);
  };

  const progress = (step / totalSteps) * 100;

  return (
    <section className={scss.createProduct}>
      <div className={scss.container}>
        {/* Header */}
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
                <p>Первое фото будет главным на карточке</p>

                <label className={scss.uploadArea}>
                  <Upload className={scss.uploadIcon} />
                  <span>Перетащите фото сюда или нажмите</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesChange}
                  />
                </label>

                {previewImages.length > 0 && (
                  <div className={scss.gallery}>
                    {previewImages.map((src, i) => (
                      <div key={i} className={scss.imageCard}>
                        {i === 0 && (
                          <span className={scss.mainBadge}>Главное</span>
                        )}
                        <img src={src} alt="" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className={scss.removeBtn}
                        >
                          <X />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Остальные шаги */}
            {step === 2 && (
              <div className={scss.categoryStep}>
                <h2>Выберите родительскую категорию</h2>
                <div className={scss.categoryGrid}>
                  {parentCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={parentCategoryId === cat.id ? scss.active : ""}
                      onClick={() => setValue("parentCategoryId", cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && parentCategoryId && (
              <div className={scss.categoryStep}>
                <h2>Выберите подкатегорию</h2>
                <div className={scss.categoryGrid}>
                  {subCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={categoryId === cat.id ? scss.active : ""}
                      onClick={() => setValue("categoryId", cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className={scss.selectStep}>
                <h2>Бренд</h2>
                <select
                  {...register("brandId", { valueAsNumber: true })}
                  className={scss.select}
                >
                  <option value={0}>— Выберите бренд —</option>
                  {brandsData?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {step === 5 && (
              <div className={scss.textStep}>
                <h2>Название и описание</h2>
                <input
                  {...register("title", { required: true, minLength: 3 })}
                  placeholder="Кроссовки Nike Air Max..."
                />
                <textarea
                  {...register("description", {
                    required: true,
                    minLength: 20,
                  })}
                  rows={6}
                  placeholder="Подробное описание..."
                />
              </div>
            )}

            {step === 6 && (
              <div className={scss.sizesColorsStep}>
                <h2>Размеры и цвета</h2>
                <div className={scss.section}>
                  <h3>Размеры</h3>
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
                  <h3>Цвета</h3>
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
                        <span style={{ backgroundColor: c.hex }} />
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 7 && (
              <div className={scss.priceStep}>
                <h2>Цена и количество</h2>
                <input
                  type="number"
                  {...register("price", {
                    valueAsNumber: true,
                    required: true,
                  })}
                  placeholder="Цена (сом)"
                />
                <input
                  type="number"
                  {...register("newPrice", { valueAsNumber: true })}
                  placeholder="Цена со скидкой (необязательно)"
                />
                <input
                  type="number"
                  {...register("stockCount", { valueAsNumber: true })}
                  placeholder="Количество на складе"
                />
              </div>
            )}

            {step === 8 && (
              <div className={scss.finalStep}>
                <Check className={scss.successIcon} />
                <h2>Готово к публикации!</h2>
                <p>Проверьте данные и нажмите «Создать товар»</p>
              </div>
            )}
          </div>

          {/* Навигация */}
          <div className={scss.actions}>
            {step > 1 && (
              <button type="button" onClick={back} className={scss.backBtn}>
                <ArrowLeft /> Назад
              </button>
            )}
            <div className={scss.rightActions}>
              {step === totalSteps ? (
                <button
                  type="submit"
                  disabled={isPending}
                  className={scss.submitBtn}
                >
                  {!isPending ? "Создаём..." : "Создать товар"}
                </button>
              ) : (
                <button type="button" onClick={next} className={scss.nextBtn}>
                  Далее <ArrowRight className={scss.arrows} />
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
