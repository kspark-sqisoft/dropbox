"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import DropboxImage from "./dropbox-image";
import { searchFiles } from "actions/storageActions";
import { Spinner } from "@material-tailwind/react";

export default function DropboxImageList({ searchInput }) {
  const searchImagesQuery = useQuery({
    queryKey: ["images", searchInput],
    queryFn: () => {
      console.log("Fetching images with search:", searchInput);
      return searchFiles(searchInput);
    },
    staleTime: 0, // 항상 fresh 상태
    gcTime: 1000 * 60 * 10, // 10분
    enabled: true,
    retry: 2,
  });

  // 초기 로드 시 강제 refetch
  useEffect(() => {
    console.log("Component mounted, refetching data");
    searchImagesQuery.refetch();
  }, []);

  // searchInput 변경 시 refetch
  useEffect(() => {
    console.log("Search input changed:", searchInput);
    searchImagesQuery.refetch();
  }, [searchInput]);

  return (
    <section className="grid md:grid-cols-3 lg:grid-cols-4 grid-cols-2 gap-4">
      {searchImagesQuery.isLoading && (
        <div className="col-span-full flex justify-center">
          <Spinner />
        </div>
      )}
      {searchImagesQuery.isError && (
        <div className="col-span-full text-red-500">
          에러:{" "}
          {searchImagesQuery.error instanceof Error
            ? searchImagesQuery.error.message
            : "이미지를 불러올 수 없습니다"}
        </div>
      )}
      {searchImagesQuery.data &&
        searchImagesQuery.data.length > 0 &&
        searchImagesQuery.data.map((image) => (
          <DropboxImage key={image.id} image={image} />
        ))}
      {searchImagesQuery.data && searchImagesQuery.data.length === 0 && (
        <div className="col-span-full text-center text-gray-500">
          이미지가 없습니다
        </div>
      )}
    </section>
  );
}
