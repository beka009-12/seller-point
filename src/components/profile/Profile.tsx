"use client";
import { type FC } from "react";
import scss from "./Profile.module.scss";
import Image from "next/image";
import { Mail, Phone, Calendar, Store, MapPin } from "lucide-react";
import { useGetMe } from "@/api/user";

interface Store {
  id: number;
  name: string;
  description: string;
  address: string;
  region: string;
  logo: string;
  createdAt: string;
  ownerId: number;
}

const Profile: FC = () => {
  const { data } = useGetMe();
  const user = data?.user;

  console.log(user);

  if (!user) return <div>Загрузка профиля...</div>;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <section className={scss.Profile}>
      <div className="container">
        <div className={scss.content}></div>
      </div>
    </section>
  );
};

export default Profile;
