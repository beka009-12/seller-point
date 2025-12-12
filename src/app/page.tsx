"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let token = localStorage.getItem("token");

    if (token) {
      router.replace("/saller-page");
    } else {
      router.replace("/register");
    }
  }, [router]);
}
