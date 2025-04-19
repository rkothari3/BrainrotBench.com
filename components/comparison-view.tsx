"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Maximize2, Volume2, VolumeX } from "lucide-react"
import { useModels } from "@/contexts/models-context"

interface ComparisonViewProps {
  initialPrompt?: string
}

export default function ComparisonView({ initialPrompt }: ComparisonViewProps) {
  const { selectedModelA, selectedModelB, updateModelsAfterVote, selectNewModels } = useModels()
  const [loading, setLoading] = useState(true)
  const [voted, setVoted] = useState(false)
  const [audioPlayingA, setAudioPlayingA] = useState(false)
  const [audioPlayingB, setAudioPlayingB] = useState(false)

  // Simulate loading content
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [selectedModelA, selectedModelB])

  const handleVote = (choice: "A" | "B" | "TIE") => {
    setVoted(true)

    // Update models with the vote result
    updateModelsAfterVote(choice)

    // Here you would typically send the vote to your backend
    console.log(`Voted for ${choice}`)
  }

  const handleNextComparison = () => {
    setLoading(true)
    setVoted(false)

    // Select new models for comparison
    selectNewModels()
  }

  const toggleAudioA = () => {
    setAudioPlayingA(!audioPlayingA)
    if (audioPlayingB) setAudioPlayingB(false)
  }

  const toggleAudioB = () => {
    setAudioPlayingB(!audioPlayingB)
    if (audioPlayingA) setAudioPlayingA(false)
  }

  if (!selectedModelA || !selectedModelB) {
    return (
      <div className="w-full max-w-5xl flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Model A */}
        <Card className="relative overflow-hidden aspect-[4/3] flex items-center justify-center bg-black/70 backdrop-blur-sm border-white/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Loading model A...</p>
            </div>
          ) : (
            <>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button variant="ghost" size="icon" onClick={toggleAudioA} className="bg-black/50 hover:bg-black/70">
                  {audioPlayingA ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70">
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">A</span>
              </div>
              {voted && (
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {selectedModelA.name} ({selectedModelA.eloRating})
                  </span>
                </div>
              )}
              <img
                src="/placeholder.svg?height=300&width=400"
                alt="AI Generated Content A"
                className="w-full h-full object-cover"
              />
            </>
          )}
        </Card>

        {/* Model B */}
        <Card className="relative overflow-hidden aspect-[4/3] flex items-center justify-center bg-black/70 backdrop-blur-sm border-white/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Loading model B...</p>
            </div>
          ) : (
            <>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button variant="ghost" size="icon" onClick={toggleAudioB} className="bg-black/50 hover:bg-black/70">
                  {audioPlayingB ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70">
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">B</span>
              </div>
              {voted && (
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {selectedModelB.name} ({selectedModelB.eloRating})
                  </span>
                </div>
              )}
              <img
                src="/placeholder.svg?height=300&width=400"
                alt="AI Generated Content B"
                className="w-full h-full object-cover"
              />
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
          <Button onClick={handleNextComparison} className="px-8 bg-green-600 hover:bg-green-700">
            Next Comparison
          </Button>
        </div>
      )}
    </div>
  )
}
