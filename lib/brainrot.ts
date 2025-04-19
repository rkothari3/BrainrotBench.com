/**
 * Functions for loading and handling brainrot video data
 */

import { Model } from "./models";

// Interface for the brainrot summary data
export interface BrainrotSummary {
  model: string;
  idea_name: string;
  video_path: string;
  reasoning: string;
}

// Create a map of models by ID
export async function loadBrainrotModels(): Promise<Model[]> {
  try {
    const response = await fetch("/summary.json");
    if (!response.ok) {
      throw new Error("Failed to load summary.json");
    }

    const summaryData: BrainrotSummary[] = await response.json();

    // Convert summary data to models format
    return summaryData.map((item) => {
      const modelId = item.model.replace("/", "_");
      const modelName = item.model.includes("openai")
        ? `OpenAI ${item.model.split("/")[1]}`
        : `Google ${item.model.split("/")[1]}`;

      return {
        id: modelId,
        name: modelName,
        eloRating: 1000,
        wins: 0,
        losses: 0,
        ties: 0,
        totalVotes: 0,
        ideaName: item.idea_name,
        videoPath: item.video_path.replace(/^public\//, "/"),
        reasoning: item.reasoning,
      };
    });
  } catch (error) {
    console.error("Error loading brainrot models:", error);
    return [];
  }
}
