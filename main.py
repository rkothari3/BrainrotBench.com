import os
import json
import base64
import requests
import subprocess
import logging

from dotenv import load_dotenv
from openai import AzureOpenAI, OpenAI
from elevenlabs import save
from elevenlabs.client import ElevenLabs

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)

load_dotenv()
logging.info("Environment variables loaded")

XAI_API_KEY = os.getenv("XAI_API_KEY")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

xai_client = OpenAI(base_url="https://api.x.ai/v1", api_key=XAI_API_KEY)
azure_client = AzureOpenAI(
    api_key=AZURE_OPENAI_API_KEY,
    api_version="2024-12-01-preview",
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
)
eleven = ElevenLabs(api_key=ELEVENLABS_API_KEY)
logging.info("API clients initialized")

OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)
logging.info("Output directory ensured at %s", OUTPUT_DIR)


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


def generate_brainrot_ideas():
    logging.info("Generating brainrot idea")
    prompt = """
Italian brainrot is a moden trend on social media where there are featured characters which are combinations of animals with objects. An example of this is bombardino crocadilo, an airplane combined with a crocodile, and brr brr patapim, a baboon combined with a tree.

Generate an italian brainrot by giving me a description of an image ill feed into an image generation model, and the audio (which should be very short), which will be fed into an audio generation model.

Just to clarify, the animals or the objects do NOT have to be affiliated with Italy in any way. It should just sound Italian. For example, bombardier should be bombardrilo and assassin should be assassino.

Return a json object with this format: {
"idea_name": string // the name of the idea
"audio_words": string // what you want the audio of the brainrot image to be. THIS IS WORDS THAT WILL BE SAID IN AN ITALIAN ACCENT, NOT A DESCRIPTION OF THE AUDIO
"image_description": string // a vivid description of the image that will be sent to grok 2 image generation api
}
"""
    resp = azure_client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    idea = json.loads(resp.choices[0].message.content)
    logging.info("Idea generated: %s", idea["idea_name"])
    return idea


def generate_images(description, count=5):
    logging.info("Generating %d images for: %s", count, description)
    paths = []
    for i in range(count):
        resp = xai_client.images.generate(
            model="grok-2-image",
            prompt=f"Italian brainrot meme: {description}",
        )
        data = requests.get(resp.data[0].url).content
        path = os.path.join(OUTPUT_DIR, f"image_{i}.jpg")
        with open(path, "wb") as f:
            f.write(data)
        paths.append(path)
        logging.info("Saved image %s", path)
    return paths


def generate_audio(text):
    logging.info("Generating audio for: %s", text)
    audio = eleven.text_to_speech.convert(
        text=text,
        voice_id="k03ys8IwB1YU6R28L1x8",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
    )
    path = os.path.join(OUTPUT_DIR, "audio.mp3")
    save(audio, path)
    logging.info("Audio saved to %s", path)
    return path


def choose_best_combination(idea_name, audio_words, image_paths):
    logging.info("Choosing best combination for %s", idea_name)
    prompt = (
        f"I have 5 images for '{idea_name}' with Italian voice saying "
        f"'{audio_words}'.\nPick the best one and explain in JSON:\n"
        "{\n"
        '  "reasoning": string,\n'
        '  "chosen_image": integer\n'
        "}"
    )
    msg = [
        {"type": "text", "text": prompt},
        *[
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{image_to_base64(p)}"
                },
            }
            for p in image_paths
        ],
    ]
    resp = azure_client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": msg}],
        response_format={"type": "json_object"},
    )
    result = json.loads(resp.choices[0].message.content)
    chosen = int(result["chosen_image"]) - 1
    logging.info("Chosen image index: %d", chosen)
    return chosen


def main():
    idea = generate_brainrot_ideas()
    name = idea["idea_name"]
    desc = idea["image_description"]
    words = idea["audio_words"]

    images = generate_images(desc)
    audio_path = generate_audio(words)

    idx = choose_best_combination(name, words, images)
    video_name = f"{name.replace(' ', '_')}_final.mp4"
    video_path = os.path.join(OUTPUT_DIR, video_name)
    create_video(images[idx], audio_path, video_path)

    logging.info("➡️  Video saved to %s", video_path)


if __name__ == "__main__":
    main()
