"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type Model, initialModels, selectRandomModels } from "@/lib/models"
import { updateEloRatings } from "@/lib/elo"
import { fetchModels, updateModelsAfterVote as updateModelsInDb } from "@/app/actions"
import { getSupabaseClient } from "@/lib/supabase"

// Defines the shape of data and functions our context will provide
interface ModelsContextType {
  models: Model[] // List of all models
  selectedModelA: Model | null // First model being compared
  selectedModelB: Model | null // Second model being compared
  selectNewModels: () => void // Function to pick new models to compare
  updateModelsAfterVote: (choice: "A" | "B" | "TIE") => void // Function to handle voting
  loading: boolean // Whether models are loading
  error: string | null // Error message if any
}

// Creates the context with undefined default value
const ModelsContext = createContext<ModelsContextType | undefined>(undefined)

// The provider component that will wrap parts of our app that need this data
export function ModelsProvider({ children }: { children: React.ReactNode }) {
  // State to store all models and the currently selected pair
  const [models, setModels] = useState<Model[]>([])
  const [selectedModelA, setSelectedModelA] = useState<Model | null>(null)
  const [selectedModelB, setSelectedModelB] = useState<Model | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // On first load, fetch models from Supabase
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true)
        setError(null)
        const fetchedModels = await fetchModels()

        if (fetchedModels.length === 0) {
          // If no models were fetched, use initial models
          setModels(initialModels)
          const [modelA, modelB] = selectRandomModels([...initialModels])
          setSelectedModelA(modelA)
          setSelectedModelB(modelB)
        } else {
          setModels(fetchedModels)
          // Select initial models for comparison
          const [modelA, modelB] = selectRandomModels([...fetchedModels])
          setSelectedModelA(modelA)
          setSelectedModelB(modelB)
        }
      } catch (error) {
        console.error("Failed to load models:", error)
        setError("Failed to load models. Using local data instead.")
        // Fallback to initial models if fetch fails
        setModels(initialModels)
        const [modelA, modelB] = selectRandomModels([...initialModels])
        setSelectedModelA(modelA)
        setSelectedModelB(modelB)
      } finally {
        setLoading(false)
      }
    }

    loadModels()

    // Set up real-time subscription for model updates
    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        const subscription = supabase
          .channel("models-changes")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "models",
            },
            async (payload) => {
              try {
                // Refresh models when changes occur
                const refreshedModels = await fetchModels()
                if (refreshedModels.length > 0) {
                  setModels(refreshedModels)
                }
              } catch (error) {
                console.error("Error refreshing models:", error)
              }
            },
          )
          .subscribe((status) => {
            if (status === "CLOSED") {
              console.log("Supabase subscription closed")
            }
            if (status === "CHANNEL_ERROR") {
              console.error("Supabase subscription error")
            }
          })

        return () => {
          try {
            supabase.removeChannel(subscription)
          } catch (error) {
            console.error("Error removing Supabase channel:", error)
          }
        }
      } catch (error) {
        console.error("Error setting up Supabase subscription:", error)
      }
    }
  }, [])

  // Helper function to select two random models for comparison
  const selectNewModelsInternal = () => {
    if (models.length < 2) return

    const [modelA, modelB] = selectRandomModels([...models])
    setSelectedModelA(modelA)
    setSelectedModelB(modelB)
  }

  // Function to handle user votes and update model ratings
  const updateModelsAfterVote = async (choice: "A" | "B" | "TIE") => {
    if (!selectedModelA || !selectedModelB) return

    // Determine scores based on user's choice
    let scoreA = 0.5 // Default for tie
    let scoreB = 0.5 // Default for tie

    if (choice === "A") {
      scoreA = 1 // Model A wins
      scoreB = 0 // Model B loses
    } else if (choice === "B") {
      scoreA = 0 // Model A loses
      scoreB = 1 // Model B wins
    }

    // Calculate new ELO ratings based on the outcome
    const { newRatingA, newRatingB } = updateEloRatings(
      selectedModelA.eloRating,
      selectedModelB.eloRating,
      scoreA,
      scoreB,
    )

    try {
      // Update local state optimistically
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

      // Update models in the database
      const success = await updateModelsInDb(selectedModelA.id, selectedModelB.id, newRatingA, newRatingB, choice)

      if (!success) {
        console.error("Failed to update models in database, but local state was updated")
      }
    } catch (error) {
      console.error("Failed to update models:", error)
      setError("Failed to update vote. Please try again.")
    }
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
        loading,
        error,
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
