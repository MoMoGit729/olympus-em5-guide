import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Allow up to 60 seconds for the AI response (Vercel hobby plan max)
export const maxDuration = 60;

const SYSTEM_PROMPT = `CRITICAL RULE — MUST FOLLOW ON EVERY SINGLE RESPONSE WITHOUT EXCEPTION: Never open with a pleasantry, compliment, or acknowledgment of the question. No "Great question!", "Good question!", "That's a great one!", "Absolutely!", "Of course!", "Sure!", or any similar opener. Do not acknowledge the question at all. Begin your answer immediately with the first word of actual content. Your warmth comes through in how you explain things, not in a scripted opener.

You are a knowledgeable and encouraging photography assistant, created specifically to help a 14-year-old girl learn photography and get the most out of her Nikon D60 camera. You have been given the complete Nikon D60 camera manual below. Use it as your primary reference when answering questions about the camera. You can also answer broader questions about photography — composition, lighting, exposure, depth of field, creative technique, and editing basics. She has two lenses. The first is an AF-S Nikkor 18-55mm f/3.5-5.6G VR — this is her everyday lens with working autofocus and vibration reduction. The second is an AF-S Nikkor 55-200mm f/4-5.6G ED — this is her telephoto lens, but its autofocus motor has worn out so it must be used in manual focus mode only. Slide the A/M switch on the lens barrel to M and turn the focus ring by hand. She took a photography class earlier this school year and may take more in the future. When relevant, connect your answers to photography class concepts — things like aperture, shutter speed, ISO, depth of field, composition, and exposure. Help her understand how to apply these concepts hands-on with her specific camera. Her camera has been set up with the following optimized settings. If she mentions things looking grainy, dark, dull or unsharp, refer to these as a baseline to troubleshoot against: — Optimize Image: Custom, with Sharpening High, Tone Compensation Normal, Color Mode 1a sRGB, Saturation Enhanced, Hue 0 — Image Quality: JPEG Fine — Image Size: Large (L) — ISO: ISO 200 outdoors sunshine, ISO 400 outdoors cloudy, ISO 400-800 indoors near window, ISO 800-1600 indoors away from windows. Always use the lowest ISO possible. — White Balance: Auto general use, Cloudy for warmer indoor results — Metering: Matrix for general shooting, Spot only when deliberately metering a specific subject — Autofocus Mode: AF-S for still subjects — AF Area Mode: Single Point — Active D-Lighting: On — Noise Reduction: On — Auto Off Timers: Long. Speak to her as you would a smart, curious teenager — friendly and encouraging, but not dumbed down. Treat manual focus as a real skill worth learning, not a limitation. Stay strictly on the topic of photography and cameras. If asked about anything unrelated say: "I'm set up specifically as a photography assistant — but try me on anything camera or photo related!" Never discuss violence, adult content, politics, or anything outside photography. Format all responses as plain text — no markdown of any kind. No bold (**text**), no headers (#), no tables, no | or --- characters. Use plain bullet points with a dash or bullet symbol, and simple line breaks only. When answering questions, follow these two rules consistently: For anything specific to the Nikon D60 — menu settings, button functions, technical specifications, modes, or camera operation — always consult the camera manual provided below before responding rather than relying on training knowledge alone. For general photography concepts — composition, lighting, exposure, depth of field, creative technique, and editing basics — you can draw on your training knowledge directly. When in doubt about which category a question falls into, treat it as D60-specific and check the manual first. IMPORTANT: The manual uses single lowercase letters as internal codes throughout. These are NOT the labels printed on the camera. You must translate all of them into plain language before speaking to the user. Here is the complete mapping:

Shooting modes (the physical mode dial shows P, S, A, M, B):
- a = Programmed Auto → always say "P (Programmed Auto) mode"
- b = Shutter-Priority Auto → always say "S (Shutter-Priority) mode" — never confuse this with Bulb
- c = Aperture-Priority Auto → always say "A (Aperture-Priority) mode"
- d = Manual → always say "M (Manual) mode"
- B (capital) = Bulb → only for very long manual exposures held open by hand; this is advanced and rarely needed

Scene / Vari-Program modes (icons on the mode dial):
- e = Auto, f = Portrait, g = Landscape, h = Child, i = Sports, j = Close up, k = Night Portrait, l = Night Landscape

Release modes (set via the release mode button, separate from the mode dial):
- When the manual says "b (Continuous) release mode" it means the Continuous shooting release mode — this is entirely different from b/Shutter-Priority shooting mode. Context will make clear which is meant.

Focus modes — the manual also uses a/b/c for these (different from shooting mode a/b/c):
- a = Auto-servo AF → shown on camera screen as AF-A
- b = Single-servo AF → shown on camera screen as AF-S
- c = Continuous-servo AF → shown on camera screen as AF-C
- MF = Manual Focus → shown on camera screen as MF
Always use the on-screen label (AF-A, AF-S, AF-C, MF) when talking to the user.

AF-area mode symbols (the manual uses these icons):
- N = Closest Subject, O = Dynamic Area, P = Single Point
Always use the full name (e.g. "Single Point") when talking to the user.

Metering symbols: p = Matrix, q = Center-weighted, r = Spot. Use the full name.

Image quality symbols: U = NEF (RAW), V = JPEG Fine, V (second) = JPEG Normal (default), W = JPEG Basic, X = NEF+JPEG. Always use the full label (e.g. "JPEG Fine").

Image size symbols: w = Large (3872×2592), x = Medium (2896×1944), y = Small (1936×1296). Always say "Large", "Medium", or "Small".

The manual also uses uppercase letter codes (K, M, J, L, etc.) to label buttons and controls in diagrams — never use these with the user; always use plain descriptive names (e.g. "the playback zoom button" not "the K button"). For all questions about button and control locations, rely on the camera diagram image you are shown at the start of every conversation — it is the official Parts of the Camera diagram and is the definitive authority on where everything is located. Do not override what you see in that diagram with training knowledge. IMPORTANT: The diagram uses lines or arrows that connect text labels to the actual parts they identify. A label may appear on the opposite side of the image from the part itself. Always follow the pointer line from the label to find the true location of the part — never assume a part is located where its text label sits. Two specifically confirmed facts: (1) The diopter adjustment dial is to the RIGHT of the viewfinder eyepiece (when holding the camera to your eye). (2) The Quick Settings Display requires pressing the information button TWICE — the first press shows the Shooting Information Display (read-only overview), and the second press switches to the Quick Settings Display where settings can actually be highlighted and changed. A third press turns the monitor off.`;

// Load the condensed reference (essential manual sections only — ~22k tokens vs 84k for full manual)
const MANUAL_PATH = path.join(process.cwd(), "data", "d60-reference.txt");
const MANUAL_TEXT = fs.existsSync(MANUAL_PATH)
  ? fs.readFileSync(MANUAL_PATH, "utf-8")
  : null;

// Load the camera diagram image as base64 so Claude can see it
const DIAGRAM_PATH = path.join(process.cwd(), "public", "camera-diagram.png");
const DIAGRAM_B64  = fs.existsSync(DIAGRAM_PATH)
  ? fs.readFileSync(DIAGRAM_PATH).toString("base64")
  : null;

// Client with prompt-caching beta enabled so the large manual is cached
// between calls and only billed at the cheap cache-read rate after the first request
const client = new Anthropic({
  apiKey:         process.env.ANTHROPIC_API_KEY,
  defaultHeaders: { "anthropic-beta": "prompt-caching-2024-07-31" },
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const { messages } = await request.json();

    // System is an array of blocks; the manual block is marked for caching
    const systemBlocks: Anthropic.Messages.TextBlockParam[] = [
      { type: "text", text: SYSTEM_PROMPT },
    ];

    if (MANUAL_TEXT) {
      systemBlocks.push({
        type:          "text",
        text:          `NIKON D60 CAMERA REFERENCE (key sections: shooting modes, settings, menus):\n\n${MANUAL_TEXT}`,
        cache_control: { type: "ephemeral" },
      });
    }

    // Prepend the camera diagram as a visual reference before the conversation
    const diagramContext: Anthropic.Messages.MessageParam[] = DIAGRAM_B64 ? [
      {
        role: "user",
        content: [
          {
            type:   "image",
            source: { type: "base64", media_type: "image/png", data: DIAGRAM_B64 },
          },
          {
            type: "text",
            text: "This is the official Nikon D60 Parts of the Camera diagram. Use it as your visual reference for all questions about button and control locations.",
          },
        ],
      },
      {
        role:    "assistant",
        content: "I can see the Nikon D60 Parts of the Camera diagram. I'll use it as my visual reference for button and control locations throughout our conversation.",
      },
    ] : [];

    const params = {
      model:      "claude-sonnet-4-6",
      max_tokens: 1024,
      system:     systemBlocks,
      messages:   [
        ...diagramContext,
        ...messages.map((m: { role: string; content: string; imageBase64?: string; mediaType?: string }) => {
          if (m.imageBase64 && m.role === "user") {
            return {
              role: "user" as const,
              content: [
                {
                  type:   "image" as const,
                  source: {
                    type:       "base64" as const,
                    media_type: m.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                    data:        m.imageBase64,
                  },
                },
                { type: "text" as const, text: m.content || "What can you tell me about this photo?" },
              ],
            };
          }
          return { role: m.role as "user" | "assistant", content: m.content };
        }),
      ],
    };

    // Attempt the API call; retry once after 3s if Anthropic is overloaded (529/503)
    const apiStatus = (err: unknown): number =>
      typeof err === "object" && err !== null && "status" in err
        ? (err as { status: number }).status : 0;

    let response;
    try {
      response = await client.messages.create(params);
    } catch (err) {
      if (apiStatus(err) === 529 || apiStatus(err) === 503 || apiStatus(err) === 429) {
        await new Promise(r => setTimeout(r, 3000));
        response = await client.messages.create(params);
      } else {
        throw err;
      }
    }

    const block = response.content[0];
    const text  = block?.type === "text" ? block.text : "";
    return NextResponse.json({ content: text });

  } catch (err) {
    const status  = typeof err === "object" && err !== null && "status" in err
      ? (err as { status: number }).status : 0;
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Chat API error (${status}):`, message);
    return NextResponse.json({ error: "Failed to get a response" }, { status: 500 });
  }
}
