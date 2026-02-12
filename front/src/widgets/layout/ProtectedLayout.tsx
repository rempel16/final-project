import { useEffect, useRef } from "react";
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

  const lastNonModalOutletRef = useRef<React.ReactNode>(null);

  useEffect(() => {
    if (!isCreateModal) lastNonModalOutletRef.current = outlet;
  }, [isCreateModal, outlet]);

  return (
    <AuthGuard>
      <AppLayout>
        {isCreateModal && lastNonModalOutletRef.current ? (
          <>
            {lastNonModalOutletRef.current}
            {outlet}
          </>
        ) : (
          outlet
        )}
      </AppLayout>
    </AuthGuard>
  );
};
