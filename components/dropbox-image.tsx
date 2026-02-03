"use client";

import { IconButton, Spinner } from "@material-tailwind/react";
import { useMutation } from "@tanstack/react-query";
import { deleteFile } from "actions/storageActions";
import { queryClient } from "config/ReactQueryClientProvider";
import { getImageUrl } from "utils/supabase/storage";

export default function DropboxImage({ image }) {
  const deleteFileMutation = useMutation({
    mutationFn: async (fileName: string) => {
      console.log("Calling server action deleteFile");
      const result = await deleteFile(fileName);
      return result;
    },
    onSuccess: () => {
      console.log("Delete successful");
      queryClient.invalidateQueries({
        queryKey: ["images"],
      });
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      alert(`삭제 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    },
  });

  return (
    <div className="relative w-full flex flex-col gap-2 p-4 border border-gray-100 rounded-2xl shadow-md">
      {/* Image */}
      <div>
        <img
          src={getImageUrl(image.name)}
          className="w-full aspect-square rounded-2xl"
        />
      </div>

      {/* FileName */}
      <div className="">{image.name}</div>

      <div className="absolute top-4 right-4">
        <IconButton
          onClick={() => {
            deleteFileMutation.mutate(image.name);
          }}
          color="red"
        >
          {deleteFileMutation.isPending ? (
            <Spinner />
          ) : (
            <i className="fas fa-trash" />
          )}
        </IconButton>
      </div>
    </div>
  );
}
