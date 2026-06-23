"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Booking } from "./Booking";
import { Payment, type PayTarget } from "./Payment";

type Ctx = {
  openBook: () => void;
  openPay: (target: PayTarget) => void;
};

const SiteModalsCtx = createContext<Ctx>({ openBook: () => {}, openPay: () => {} });

export function useSiteModals() {
  return useContext(SiteModalsCtx);
}

export function SiteModalsProvider({
  isAuthed,
  children,
}: {
  isAuthed: boolean;
  children: ReactNode;
}) {
  const [book, setBook] = useState(false);
  const [pay, setPay] = useState<PayTarget | null>(null);

  return (
    <SiteModalsCtx.Provider value={{ openBook: () => setBook(true), openPay: (t) => setPay(t) }}>
      {children}
      {book && <Booking onClose={() => setBook(false)} />}
      {pay && <Payment target={pay} isAuthed={isAuthed} onClose={() => setPay(null)} />}
    </SiteModalsCtx.Provider>
  );
}
