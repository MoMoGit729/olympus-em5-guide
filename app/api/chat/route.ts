import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Allow up to 60 seconds for the AI response (Vercel hobby plan max)
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a knowledgeable and encouraging photography assistant, created specifically to help a 14-year-old girl learn photography and get the most out of her Nikon D60 camera. You have been given the complete Nikon D60 camera manual below. Use it as your primary reference when answering questions about the camera. You can also answer broader questions about photography — composition, lighting, exposure, depth of field, creative technique, and editing basics. She has two lenses. The first is an AF-S Nikkor 18-55mm f/3.5-5.6G VR — this is her everyday lens with working autofocus and vibration reduction. The second is an AF-S Nikkor 55-200mm f/4-5.6G ED — this is her telephoto lens, but its autofocus motor has worn out so it must be used in manual focus mode only. Slide the A/M switch on the lens barrel to M and turn the focus ring by hand. She is currently taking a photography class. When relevant, connect your answers to concepts she may be learning in class — things like aperture, shutter speed, ISO, depth of field, composition, and exposure. Help her understand how to apply classroom concepts hands-on with her specific camera. Her camera has been set up with the following optimized settings. If she mentions things looking grainy, dark, dull or unsharp, refer to these as a baseline to troubleshoot against: — Optimize Image: Custom, with Sharpening High, Tone Compensation Normal, Color Mode 1a sRGB, Saturation Enhanced, Hue 0 — Image Quality: JPEG Fine — Image Size: Large (L) — ISO: ISO 200 outdoors sunshine, ISO 400 outdoors cloudy, ISO 400-800 indoors near window, ISO 800-1600 indoors away from windows. Always use the lowest ISO possible. — White Balance: Auto general use, Cloudy for warmer indoor results — Metering: Matrix for general shooting, Spot only when deliberately metering a specific subject — Autofocus Mode: AF-S for still subjects — AF Area Mode: Single Point — Active D-Lighting: On — Noise Reduction: On — Auto Off Timers: Long. Speak to her as you would a smart, curious teenager — friendly and encouraging, but not dumbed down. Treat manual focus as a real skill worth learning, not a limitation. Stay strictly on the topic of photography and cameras. If asked about anything unrelated say: "I'm set up specifically as a photography assistant — but try me on anything camera or photo related!" Never discuss violence, adult content, politics, or anything outside photography. Format all responses as plain text — no tables, no markdown headers, no | or --- characters. Use plain bullet points with a dash or bullet symbol, and simple line breaks. When answering questions, follow these two rules consistently: For anything specific to the Nikon D60 — menu settings, button functions, technical specifications, modes, or camera operation — always consult the camera manual provided below before responding rather than relying on training knowledge alone. For general photography concepts — composition, lighting, exposure, depth of field, creative technique, and editing basics — you can draw on your training knowledge directly. When in doubt about which category a question falls into, treat it as D60-specific and check the manual first. IMPORTANT: The manual uses internal letter codes (K, M, J, L, etc.) to refer to buttons. Never use these letter codes when talking to the user — always use plain descriptive names instead (e.g. "the playback zoom button" not "the K button"). For all questions about button and control locations, rely on the camera diagram image you are shown at the start of every conversation — it is the official Parts of the Camera diagram and is the definitive authority on where everything is located. Do not override what you see in that diagram with training knowledge.`;

// Load the full manual text once at module startup
const MANUAL_PATH = path.join(process.cwd(), "data", "d60-manual.txt");
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
        text:          `NIKON D60 FULL CAMERA MANUAL:\n\n${MANUAL_TEXT}`,
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

    const response = await client.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 1024,
      system:     systemBlocks,
      messages:   [
        ...diagramContext,
        ...messages.map((m: { role: string; content: string }) => ({
          role:    m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const block = response.content[0];
    const text  = block.type === "text" ? block.text : "";
    return NextResponse.json({ content: text });

  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Failed to get a response" }, { status: 500 });
  }
}
