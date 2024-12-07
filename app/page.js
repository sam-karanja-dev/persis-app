'use client';

import { useState } from "react";
import Image from "next/image";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
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

      if (!response.ok) {
        throw new Error(`Initial request failed with status ${response.status}`);
      }
  
      let prediction = await response.json();
      if (!prediction.id) {
        throw new Error('No prediction ID received from server');
      }
      
      setPrediction(prediction);
  
      // Poll for the result
      while (prediction.status !== "succeeded" && prediction.status !== "failed") {
        await sleep(1000);
        const pollResponse = await fetch(`/api/predictions/${prediction.id}`);
        
        if (!pollResponse.ok) {
          throw new Error(`Polling failed with status ${pollResponse.status}`);
        }
        
        prediction = await pollResponse.json();
        if (prediction.error) {
          throw new Error(prediction.error);
        }
        
        setPrediction(prediction);
      }
  
    } catch (err) {
      console.error('Request error:', err);
      setError(err.message || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-5">
      <h1 className="py-6 text-center font-bold text-2xl">
        Dream something with{" "}
        <a href="https://replicate.com/stability-ai/sdxl" 
           className="text-blue-600 hover:text-blue-800" 
           target="_blank" 
           rel="noopener noreferrer">
          SDXL
        </a>
      </h1>

      <form className="w-full flex mb-4" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-grow border rounded-l px-4 py-2"
          name="prompt"
          placeholder="Enter a prompt to display an image"
          required
          disabled={isLoading}
        />
        <button 
          className={`px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Go!'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded">
          Error: {error}
        </div>
      )}

      {prediction && (
        <div className="mt-4">
          {prediction.output && (
            <div className="relative w-full aspect-square">
              <Image
                src={prediction.output[prediction.output.length - 1]}
                alt="Generated image"
                fill
                className="object-contain rounded"
                priority
              />
            </div>
          )}
          <p className="py-3 text-sm text-gray-500">Status: {prediction.status}</p>
        </div>
      )}
    </div>
  );
}