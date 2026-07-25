"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType, NotFoundException } from "@zxing/library";
import { XIcon } from "@/components/icons";

export function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (isbn: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
    ]);
    const reader = new BrowserMultiFormatReader(hints);
    let stopped = false;
    let controls: { stop: () => void } | undefined;

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current ?? undefined,
        (result, err) => {
          if (stopped) return;
          if (result) {
            controls?.stop();
            onDetected(result.getText());
          } else if (err && !(err instanceof NotFoundException)) {
            // NotFoundException fires continuously between frames while
            // nothing is in view yet — not a real error, ignore it.
            setError("Something went wrong reading the camera feed. You can enter the ISBN manually instead.");
          }
        }
      )
      .then((c) => {
        if (stopped) c.stop();
        else controls = c;
      })
      .catch(() => {
        if (!stopped) {
          setError(
            "Couldn't access the camera. Check that you've allowed camera access for this site, then try again — or enter the ISBN manually."
          );
        }
      });

    return () => {
      stopped = true;
      controls?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4">
      <div className="flex items-center justify-between text-white">
        <p className="text-[15px] font-semibold">Scan a book&rsquo;s barcode</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close scanner"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="relative mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-black">
        <video ref={videoRef} className="max-h-full max-w-full" muted playsInline />
        {!error && (
          <div className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-lg border-2 border-white/70" />
        )}
      </div>

      <p className="mt-4 text-center text-[13.5px] text-white/80">
        {error ?? "Hold the barcode on the back of the book steady inside the frame."}
      </p>
    </div>
  );
}
