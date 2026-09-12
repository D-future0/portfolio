"use client";

import { InlineWidget } from "react-calendly";

export function CalendlyEmbed({ url }: { url: string }) {
  return (
    <div className="border border-line">
      <InlineWidget
        url={url}
        styles={{ height: "650px", width: "100%" }}
      />
    </div>
  );
}
