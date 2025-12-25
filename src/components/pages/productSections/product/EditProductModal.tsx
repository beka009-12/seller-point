"use client";

import { FC } from "react";
import scss from "./EditProductModal.module.scss";
import { useForm } from "react-hook-form";

interface EditProductModalProps {
  product: {
    id: number;
    title: string;
    description: string;
    price: number;
    newPrice?: number | null;
    stockCount: number;
    tags: string[];
  };
  isPending: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    newPrice?: number | null;
    stockCount: number;
    tags: string[];
  }) => void;
}

const EditProductModal: FC<EditProductModalProps> = ({
  product,
  isPending,
  onClose,
  onSave,
}) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: product,
  });

  const watchTags = watch("tags", []);

  const handleSave = (data: any) => {
    const newPriceValue =
      data.newPrice && data.newPrice !== "" && Number(data.newPrice) > 0
        ? Number(data.newPrice)
        : null;

    onSave({
      title: data.title.trim(),
      description: data.description.trim(),
      stockCount: Number(data.stockCount) || 0,
      newPrice: newPriceValue,
      tags: data.tags,
    });
  };

  return (
    <div className={scss.modalOverlay} onClick={onClose}>
      <div className={scss.modal} onClick={(e) => e.stopPropagation()}>
        <div className={scss.modalHeader}>
          <h2 className={scss.modalTitle}>Редактировать товар</h2>
        </div>

        <form onSubmit={handleSubmit(handleSave)} className={scss.modalBody}>
          <div className={scss.formGroup}>
            <label className={scss.label}>Название товара *</label>
            <input
              className={scss.input}
              {...register("title", { required: true })}
            />
          </div>

          <div className={scss.formGroup}>
            <label className={scss.label}>Описание</label>
            <textarea
              className={scss.textarea}
              rows={5}
              {...register("description")}
            />
          </div>

          <div className={scss.formGroup}>
            <label className={scss.label}>
              Цена со скидкой (необязательно)
            </label>
            <input
              type="text"
              className={scss.input}
              {...register("newPrice")}
              placeholder="Оставьте пустым, если нет скидки"
            />
          </div>

          <div className={scss.formGroup}>
            <label className={scss.label}>Количество на складе *</label>
            <input
              type="number"
              step="1"
              min="0"
              className={scss.input}
              {...register("stockCount", { required: true })}
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

          <div className={scss.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={`${scss.btn} ${scss.btnSecondary}`}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`${scss.btn} ${scss.btnPrimary}`}
            >
              {isPending ? "Сохраняется..." : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
