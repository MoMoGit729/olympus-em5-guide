import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "Olympus E-M5 III Guide",
    short_name:       "EM5 Guide",
    description:      "Interactive Olympus E-M5 Mark III camera reference and photography assistant",
    start_url:        "/",
    display:          "browser",
    background_color: "#f0ece4",
    theme_color:      "#2d6464",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
