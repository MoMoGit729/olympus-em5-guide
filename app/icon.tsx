import { ImageResponse } from "next/og";

export const size        = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: 512, height: 512,
        backgroundColor: "#0e2420",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Mint circle */}
        <div style={{
          width: 392, height: 392,
          backgroundColor: "#6ee7b7",
          borderRadius: "50%",
          position: "relative",
          display: "flex",
        }}>
          {/* Camera top hump */}
          <div style={{
            position: "absolute",
            width: 100, height: 46,
            backgroundColor: "#0e2420",
            borderRadius: 13,
            top: 100, left: 146,
          }}/>
          {/* Camera body */}
          <div style={{
            position: "absolute",
            width: 232, height: 142,
            backgroundColor: "#0e2420",
            borderRadius: 18,
            top: 135, left: 80,
          }}/>
          {/* Lens ring (mint shows through) */}
          <div style={{
            position: "absolute",
            width: 100, height: 100,
            backgroundColor: "#6ee7b7",
            borderRadius: "50%",
            top: 156, left: 146,
          }}/>
          {/* Lens inner */}
          <div style={{
            position: "absolute",
            width: 66, height: 66,
            backgroundColor: "#0e2420",
            borderRadius: "50%",
            top: 173, left: 163,
          }}/>
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
