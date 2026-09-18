import { ImageResponse } from "next/og";
import { getTenantBySlug } from "@/lib/content";

export const runtime = "nodejs";

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getTenantBySlug(slug);
  const name = tenant?.profile?.name ?? tenant?.name ?? "Professional Portfolio";
  const title = tenant?.profile?.title ?? tenant?.title ?? "Independent Professional";
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", background: "#edeee8", color: "#14181f" }}><div style={{ fontSize: 28, color: "#454c56" }}>Professional portfolio</div><div style={{ marginTop: 24, fontSize: 72, fontWeight: 600 }}>{name}</div><div style={{ marginTop: 20, fontSize: 36, color: "#454c56" }}>{title}</div></div>, { width: 1200, height: 630 });
}