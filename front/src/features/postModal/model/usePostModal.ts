import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const usePostModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activePostId = searchParams.get("postId");

  const open = useCallback(
    (postId: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("postId", postId);
        return next;
      });
    },
    [setSearchParams],
  );

  const close = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("postId");
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return { activePostId, open, close };
};
