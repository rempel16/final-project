import { useEffect, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import type { Location as RouterLocation } from "react-router-dom";

import { AuthGuard } from "@/app/guards/AuthGuard";
import { AppLayout } from "./AppLayout";

type ModalState = { backgroundLocation?: RouterLocation };

export const ProtectedLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();

  const state = location.state as ModalState | null;

  const isCreateModal =
    location.pathname === "/create" && Boolean(state?.backgroundLocation);

  const [backgroundOutlet, setBackgroundOutlet] =
    useState<React.ReactNode>(outlet);

  useEffect(() => {
    if (isCreateModal) return;
    const raf = window.requestAnimationFrame(() => setBackgroundOutlet(outlet));
    return () => window.cancelAnimationFrame(raf);
  }, [isCreateModal, outlet]);

  return (
    <AuthGuard>
      <AppLayout>
        {isCreateModal ? (
          <>
            {backgroundOutlet}
            {outlet}
          </>
        ) : (
          outlet
        )}
      </AppLayout>
    </AuthGuard>
  );
};
