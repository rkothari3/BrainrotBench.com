"use client"  // Marks this as a client-side component in Next.js

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type Model, initialModels, selectRandomModels } from "@/lib/models"
import { updateEloRatings } from "@/lib/elo"

// Defines the shape of data and functions our context will provide
interface ModelsContextType {
  models: Model[]                                     // List of all models
  selectedModelA: Model | null                        // First model being compared
  selectedModelB: Model | null                        // Second model being compared
  selectNewModels: () => void                         // Function to pick new models to compare
  updateModelsAfterVote: (choice: "A" | "B" | "TIE") => void  // Function to handle voting
}

// Creates the context with undefined default value
const ModelsContext = createContext<ModelsContextType | undefined>(undefined)

// The provider component that will wrap parts of our app that need this data
export function ModelsProvider({ children }: { children: React.ReactNode }) {
  // State to store all models and the currently selected pair
  const [models, setModels] = useState<Model[]>(initialModels)
  const [selectedModelA, setSelectedModelA] = useState<Model | null>(null)
  const [selectedModelB, setSelectedModelB] = useState<Model | null>(null)

  // On first load, try to load saved models from browser storage
  useEffect(() => {
    const savedModels = localStorage.getItem("brainrotBenchModels")
    if (savedModels) {
      try {
        setModels(JSON.parse(savedModels))
      } catch (e) {
        console.error("Failed to parse saved models:", e)
      }
    }

    // Select initial models for comparison
    selectNewModelsInternal()
  }, [])

  // Whenever models change, save them to browser storage
  useEffect(() => {
    localStorage.setItem("brainrotBenchModels", JSON.stringify(models))
  }, [models])

  // Helper function to select two random models for comparison
  const selectNewModelsInternal = () => {
    const [modelA, modelB] = selectRandomModels([...models])
    setSelectedModelA(modelA)
    setSelectedModelB(modelB)
  }

  // Function to handle user votes and update model ratings
  const updateModelsAfterVote = (choice: "A" | "B" | "TIE") => {
    if (!selectedModelA || !selectedModelB) return

    // Determine scores based on user's choice
    let scoreA = 0.5  // Default for tie
    let scoreB = 0.5  // Default for tie

    if (choice === "A") {
      scoreA = 1      // Model A wins
      scoreB = 0      // Model B loses
    } else if (choice === "B") {
      scoreA = 0      // Model A loses
      scoreB = 1      // Model B wins
    }

    // Calculate new ELO ratings based on the outcome
    const { newRatingA, newRatingB } = updateEloRatings(
      selectedModelA.eloRating,
      selectedModelB.eloRating,
      scoreA,
      scoreB,
    )

    // Update all models with new ratings and stats
    setModels((prevModels) => {
      return prevModels.map((model) => {
        if (model.id === selectedModelA.id) {
          return {
            ...model,
            eloRating: Math.round(newRatingA),
            wins: model.wins + (choice === "A" ? 1 : 0),
            losses: model.losses + (choice === "B" ? 1 : 0),
            ties: model.ties + (choice === "TIE" ? 1 : 0),
            totalVotes: model.totalVotes + 1,
          }
        }
        if (model.id === selectedModelB.id) {
          return {
            ...model,
            eloRating: Math.round(newRatingB),
            wins: model.wins + (choice === "B" ? 1 : 0),
            losses: model.losses + (choice === "A" ? 1 : 0),
            ties: model.ties + (choice === "TIE" ? 1 : 0),
            totalVotes: model.totalVotes + 1,
          }
        }
        return model
      })
    })
  }

  // Public function to select new models for comparison
  const selectNewModels = () => {
    selectNewModelsInternal()
  }

  // Provide the context values to all children components
  return (
    <ModelsContext.Provider
      value={{
        models,
        selectedModelA,
        selectedModelB,
        selectNewModels,
        updateModelsAfterVote,
      }}
    >
      {children}
    </ModelsContext.Provider>
  )
}

// Custom hook to easily access this context from any component
export function useModels() {
  const context = useContext(ModelsContext)
  if (context === undefined) {
    throw new Error("useModels must be used within a ModelsProvider")
  }
  return context
}
