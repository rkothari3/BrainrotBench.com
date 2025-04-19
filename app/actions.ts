"use server";

import { createSupabaseServer } from "@/lib/supabase";
import type { Model } from "@/lib/models";

// Fetch all models from Supabase
export async function fetchModels(): Promise<Model[]> {
  try {
    const supabaseServer = createSupabaseServer();
    const { data, error } = await supabaseServer
      .from("models")
      .select("*")
      .order("elo_rating", { ascending: false });

    if (error) {
      console.error("Error fetching models:", error);
      throw new Error("Failed to fetch models");
    }

    if (!data) {
      return [];
    }

    // Transform the data to match our Model interface
    return data.map((model) => ({
      id: model.id,
      name: model.name,
      eloRating: model.elo_rating,
      wins: model.wins,
      losses: model.losses,
      ties: model.ties,
      totalVotes: model.total_votes,
    }));
  } catch (error) {
    console.error("Error in fetchModels:", error);
    // Return empty array instead of throwing to prevent client-side errors
    return [];
  }
}

// Update models after a vote
export async function updateModelsAfterVote(
  modelAId: string,
  modelBId: string,
  newRatingA: number,
  newRatingB: number,
  choice: "A" | "B" | "TIE",
): Promise<boolean> {
  try {
    const supabaseServer = createSupabaseServer();
    const { error } = await supabaseServer.rpc("update_models_after_vote", {
      model_a_id: modelAId,
      model_b_id: modelBId,
      new_rating_a: Math.round(newRatingA),
      new_rating_b: Math.round(newRatingB),
      choice_a: choice === "A" ? 1 : 0,
      choice_b: choice === "B" ? 1 : 0,
      choice_tie: choice === "TIE" ? 1 : 0,
    });

    if (error) {
      console.error("Error updating models:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateModelsAfterVote:", error);
    return false;
  }
}
