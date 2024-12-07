import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    // Log to verify environment variable
    console.log('API Token exists:', !!process.env.REPLICATE_API_TOKEN);
    
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('The REPLICATE_API_TOKEN environment variable is not set.');
    }

    const { prompt } = await request.json();
    console.log('Received prompt:', prompt);

    const options = {
      version: '8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f',
      input: { prompt }
    };

    console.log('Making prediction with options:', options);
    const prediction = await replicate.predictions.create(options);
    console.log('Prediction response:', prediction);

    if (prediction?.error) {
      console.error('Prediction error:', prediction.error);
      return NextResponse.json({ detail: prediction.error }, { status: 500 });
    }

    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    // Log the full error
    console.error('Full error details:', error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}