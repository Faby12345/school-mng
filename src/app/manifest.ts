import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Școala Mea",
    short_name: "Școala Mea",
    description: "Teme, note și învățare într-un singur loc.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#3978f6",
    orientation: "portrait-primary",
    categories: ["education", "productivity"],
    lang: "ro",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

