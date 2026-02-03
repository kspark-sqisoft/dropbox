"use client";

import { Button, Spinner } from "@material-tailwind/react";
import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "actions/storageActions";
import { queryClient } from "config/ReactQueryClientProvider";
import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";

export default function FileDragDropZone() {
  const fileRef = useRef(null);
  const uploadImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log("Calling server action uploadFile");
      const result = await uploadFile(formData);
      return result;
    },
    onSuccess: () => {
      console.log("Upload successful");
      queryClient.invalidateQueries({
        queryKey: ["images"],
      });
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      alert(`업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const formData = new FormData();

        acceptedFiles.forEach((file) => {
          formData.append(file.name, file);
        });

        console.log("Starting upload with files:", acceptedFiles.length);
        uploadImageMutation.mutate(formData);
      }
    },
    [uploadImageMutation],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className="w-full py-20 border-4 border-dotted border-indigo-700 flex flex-col items-center justify-center cursor-pointer"
    >
      <input {...getInputProps()} />
      {uploadImageMutation.isPending ? (
        <Spinner />
      ) : isDragActive ? (
        <p>파일을 놓아주세요.</p>
      ) : (
        <p>파일을 여기에 끌어다 놓거나 클릭하여 업로드하세요.</p>
      )}
    </div>
  );
}
