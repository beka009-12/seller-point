"use client";
import { type FC } from "react";
import scss from "./Profile.module.scss";

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
