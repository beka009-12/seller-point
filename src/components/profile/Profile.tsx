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

interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  avatar: string | null;
  phone: string | null;
  role: string;
  stores: Store[];
  createdAt: string;
  updatedAt: string;
}

// Временные данные для примера

const Profile: FC = () => {
  const { data: user } = useGetMe();

  console.log(user);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className={scss.Profile}>
      {/* <div className="container">
        <div className={scss.content}>
          <div className={scss.header}>
            <h1 className={scss.title}>Профиль пользователя</h1>
          </div>

          <div className={scss.profileCard}>
            <div className={scss.userInfo}>
              <div className={scss.avatarSection}>
                <div className={scss.avatar}>
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={120}
                      height={120}
                      className={scss.avatarImg}
                    />
                  ) : (
                    <div className={scss.avatarPlaceholder}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={scss.userDetails}>
                  <h2 className={scss.userName}>{user.name}</h2>
                  <span className={scss.userRole}>
                    {user.role === "owner" ? "Владелец" : "Пользователь"}
                  </span>
                </div>
              </div>

              <div className={scss.infoGrid}>
                <div className={scss.infoItem}>
                  <Mail className={scss.infoIcon} />
                  <div className={scss.infoText}>
                    <span className={scss.infoLabel}>Email</span>
                    <span className={scss.infoValue}>{user.email}</span>
                  </div>
                </div>

                {user.phone && (
                  <div className={scss.infoItem}>
                    <Phone className={scss.infoIcon} />
                    <div className={scss.infoText}>
                      <span className={scss.infoLabel}>Телефон</span>
                      <span className={scss.infoValue}>{user.phone}</span>
                    </div>
                  </div>
                )}

                <div className={scss.infoItem}>
                  <Calendar className={scss.infoIcon} />
                  <div className={scss.infoText}>
                    <span className={scss.infoLabel}>Дата регистрации</span>
                    <span className={scss.infoValue}>
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {user.stores.length > 0 && (
            <div className={scss.storesSection}>
              <h3 className={scss.sectionTitle}>
                <Store className={scss.titleIcon} />
                Мои магазины ({user.stores.length})
              </h3>

              <div className={scss.storesGrid}>
                {user.stores.map((store) => (
                  <div key={store.id} className={scss.storeCard}>
                    <div className={scss.storeHeader}>
                      {store.logo ? (
                        <Image
                          src={store.logo}
                          alt={store.name}
                          width={60}
                          height={60}
                          className={scss.storeLogo}
                        />
                      ) : (
                        <div className={scss.storeLogoPlaceholder}>
                          {store.name.charAt(0)}
                        </div>
                      )}
                      <div className={scss.storeInfo}>
                        <h4 className={scss.storeName}>{store.name}</h4>
                        <p className={scss.storeDescription}>
                          {store.description}
                        </p>
                      </div>
                    </div>

                    <div className={scss.storeDetails}>
                      <div className={scss.storeDetailItem}>
                        <MapPin className={scss.detailIcon} />
                        <span>{store.address}</span>
                      </div>
                      <div className={scss.storeDetailItem}>
                        <MapPin className={scss.detailIcon} />
                        <span>{store.region}</span>
                      </div>
                      <div className={scss.storeDetailItem}>
                        <Calendar className={scss.detailIcon} />
                        <span>Создан: {formatDate(store.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div> */}
    </section>
  );
};

export default Profile;
