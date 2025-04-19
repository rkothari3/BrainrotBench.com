import base64
import concurrent.futures
import json
import logging
import os
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

import requests
from dotenv import load_dotenv
from elevenlabs import save
from elevenlabs.client import ElevenLabs
from openai import OpenAI

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

load_dotenv()
logging.info("Environment variables loaded")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
XAI_API_KEY = os.getenv("XAI_API_KEY")

# Models to use
MODELS = [
    "google/gemini-2.5-pro-preview-03-25",
    "openai/o4-mini-high",
    "openai/gpt-4.1",
    "anthropic/claude-3.7-sonnet",
    "deepseek/deepseek-chat-v3-0324",
    "google/gemini-2.5-flash-preview",
]


# Create OpenRouter client with base configuration
def create_openrouter_client(_):
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
        default_headers={
            "HTTP-Referer": "https://localhost",  # Required by OpenRouter
            "X-Title": "Brainrot Generator",  # Optional
        },
    )


# Initialize ElevenLabs client
eleven = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# Initialize X.AI client for image generation
xai_client = OpenAI(base_url="https://api.x.ai/v1", api_key=XAI_API_KEY)

logging.info("API clients initialized")

# Create a timestamp-based output directory
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
BASE_OUTPUT_DIR = "public"
os.makedirs(BASE_OUTPUT_DIR, exist_ok=True)
logging.info("Base output directory created at %s", BASE_OUTPUT_DIR)


def image_to_base64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def create_video(image_path, audio_path, output_path):
    logging.info("Creating video %s", output_path)
    cmd = [
        "ffmpeg",
        "-y",
        "-loop",
        "1",
        "-i",
        image_path,
        "-i",
        audio_path,
        "-c:v",
        "libx264",
        "-tune",
        "stillimage",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-pix_fmt",
        "yuv420p",
        "-shortest",
        output_path,
    ]
    subprocess.run(cmd, check=True)
    logging.info("Video created")


def generate_brainrot_idea(model):
    """Generate a brainrot idea using the specified model through OpenRouter"""
    logging.info(f"Generating brainrot idea with model: {model}")

    client = create_openrouter_client(model)

    prompt = """
Italian brainrot is a moden trend on social media where there are featured characters which are combinations of animals with objects. An example of this is bombardino crocadilo, an airplane combined with a crocodile, and brr brr patapim, a baboon combined with a tree.

Generate an italian brainrot by giving me a description of an image ill feed into an image generation model, and the audio (which should be very short), which will be fed into an audio generation model.

Just to clarify, the animals or the objects do NOT have to be affiliated with Italy in any way. It should just sound Italian. For example, bombardier should be bombardrilo and assassin should be assassino. I attached a few example images.

Return a json object with this format: {
"idea_name": string // the name of the idea
"audio_words": string // what you want the audio of the brainrot image to be. THIS IS WORDS THAT WILL BE SAID IN AN ITALIAN ACCENT, NOT A DESCRIPTION OF THE AUDIO
"image_description": string // a vivid description of the image that will be sent to grok 2 image generation api
}

RETURN VALID JSON AND ONLY VALID JSON.
"""
    # Add retry mechanism with exponential backoff
    max_retries = 2
    for attempt in range(max_retries):
        try:
            msg = [{"type": "text", "text": prompt}]
            msg.append(
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://static.wikia.nocookie.net/brainrotnew/images/1/10/Bombardiro_Crocodilo.jpg/revision/latest?cb=20250417102447",
                    },
                }
            )
            msg.append(
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://static.wikia.nocookie.net/brainrotnew/images/d/df/Anomali_tung_tung_tung.png/revision/latest?cb=20250417061140",
                    },
                }
            )
            msg.append(
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://static.wikia.nocookie.net/brainrotnew/images/a/ac/Tralalero_tralala.jpg/revision/latest?cb=20250321131418",
                    },
                }
            )

            resp = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": msg}],
                response_format={"type": "json_object"},
            )
            idea = json.loads(resp.choices[0].message.content.strip())
            logging.info(f"Idea generated with {model}: {idea['idea_name']}")

            # Add model information to the idea
            idea["model"] = model
            return idea
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = (2**attempt) * 2  # Exponential backoff
                logging.warning(
                    f"Error with {model}, retrying in {wait_time}s: {str(e)}"
                )
                print(e)
                time.sleep(wait_time)
            else:
                logging.error(
                    f"Failed to generate idea with {model} after {max_retries} attempts: {str(e)}"
                )
                # Return a failure indicator
                return {"model": model, "error": str(e), "failed": True}


def generate_ideas_in_parallel():
    """Generate brainrot ideas using multiple models in parallel"""
    logging.info(f"Generating ideas using {len(MODELS)} models in parallel")

    ideas = []
    with concurrent.futures.ThreadPoolExecutor(
        max_workers=min(len(MODELS), 5)
    ) as executor:
        future_to_model = {
            executor.submit(generate_brainrot_idea, model): model for model in MODELS
        }

        for future in concurrent.futures.as_completed(future_to_model):
            model = future_to_model[future]
            try:
                idea = future.result()
                if idea and not idea.get("failed", False):
                    ideas.append(idea)
            except Exception as e:
                logging.error(f"Exception when processing {model}: {str(e)}")

    logging.info(f"Generated {len(ideas)} valid ideas from {len(MODELS)} models")
    return ideas


def generate_images(description, output_dir, count=5, max_workers=5):
    logging.info(f"Generating {count} images for: {description}")
    os.makedirs(output_dir, exist_ok=True)

    def _gen_image(i):
        resp = xai_client.images.generate(
            model="grok-2-image",
            prompt=f"Italian brainrot meme: {description}",
        )
        data = requests.get(resp.data[0].url).content
        path = os.path.join(output_dir, f"image_{i}.jpg")
        with open(path, "wb") as f:
            f.write(data)
        logging.info(f"Saved image {path}")
        return path

    workers = min(count, max_workers)
    paths = []
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(_gen_image, i): i for i in range(count)}
        for future in as_completed(futures):
            try:
                paths.append(future.result())
            except Exception as e:
                logging.error(f"Error generating image {futures[future]}: {e}")
    return paths


def generate_audio(text, output_dir):
    logging.info(f"Generating audio for: {text}")
    try:
        audio = eleven.text_to_speech.convert(
            text=text,
            voice_id="k03ys8IwB1YU6R28L1x8",
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )
        path = os.path.join(output_dir, "audio.mp3")
        save(audio, path)
        logging.info(f"Audio saved to {path}")
        return path
    except Exception as e:
        logging.error(f"Error generating audio: {str(e)}")
        return None


def choose_best_combination(
    idea_name, audio_words, image_paths, model="openai/gpt-4.1", output_dir=None
):
    logging.info(f"Choosing best combination for {idea_name} using {model}")

    client = create_openrouter_client(model)

    prompt = (
        f"I have 5 images for '{idea_name}' with Italian voice saying "
        f"'{audio_words}'.\nPick the best one and explain in JSON:\n"
        "{\n"
        '  "reasoning": string,\n'
        '  "chosen_image": integer\n'
        "}"
    )

    # Convert images to base64 for API submission
    msg = [
        {"type": "text", "text": prompt},
    ]

    for p in image_paths:
        msg.append(
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{image_to_base64(p)}"},
            }
        )

    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": msg}],
            response_format={"type": "json_object"},
        )
        result = json.loads(resp.choices[0].message.content)
        chosen = int(result["chosen_image"]) - 1  # Convert from 1-indexed to 0-indexed

        # Save reasoning to file
        if output_dir:
            with open(os.path.join(output_dir, "reasoning.txt"), "w") as f:
                f.write(
                    f"Chosen image: {chosen+1}\n\nReasoning:\n{result['reasoning']}"
                )

        logging.info(f"Chosen image index: {chosen}")
        return chosen, result["reasoning"]
    except Exception as e:
        logging.error(f"Error choosing best combination: {str(e)}")
        # Return first image as fallback
        return 0, "Error in selection process, defaulting to first image"


def process_idea(idea):
    """Process a single idea from generation to final video"""
    if "failed" in idea:
        logging.warning(f"Skipping failed idea from model {idea['model']}")
        return None

    model = idea["model"]
    name = idea["idea_name"]
    desc = idea["image_description"]
    words = idea["audio_words"]

    # Create a directory for this idea's outputs
    model_name = model.replace("/", "_")
    idea_name = name.replace(" ", "_")
    output_dir = os.path.join(BASE_OUTPUT_DIR, f"{model_name}_{idea_name}")
    os.makedirs(output_dir, exist_ok=True)

    # Save the idea details
    with open(os.path.join(output_dir, "idea.json"), "w") as f:
        json.dump(idea, f, indent=2)

    # Generate images
    images = generate_images(desc, output_dir)
    if not images:
        logging.error(f"No images generated for {name}, skipping")
        return None

    # Generate audio
    audio_path = generate_audio(words, output_dir)
    if not audio_path:
        logging.error(f"No audio generated for {name}, skipping")
        return None

    # Choose the best combination
    idx, reasoning = choose_best_combination(
        name, words, images, model=model, output_dir=output_dir
    )

    # Create the final video
    video_name = f"{idea_name}_final.mp4"
    video_path = os.path.join(output_dir, video_name)
    create_video(images[idx], audio_path, video_path)

    logging.info(f"✅ Video for {model} saved to {video_path}")

    return {
        "model": model,
        "idea_name": name,
        "video_path": video_path,
        "reasoning": reasoning,
    }


def main():
    # Generate ideas from multiple models in parallel
    ideas = generate_ideas_in_parallel()

    # Process each idea sequentially (could be parallelized further if needed)
    results = []
    for idea in ideas:
        result = process_idea(idea)
        if result:
            results.append(result)

    # Create a summary file
    summary_path = os.path.join(BASE_OUTPUT_DIR, "summary.json")
    try:
        with open(summary_path, "r") as f:
            existing = json.load(f)
        if not isinstance(existing, list):
            existing = []
    except FileNotFoundError:
        existing = []

    existing.extend(results)
    with open(summary_path, "w") as f:
        json.dump(existing, f, indent=2)

    logging.info(f"➡️  Generated {len(results)} videos from {len(ideas)} ideas")
    logging.info(f"➡️  Summary saved to {summary_path}")


if __name__ == "__main__":
    main()
