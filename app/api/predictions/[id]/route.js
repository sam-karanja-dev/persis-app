import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(request, { params }) {
  try {
    if (!params.id) {
      return NextResponse.json({ detail: "Missing prediction ID" }, { status: 400 });
    }

    const prediction = await replicate.predictions.get(params.id);
    return NextResponse.json(prediction);
    
  } catch (error) {
    console.error("Polling error:", error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
