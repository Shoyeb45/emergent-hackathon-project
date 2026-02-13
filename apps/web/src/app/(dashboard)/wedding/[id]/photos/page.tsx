"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { photosApi, weddingsApi, guestsApi, type Photo } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function WeddingPhotosPage() {
  const params = useParams();
  const weddingId = params.id as string;
  const { user } = useAuth();
  const [isHost, setIsHost] = useState(false);
  const [canUpload, setCanUpload] = useState(false);
  const [uploadRequestSent, setUploadRequestSent] = useState(false);
  const [myGuestLoading, setMyGuestLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"gallery" | "my-photos">("gallery");
  const [galleryPhotos, setGalleryPhotos] = useState<Photo[]>([]);
  const [myPhotos, setMyPhotos] = useState<Photo[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [myPhotosLoading, setMyPhotosLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadRequestLoading, setUploadRequestLoading] = useState(false);
  const [faceSampleUploading, setFaceSampleUploading] = useState(false);
  const [faceSampleError, setFaceSampleError] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    weddingsApi.get(weddingId).then((w) => {
      const hostId = (w.host as { id?: number })?.id;
      const host = !!user && hostId === user.id;
      setIsHost(host);
      if (host) {
        setCanUpload(true);
        setMyGuestLoading(false);
      }
    });
  }, [weddingId, user]);

  const fetchMyGuest = () => {
    if (isHost || !user) return;
    guestsApi
      .me(weddingId)
      .then((guest) => {
        setCanUpload(guest.uploadPermission === true);
        setUploadRequestSent(!!guest.uploadRequestedAt);
      })
      .catch(() => {
        setCanUpload(false);
      })
      .finally(() => setMyGuestLoading(false));
  };

  useEffect(() => {
    if (isHost || !user) {
      if (!isHost) setMyGuestLoading(false);
      return;
    }
    setMyGuestLoading(true);
    fetchMyGuest();
  }, [weddingId, user, isHost]);

  useEffect(() => {
    if (isHost || !weddingId) return;
    const onVisible = () => {
      guestsApi.me(weddingId).then((guest) => {
        setCanUpload(guest.uploadPermission === true);
        setUploadRequestSent(!!guest.uploadRequestedAt);
      }).catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [weddingId, isHost]);

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

  const handleFaceSampleFromFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setFaceSampleError(null);
      setFaceSampleUploading(true);
      try {
        const { uploadUrl, publicUrl } = await photosApi.faceSamplePresign({
          fileName: file.name,
          contentType: file.type,
        });
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        await photosApi.faceSample({ imageUrl: publicUrl });
        const updated = await photosApi.myPhotos(weddingId);
        setMyPhotos(updated.photos);
      } catch (err) {
        setFaceSampleError(
          err instanceof Error ? err.message : "Upload failed. Please try again."
        );
      } finally {
        setFaceSampleUploading(false);
      }
    },
    [weddingId]
  );

  const handleFaceSampleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFaceSampleFromFile(file);
    e.target.value = "";
  };

  const openCamera = () => {
    setCameraError(null);
    setShowCameraModal(true);
  };

  const closeCamera = () => {
    setShowCameraModal(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraError(null);
  };

  useEffect(() => {
    if (!showCameraModal || !videoRef.current) return;
    let stream: MediaStream | null = null;
    const video = videoRef.current;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();
        setCameraError(null);
      } catch (err) {
        setCameraError(
          err instanceof Error ? err.message : "Could not access camera. Use Upload from device instead."
        );
      }
    };
    start();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      video.srcObject = null;
    };
  }, [showCameraModal]);

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video || !video.srcObject || video.readyState !== 4) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "face-capture.jpg", { type: "image/jpeg" });
        closeCamera();
        handleFaceSampleFromFile(file);
      },
      "image/jpeg",
      0.92
    );
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
      </div>

      {activeTab === "gallery" && (
        <>
          {!myGuestLoading && canUpload && (
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

          {!myGuestLoading && !canUpload && (
            <div className="mb-6">
              <button
                type="button"
                onClick={async () => {
                  setUploadRequestLoading(true);
                  try {
                    await guestsApi.requestUpload(weddingId);
                    setUploadRequestSent(true);
                  } catch {
                    // show toast in real app
                  } finally {
                    setUploadRequestLoading(false);
                  }
                }}
                disabled={uploadRequestSent || uploadRequestLoading}
                className="px-5 py-2.5 rounded-full border border-[#C6A75E] text-[#C6A75E] font-medium hover:bg-[#C6A75E]/10 disabled:opacity-70"
              >
                {uploadRequestLoading ? "Sending…" : uploadRequestSent ? "Request sent" : "Request to Upload"}
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

      {activeTab === "my-photos" && (
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
              <p className="text-sm text-[#2B2B2B]/60 mb-4">
                Add a clear photo of your face so our AI can match you in
                wedding photos.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={openCamera}
                  disabled={faceSampleUploading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold hover:shadow-gold disabled:opacity-70 min-w-[180px]"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
                  </svg>
                  {faceSampleUploading ? "Uploading…" : "Take photo"}
                </button>
                <span className="text-[#2B2B2B]/40 text-sm hidden sm:inline">or</span>
                <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border-2 border-[#C6A75E] text-[#C6A75E] font-semibold cursor-pointer hover:bg-[#C6A75E]/10 disabled:opacity-70 min-w-[180px]">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFaceSampleUpload}
                    disabled={faceSampleUploading}
                  />
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {faceSampleUploading ? "Uploading…" : "Upload from device"}
                </label>
              </div>
              {faceSampleError && (
                <p className="mt-3 text-sm text-red-600">{faceSampleError}</p>
              )}
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

      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2B2B]/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-white border border-[#C6A75E]/30 p-6 max-w-lg w-full overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-[#2B2B2B]">
                Take a photo
              </h3>
              <button
                type="button"
                onClick={closeCamera}
                className="p-2 rounded-full text-[#2B2B2B]/60 hover:bg-[#FAF7F2] hover:text-[#2B2B2B]"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="rounded-xl bg-[#2B2B2B] overflow-hidden flex items-center justify-center min-h-[280px]" style={{ aspectRatio: "4/3" }}>
              {cameraError ? (
                <p className="text-white/90 text-sm px-4 text-center">{cameraError}</p>
              ) : (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                  style={{ transform: "scaleX(-1)" }}
                />
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={closeCamera}
                className="flex-1 py-2.5 rounded-full border border-[#C6A75E] text-[#C6A75E] font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureFromCamera}
                disabled={!!cameraError}
                className="flex-1 py-2.5 rounded-full bg-[#C6A75E] text-[#2B2B2B] font-semibold disabled:opacity-50"
              >
                Capture
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
