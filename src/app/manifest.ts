import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rezeptretter",
    short_name: "Rezeptretter",
    description: "Rezepte retten, organisieren und nachkochen",
    start_url: "/rezepte",
    display: "standalone",
    background_color: "#fdf9f3",
    theme_color: "#974400",
    orientation: "portrait-primary",
    categories: ["food", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    share_target: {
      action: "/importieren",
      method: "GET",
      params: {
        url: "url",
      },
    },
  };
}
