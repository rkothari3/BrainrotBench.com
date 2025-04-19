"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Maximize2,
  Volume2,
  VolumeX,
  AlertCircle,
  Play,
  Pause,
} from "lucide-react";
import { useModels } from "@/contexts/models-context";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ComparisonViewProps {
  initialPrompt?: string;
}

export default function ComparisonView({ initialPrompt }: ComparisonViewProps) {
  const {
    selectedModelA,
    selectedModelB,
    updateModelsAfterVote,
    selectNewModels,
    loading: modelsLoading,
    error,
  } = useModels();
  const [contentLoading, setContentLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [audioPlayingA, setAudioPlayingA] = useState(false);
  const [audioPlayingB, setAudioPlayingB] = useState(false);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  // Simulate loading content and log paths
  useEffect(() => {
    if (!modelsLoading && selectedModelA && selectedModelB) {
      console.log("Model A video path:", selectedModelA.videoPath);
      console.log("Model B video path:", selectedModelB.videoPath);

      const timer = setTimeout(() => {
        setContentLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [selectedModelA, selectedModelB, modelsLoading]);

  const handleVote = (choice: "A" | "B" | "TIE") => {
    setVoted(true);

    // Update models with the vote result
    updateModelsAfterVote(choice);

    // Here you would typically send the vote to your backend
    console.log(`Voted for ${choice}`);
  };

  const handleNextComparison = () => {
    setContentLoading(true);
    setVoted(false);

    // Select new models for comparison
    selectNewModels();
  };

  const toggleAudioA = () => {
    const newAudioState = !audioPlayingA;
    setAudioPlayingA(newAudioState);
    if (audioPlayingB) setAudioPlayingB(false);

    if (videoRefA.current) {
      videoRefA.current.muted = !newAudioState;
      if (newAudioState && !isPlayingA) {
        // If enabling audio and video isn't playing, start playing
        videoRefA.current.play();
        setIsPlayingA(true);
      }
    }
  };

  const toggleAudioB = () => {
    const newAudioState = !audioPlayingB;
    setAudioPlayingB(newAudioState);
    if (audioPlayingA) setAudioPlayingA(false);

    if (videoRefB.current) {
      videoRefB.current.muted = !newAudioState;
      if (newAudioState && !isPlayingB) {
        // If enabling audio and video isn't playing, start playing
        videoRefB.current.play();
        setIsPlayingB(true);
      }
    }
  };

  const togglePlayA = () => {
    if (videoRefA.current) {
      if (isPlayingA) {
        videoRefA.current.pause();
      } else {
        videoRefA.current.play();
      }
      setIsPlayingA(!isPlayingA);
    }
  };

  const togglePlayB = () => {
    if (videoRefB.current) {
      if (isPlayingB) {
        videoRefB.current.pause();
      } else {
        videoRefB.current.play();
      }
      setIsPlayingB(!isPlayingB);
    }
  };

  const loading = modelsLoading || contentLoading;

  if (modelsLoading || !selectedModelA || !selectedModelB) {
    return (
      <div className="w-full max-w-5xl flex flex-col justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading models...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Model A */}
        <Card className="relative overflow-hidden aspect-[4/3] flex items-center justify-center bg-black/70 backdrop-blur-sm border-white/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading model A...
              </p>
            </div>
          ) : (
            <>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleAudioA}
                  className="bg-black/50 hover:bg-black/70"
                >
                  {audioPlayingA ? (
                    <Volume2 className="h-5 w-5" />
                  ) : (
                    <VolumeX className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayA}
                  className="bg-black/50 hover:bg-black/70"
                >
                  {isPlayingA ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                  A
                </span>
              </div>
              {voted && (
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {selectedModelA.name} ({selectedModelA.eloRating})
                  </span>
                </div>
              )}
              <video
                ref={videoRefA}
                src={selectedModelA.videoPath}
                controls
                muted={!audioPlayingA}
                preload="auto"
                loop
                className="w-full h-full object-cover"
                onClick={togglePlayA}
                onLoadedData={() => console.log("Video A loaded")}
                onError={(e) => console.error("Video A error:", e)}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {!isPlayingA && (
                  <Button
                    className="rounded-full bg-black/70 hover:bg-black/50 pointer-events-auto"
                    size="icon"
                    onClick={togglePlayA}
                  >
                    <Play className="h-6 w-6" />
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>

        {/* Model B */}
        <Card className="relative overflow-hidden aspect-[4/3] flex items-center justify-center bg-black/70 backdrop-blur-sm border-white/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading model B...
              </p>
            </div>
          ) : (
            <>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleAudioB}
                  className="bg-black/50 hover:bg-black/70"
                >
                  {audioPlayingB ? (
                    <Volume2 className="h-5 w-5" />
                  ) : (
                    <VolumeX className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayB}
                  className="bg-black/50 hover:bg-black/70"
                >
                  {isPlayingB ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                  B
                </span>
              </div>
              {voted && (
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {selectedModelB.name} ({selectedModelB.eloRating})
                  </span>
                </div>
              )}
              <video
                ref={videoRefB}
                src={selectedModelB.videoPath}
                controls
                muted={!audioPlayingB}
                preload="auto"
                loop
                className="w-full h-full object-cover"
                onClick={togglePlayB}
                onLoadedData={() => console.log("Video B loaded")}
                onError={(e) => console.error("Video B error:", e)}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {!isPlayingB && (
                  <Button
                    className="rounded-full bg-black/70 hover:bg-black/50 pointer-events-auto"
                    size="icon"
                    onClick={togglePlayB}
                  >
                    <Play className="h-6 w-6" />
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="default"
          size="lg"
          className="w-full bg-purple-700 hover:bg-purple-800 text-white"
          disabled={loading || voted}
          onClick={() => handleVote("A")}
        >
          VOTE A
        </Button>
        <Button
          variant="default"
          size="lg"
          className="w-full bg-gray-700 hover:bg-gray-800 text-white"
          disabled={loading || voted}
          onClick={() => handleVote("TIE")}
        >
          TIE
        </Button>
        <Button
          variant="default"
          size="lg"
          className="w-full bg-purple-700 hover:bg-purple-800 text-white"
          disabled={loading || voted}
          onClick={() => handleVote("B")}
        >
          VOTE B
        </Button>
      </div>

      {voted && (
        <div className="mt-6 text-center">
          <Button
            onClick={handleNextComparison}
            className="px-8 bg-green-600 hover:bg-green-700"
          >
            Next Comparison
          </Button>
        </div>
      )}
    </div>
  );
}
