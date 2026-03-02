import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "Nikon D60 Guide",
    short_name:       "D60 Guide",
    description:      "Interactive Nikon D60 camera reference and photography assistant",
    start_url:        "/",
    display:          "standalone",
    background_color: "#0e2420",
    theme_color:      "#0e2420",
    icons: [
      {
        src:     "/icon.svg",
        sizes:   "any",
        type:    "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
