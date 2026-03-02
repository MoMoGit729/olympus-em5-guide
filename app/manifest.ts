import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "Nikon D60 Guide",
    short_name:       "D60 Guide",
    description:      "Interactive Nikon D60 camera reference and photography assistant",
    start_url:        "/",
    display:          "browser",
    background_color: "#0e2420",
    theme_color:      "#0e2420",
    icons: [
      {
        src:     "/icon",
        sizes:   "512x512",
        type:    "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
