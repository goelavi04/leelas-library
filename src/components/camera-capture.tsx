"use client";

import { useEffect, useRef, useState } from "react";
import { XIcon } from "@/components/icons";

/** Live camera view with a shutter button — snaps a still frame instead of continuously decoding, unlike BarcodeScanner. */
export function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Couldn't access the camera. Check that you've allowed camera access for this site, then try again."
          );
        }
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function handleCapture() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL("image/jpeg", 0.9));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[rgba(0,0,0,0.92)] p-4">
      <div className="flex items-center justify-between text-white">
        <p className="text-[15px] font-semibold">Take a cover photo</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close camera"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="relative mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-black">
        <video ref={videoRef} muted playsInline className="max-h-full max-w-full" />
      </div>

      <div className="mt-4 flex flex-col items-center gap-3">
        {error ? (
          <p className="text-center text-[13.5px] text-white/80">{error}</p>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCapture}
              aria-label="Take photo"
              className="focus-ring flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/80 transition active:scale-95"
            >
              <span className="h-12 w-12 rounded-full bg-white" />
            </button>
            <p className="text-[13px] text-white/70">Line up the cover, then tap to capture.</p>
          </>
        )}
      </div>
    </div>
  );
}
