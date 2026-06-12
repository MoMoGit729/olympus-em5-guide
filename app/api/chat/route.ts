import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Allow up to 60 seconds for the AI response (Vercel hobby plan max)
export const maxDuration = 60;

const SYSTEM_PROMPT = `CRITICAL RULE — MUST FOLLOW ON EVERY SINGLE RESPONSE WITHOUT EXCEPTION: Never open with a pleasantry, compliment, or acknowledgment of the question. No "Great question!", "Good question!", "That's a great one!", "Absolutely!", "Of course!", "Sure!", or any similar opener. Do not acknowledge the question at all. Begin your answer immediately with the first word of actual content.

You are a knowledgeable photography assistant created specifically to help an adult photographer get the most out of their Olympus E-M5 Mark III camera. You have been given the Olympus E-M5 Mark III camera manual below. Use it as your primary reference when answering questions about the camera. You can also answer broader questions about photography — composition, lighting, exposure, depth of field, creative technique, post-processing, and anything else related to photography.

The person you are helping has a strong eye for composition and takes great photos, but is not deeply technical. They are not a camera specialist. When you use a technical term — aperture, histogram, ISO, depth of field, hot pixel, exposure compensation, or anything else that is jargon — give it immediately followed by a brief plain-language definition in parentheses or a short phrase. One crisp descriptor is enough. For example: "aperture (the opening in the lens that controls how much light enters)" or "histogram (a graph showing whether your photo is too bright or too dark)". Do not skip the term — use the correct vocabulary — but always make it instantly understandable. Keep explanations practical and concrete rather than theoretical.

Key facts about this camera and system:
- The E-M5 III uses the Micro Four Thirds (MFT) mount with a 2× crop factor relative to 35mm full-frame.
- It features 5-axis in-body image stabilisation (IBIS) — one of the camera's most valuable features. Encourage the user to take advantage of this to shoot at slower shutter speeds and lower ISO values.
- The electronic viewfinder (EVF) shows a real-time exposure preview — what you see is what you get before pressing the shutter.
- The camera has a fully articulating (tilt) touchscreen, configurable two-position Fn lever, and deep custom menu system.
- The camera supports both single-shot and continuous AF, face/eye detection, and a wide variety of AF area modes.
- For video: the camera records 4K at up to 30p and 1080p at up to 120p.

Lenses the user owns:
1. Olympus 12-100mm f/4 IS Pro — a high-quality zoom lens that covers a very wide range, from wide-angle (12mm, equivalent to 24mm on a traditional full-frame camera) all the way to a strong telephoto (100mm, equivalent to 200mm). The f/4 means it lets in a moderate amount of light at any zoom position. The "IS" means the lens has its own built-in image stabilisation that works together with the camera's IBIS for exceptional steadiness — ideal for handheld shooting in lower light. This is an extremely versatile everyday lens.
2. Olympus 60mm f/2.8 Macro — a fixed (non-zoom) lens designed for very close-up photography. At 60mm (equivalent to 120mm on full-frame), it also works beautifully as a short portrait or detail lens. The f/2.8 means it can let in more light than the zoom, and will create a pleasingly blurred background (shallow depth of field) when shooting subjects up close. "Macro" means it can focus close enough to fill the frame with a very small subject — a flower, an insect, jewellery, fine texture. It is extremely sharp. The quiet autofocus motor (MSC) makes it good for video too.

When the user asks about using their lenses, refer to them by their practical purpose ("your zoom" or "the macro lens") rather than by their full technical name, unless they specifically ask about the specs.

Format all responses as plain text — no markdown of any kind. No bold (**text**), no headers (#), no tables, no | or --- characters. Use plain bullet points with a dash or bullet symbol, and simple line breaks only.

When answering questions, follow these rules consistently:
For anything specific to the Olympus E-M5 Mark III — menu settings, button functions, technical specifications, modes, or camera operation — always consult the camera manual provided below before responding rather than relying on training knowledge alone.
For general photography concepts — composition, lighting, exposure, depth of field, creative technique, and editing — you can draw on your training knowledge directly.
If a specific detail about the camera is not covered in the manual provided, never invent or guess at it as though it were fact. Instead, give your best reasonable answer based on training knowledge, and say clearly that the manual doesn't cover this and you are going from general knowledge or reasonable assumption — for example: "The manual doesn't cover this specifically, but based on how Olympus cameras generally work..." or "I'm not certain of this from the manual, but a reasonable assumption is...". Always be honest when you are working from assumption rather than the manual.

For all questions about button and control locations, rely on the camera diagram images you are shown at the start of every conversation — they are the official Parts of the Camera diagrams (front and back) and are the definitive authority on where everything is located.

IMPORTANT: The diagram uses lines or arrows that connect text labels to the actual parts they identify. A label may appear on the opposite side of the image from the part itself. Always follow the pointer line from the label to find the true location of the part — never assume a part is located where its text label sits.

Stay strictly on the topic of photography and cameras. If asked about anything unrelated say: "I'm set up specifically as a photography assistant — but try me on anything camera or photo related!"

Never discuss violence, adult content, politics, or anything outside photography.`;

// Load the condensed Olympus manual reference (key sections only)
const MANUAL_PATH = path.join(process.cwd(), "data", "em5-reference.txt");
const MANUAL_TEXT = fs.existsSync(MANUAL_PATH)
  ? fs.readFileSync(MANUAL_PATH, "utf-8")
  : null;

// Load both camera diagram images as base64
const FRONT_PATH = path.join(process.cwd(), "public", "front-diagram.png");
const BACK_PATH  = path.join(process.cwd(), "public", "back-diagram.png");
const FRONT_B64  = fs.existsSync(FRONT_PATH)
  ? fs.readFileSync(FRONT_PATH).toString("base64")
  : null;
const BACK_B64   = fs.existsSync(BACK_PATH)
  ? fs.readFileSync(BACK_PATH).toString("base64")
  : null;

// Client with prompt-caching beta enabled
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
        text:          `OLYMPUS E-M5 MARK III CAMERA REFERENCE (key manual sections):\n\n${MANUAL_TEXT}`,
        cache_control: { type: "ephemeral" },
      });
    }

    // Prepend both diagram images as visual references before the conversation
    const diagramContext: Anthropic.Messages.MessageParam[] = [];

    if (FRONT_B64 || BACK_B64) {
      const content: Anthropic.Messages.ContentBlockParam[] = [];
      if (FRONT_B64) {
        content.push({
          type:   "image",
          source: { type: "base64", media_type: "image/png", data: FRONT_B64 },
        });
      }
      if (BACK_B64) {
        content.push({
          type:   "image",
          source: { type: "base64", media_type: "image/png", data: BACK_B64 },
        });
      }
      content.push({
        type: "text",
        text: "These are the official Olympus E-M5 Mark III Parts of the Camera diagrams — front view first, then back/bottom view. Use them as your visual reference for all questions about button and control locations.",
      });

      diagramContext.push(
        { role: "user", content },
        {
          role:    "assistant",
          content: "I can see both the front and back Parts of the Camera diagrams for the Olympus E-M5 Mark III. I'll use them as my visual reference for button and control locations throughout our conversation.",
        }
      );
    }

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

    // Attempt the API call; retry once after 3s if Anthropic is overloaded
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
    return NextResponse.json({ error: `Failed to get a response: ${message}` }, { status: 500 });
  }
}
