"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Play, Pause } from "lucide-react";

interface VideoItem {
  model: string;
  idea_name: string;
  video_path: string;
  reasoning: string;
}

export default function ComparisonView() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videoA, setVideoA] = useState<VideoItem | null>(null);
  const [videoB, setVideoB] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [isPlayingA, setIsPlayingA] = useState(false);
  const [isPlayingB, setIsPlayingB] = useState(false);

  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch("/summary.json")
      .then((r) => r.json())
      .then((data: VideoItem[]) => {
        setVideos(data);
        pickTwo(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pickTwo = (arr: VideoItem[]) => {
    if (arr.length < 2) return;
    const i = Math.floor(Math.random() * arr.length);
    let j = Math.floor(Math.random() * (arr.length - 1));
    if (j >= i) j++;
    setVideoA(arr[i]);
    setVideoB(arr[j]);
  };

  const handleVote = (c: "A" | "B" | "TIE") => {
    setVoted(true);
    console.log("voted", c);
  };

  const next = () => {
    setVoted(false);
    setIsPlayingA(false);
    setIsPlayingB(false);
    videoRefA.current?.pause();
    videoRefB.current?.pause();
    pickTwo(videos);
  };

  if (loading || !videoA || !videoB) {
    return (
      <div className="w-full max-w-5xl flex flex-col items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const src = (p: string) => p.replace(/^public\//, "/");

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* VIDEO A */}
        <Card className="relative aspect-[4/3] bg-black/70">
          <video
            ref={videoRefA}
            src={src(videoA.video_path)}
            autoPlay
            muted={false}
            playsInline
            onPlay={() => setIsPlayingA(true)}
            onPause={() => setIsPlayingA(false)}
            onEnded={() => {
              const vb = videoRefB.current!;
              vb.muted = false;
              vb.play().then(() => setIsPlayingB(true));
            }}
            className="w-full h-full object-cover"
          />
          {!isPlayingA && (
            <Button
              size="icon"
              className="absolute inset-0 m-auto bg-black/50"
              onClick={() => videoRefA.current?.play()}
            >
              <Play className="h-6 w-6" />
            </Button>
          )}
          {voted && (
            <div className="absolute bottom-2 right-2">
              <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                {videoA.model}
              </span>
            </div>
          )}
        </Card>

        {/* VIDEO B */}
        <Card className="relative aspect-[4/3] bg-black/70">
          <video
            ref={videoRefB}
            src={src(videoB.video_path)}
            autoPlay={false}
            muted={false}
            playsInline
            onPlay={() => setIsPlayingB(true)}
            onPause={() => setIsPlayingB(false)}
            className="w-full h-full object-cover"
          />
          {!isPlayingB && (
            <Button
              size="icon"
              className="absolute inset-0 m-auto bg-black/50"
              onClick={() => videoRefB.current?.play()}
            >
              <Play className="h-6 w-6" />
            </Button>
          )}
          {voted && (
            <div className="absolute bottom-2 right-2">
              <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                {videoB.model}
              </span>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="default"
          size="lg"
          className="w-full bg-purple-700 hover:bg-purple-800 text-white"
          disabled={voted}
          onClick={() => handleVote("A")}
        >
          VOTE A
        </Button>
        <Button
          variant="default"
          size="lg"
          className="w-full bg-gray-700 hover:bg-gray-800 text-white"
          disabled={voted}
          onClick={() => handleVote("TIE")}
        >
          TIE
        </Button>
        <Button
          variant="default"
          size="lg"
          className="w-full bg-purple-700 hover:bg-purple-800 text-white"
          disabled={voted}
          onClick={() => handleVote("B")}
        >
          VOTE B
        </Button>
      </div>

      {voted && (
        <div className="mt-6 text-center">
          <Button
            onClick={next}
            className="px-8 bg-green-600 hover:bg-green-700"
          >
            Next Comparison
          </Button>
        </div>
      )}
    </div>
  );
}
