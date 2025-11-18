"use client";
import { Provider } from "@/provider/Provider";
import { ReactNode, FC, Suspense } from "react";
import { Toaster } from "react-hot-toast";

interface ILay {
  children: ReactNode;
}

const LayoutClient: FC<ILay> = ({ children }) => {
  return (
    <Provider>
      {children}
      <Toaster position="top-center" reverseOrder={false} />
    </Provider>
  );
};

export default LayoutClient;
