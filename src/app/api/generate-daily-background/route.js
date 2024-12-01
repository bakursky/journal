// app/api/generate-daily-background/route.ts
import { fal } from "@fal-ai/client";
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure dynamic rendering

export async function GET() {
  try {
    const result = await fal.subscribe("fal-ai/flux-lora", {
      input: {
        prompt: "Amazing landscape",
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("Result Data:", result.data);

    // Ensure data and images exist
    if (result.data && Array.isArray(result.data.images) && result.data.images.length > 0) {
      const imageUrl = result.data.images[0].url;

      // Return the image URL as JSON
      return NextResponse.json({
        imageUrl,
        generatedAt: new Date().toISOString(),
      });
    } else {
      throw new Error("No image generated");
    }
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json({
      error: "Failed to generate image",
      details: error.message,
    }, { status: 500 });
  }
}
