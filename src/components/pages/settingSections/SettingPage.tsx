"use client";
import { type FC } from "react";
import scss from "./SettingPage.module.scss";
import { useGetBrands } from "@/api/product";

const SettingPage: FC = () => {
  const { data: brands } = useGetBrands();

  return (
    <section className={scss.SettingPage}>
      <div className="container">
        <div className={scss.content}></div>
      </div>
    </section>
  );
};

export default SettingPage;
