"use client";
import { type FC } from "react";
import scss from "./Profile.module.scss";

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
  return (
    <section className={scss.Profile}>
      <div className="container">
        <div className={scss.content}></div>
      </div>
    </section>
  );
};

export default Profile;
