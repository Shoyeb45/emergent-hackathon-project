"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { photosApi, weddingsApi, type Photo } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function WeddingPhotosPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const { user } = useAuth();
  const [isHost, setIsHost] = useState(false);
  const [activeTab, setActiveTab] = useState<"gallery" | "my-photos">("gallery");
  const [galleryPhotos, setGalleryPhotos] = useState<Photo[]>([]);
  const [myPhotos, setMyPhotos] = useState<Photo[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [myPhotosLoading, setMyPhotosLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadRequestSent, setUploadRequestSent] = useState(false);

  useEffect(() => {
    weddingsApi.get(weddingId).then((w) => {
      const hostId = (w.host as { id?: number })?.id;
      setIsHost(!!user && hostId === user.id);
    });
  }, [weddingId, user]);

  useEffect(() => {
    setGalleryLoading(true);
    photosApi
      .gallery(weddingId)
      .then((r) => setGalleryPhotos(r.photos))
      .catch(() => setGalleryPhotos([]))
      .finally(() => setGalleryLoading(false));
  }, [weddingId]);

  useEffect(() => {
    if (activeTab !== "my-photos") return;
    setMyPhotosLoading(true);
    photosApi
      .myPhotos(weddingId)
      .then((r) => setMyPhotos(r.photos))
      .catch(() => setMyPhotos([]))
      .finally(() => setMyPhotosLoading(false));
  }, [weddingId, activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const { uploadUrl, key } = await photosApi.presign(weddingId, {
        fileName: file.name,
        contentType: file.type,
      });
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      await photosApi.confirm(weddingId, { key });
      const updated = await photosApi.gallery(weddingId);
      setGalleryPhotos(updated.photos);
    } catch {
      // show toast in real app
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-6 border-b border-[#C6A75E]/20 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`text-sm font-medium ${
            activeTab === "gallery"
              ? "text-[#C6A75E] border-b-2 border-[#C6A75E]"
              : "text-[#2B2B2B]/70 hover:text-[#2B2B2B]"
          }`}
        >
          Wedding Gallery
        </button>
        {!isHost && (
          <button
            type="button"
            onClick={() => setActiveTab("my-photos")}
            className={`text-sm font-medium ${
              activeTab === "my-photos"
                ? "text-[#C6A75E] border-b-2 border-[#C6A75E]"
                : "text-[#2B2B2B]/70 hover:text-[#2B2B2B]"
            }`}
          >
            My Photos
          </button>
        )}
      </div>

      {activeTab === "gallery" && (
        <>
          {isHost && (
            <div className="mb-6">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold cursor-pointer hover:shadow-gold disabled:opacity-70">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading ? "Uploading…" : "Upload Photos"}
              </label>
            </div>
          )}

          {!isHost && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setUploadRequestSent(true)}
                className="px-5 py-2.5 rounded-full border border-[#C6A75E] text-[#C6A75E] font-medium hover:bg-[#C6A75E]/10"
              >
                Request to Upload
              </button>
              {uploadRequestSent && (
                <p className="mt-2 text-sm text-[#2B2B2B]/70">
                  Request sent. The host can enable upload permission for you.
                </p>
              )}
            </div>
          )}

          {galleryLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-2 border-[#C6A75E]/30 border-t-[#C6A75E] rounded-full animate-spin" />
            </div>
          ) : galleryPhotos.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#C6A75E]/20 p-12 text-center">
              <p className="text-[#2B2B2B]/70">No photos in the gallery yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryPhotos.map((photo, i) => (
                <motion.div
                  key={photo.id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="aspect-square rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#C6A75E]/20 hover:ring-2 hover:ring-[#C6A75E]/40 transition-all"
                >
                  <a
                    href={photo.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full relative group"
                  >
                    <img
                      src={photo.thumbnailUrl || photo.originalUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute inset-0 bg-[#2B2B2B]/0 group-hover:bg-[#2B2B2B]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[#C6A75E] text-2xl">◇</span>
                    </span>
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "my-photos" && !isHost && (
        <>
          {myPhotosLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-2 border-[#C6A75E]/30 border-t-[#C6A75E] rounded-full animate-spin" />
              <p className="text-[#2B2B2B]/70">Loading your photos…</p>
            </div>
          ) : myPhotos.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#C6A75E]/20 p-12 text-center">
              <p className="text-[#2B2B2B]/70 mb-4">
                Upload your photo to find your memories.
              </p>
              <p className="text-sm text-[#2B2B2B]/60">
                Add a face sample so our AI can match you in wedding photos.
              </p>
              <a
                href="/dashboard/profile"
                className="inline-block mt-4 px-5 py-2.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold"
              >
                Upload Your Photo
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {myPhotos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="aspect-square rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#C6A75E]/20"
                >
                  <a
                    href={photo.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    <img
                      src={photo.thumbnailUrl || photo.originalUrl}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
