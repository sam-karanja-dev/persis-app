import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    // Verify environment variable
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('The REPLICATE_API_TOKEN environment variable is not set.');
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { detail: "Prompt is required" },
        { status: 400 }
      );
    }

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 50,
        }
      }
    );

    if (!output) {
      throw new Error('No output received from Replicate');
    }

    // Create a prediction object that matches the expected format
    const prediction = {
      id: Date.now().toString(), // You might want to use a proper UUID here
      status: "succeeded",
      output: output,
    };

    return NextResponse.json(prediction, { status: 201 });

  } catch (error) {
    console.error('API Route Error:', error);
    
    // Provide more detailed error information
    return NextResponse.json({
      detail: error.message,
      error: true,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Add a GET route to handle polling
export async function GET(request) {
  try {
    // Extract prediction ID from the URL
    const predictionId = request.url.split('/').pop();
    
    if (!predictionId) {
      return NextResponse.json(
        { detail: "Prediction ID is required" },
        { status: 400 }
      );
    }

    // Get prediction status from Replicate
    const prediction = await replicate.predictions.get(predictionId);

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('GET Prediction Error:', error);
    return NextResponse.json({
      detail: error.message,
      error: true,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}