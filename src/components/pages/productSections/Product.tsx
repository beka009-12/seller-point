"use client";
import { type FC } from "react";
import scss from "./Product.module.scss";
import { useGetProduct } from "@/api/product";

const Product: FC = () => {
  const { data: products, isPending } = useGetProduct();
  console.log("🚀 ~ Product ~ products:", products);

  return (
    <section className={scss.Product}>
      <div className="container">
        <div className={scss.wrapper}>
          <h1>Товары</h1>
          {isPending && <p>Загрузка...</p>}
          {products?.map((item, index) => (
            <div key={item.id} className={scss.card}>
              <img
                key={index}
                src={item.images[0]}
                alt={`${item.title} ${index + 1}`}
              />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span>${item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Product;
