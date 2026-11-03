"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

/**
 * A QR code preview.
 *
 * The code is drawn in the browser from a string — nothing is uploaded and no
 * third-party QR service is contacted. The colours are fixed to a dark
 * foreground on a light background because a QR reader needs the contrast;
 * a themed brand colour would make some of them unscannable.
 */
export function QrPreview({
  value,
  size = 160,
  title,
  className,
  empty = "Nothing to show yet",
}: {
  /** The text the code encodes. */
  value: string | null;
  /** Size of the square, in pixels. */
  size?: number;
  /** Accessible title for the SVG. */
  title: string;
  className?: string;
  /** Shown in place of the code when there is nothing to encode. */
  empty?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-line bg-surface p-3",
        className,
      )}
      style={{ width: size + 24, height: size + 24 }}
    >
      {value ? (
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          marginSize={0}
          fgColor="#0f172a"
          bgColor="#ffffff"
          title={title}
        />
      ) : (
        <span className="text-[12px] text-ink-faint">{empty}</span>
      )}
    </div>
  );
}
