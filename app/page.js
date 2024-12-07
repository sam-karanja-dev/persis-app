'use client';
 
import { useState } from "react";
import Image from "next/image";
 
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
 
export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const prompt = e.target.prompt.value;
    
    try {
      // Initial request to start the prediction
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt
        }),
      });
  
      let prediction = await response.json();
      setPrediction(prediction);
  
      // Poll for the result
      while (prediction.status !== "succeeded" && prediction.status !== "failed") {
        await sleep(1000); // Wait for 1 second
        const pollResponse = await fetch(`/api/predictions/${prediction.id}`);
        
        // Add error checking for the polling response
        if (!pollResponse.ok) {
          throw new Error(`Polling failed with status ${pollResponse.status}`);
        }
        
        const updatedPrediction = await pollResponse.json();
        if (updatedPrediction.error) {
          throw new Error(updatedPrediction.error);
        }
        
        prediction = updatedPrediction;
        setPrediction(prediction);
      }
  
    } catch (err) {
      console.error('Request error:', err);
      setError('Failed to process request');
    }
  };
 
  return (
    <div className="container max-w-2xl mx-auto p-5">
      <h1 className="py-6 text-center font-bold text-2xl">
        Dream something with{" "}
        <a href="https://replicate.com/stability-ai/sdxl?utm_source=project&utm_project=getting-started">
          SDXL
        </a>
      </h1>
 
      <form className="w-full flex" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-grow"
          name="prompt"
          placeholder="Enter a prompt to display an image"
        />
        <button className="button" type="submit">
          Go!
        </button>
      </form>
 
      {error && <div>{error}</div>}
 
      {prediction && (
        <>
          {prediction.output && (
            <div className="image-wrapper mt-5">
              <Image
                src={prediction.output[prediction.output.length - 1]}
                alt="output"
                sizes="100vw"
                height={768}
                width={768}
              />
            </div>
          )}
          <p className="py-3 text-sm opacity-50">status: {prediction.status}</p>
        </>
      )}
    </div>
  );
}