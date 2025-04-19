import os
import requests
import json
import base64
import subprocess
import time
from openai import AzureOpenAI, OpenAI
import google.generativeai as genai
from elevenlabs.client import ElevenLabs
from elevenlabs import save
from dotenv import load_dotenv

load_dotenv()

# Environment variables for API keys
XAI_API_KEY = os.getenv("XAI_API_KEY")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize clients
xai_client = OpenAI(base_url="https://api.x.ai/v1", api_key=XAI_API_KEY)
azure_client = AzureOpenAI(
    api_key=AZURE_OPENAI_API_KEY,
    api_version="2023-05-15",
    azure_endpoint=AZURE_OPENAI_ENDPOINT
)
genai.configure(api_key=GOOGLE_API_KEY)
eleven = ElevenLabs(api_key=ELEVENLABS_API_KEY)


def generate_brainrot_ideas():
    """Generate Italian brainrot ideas using GPT-4.1"""
    prompt = f"""
Italian brainrot is a moden trend on social media where there are featured characters which are combinations of animals with objects. An example of this is bombardino crocadilo, an airplane combined with a crocodile, and brr brr patapim, a baboon combined with a tree.

Examples of it (image + audio description)

Generate an italian brainrot by giving me a description of an image ill feed into an image generation model, and the audio (which should be very short), which will be fed into an audio generation model.
"""
    
    response = azure_client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)

def generate_image(prompt):
    """Generate an image using XAI's API"""
    try:
        print(f"Generating image with prompt: {prompt}")
        response = xai_client.images.generate(
            model="grok-2-image",
            prompt=f"Italian brainrot meme: {prompt}"
        )
        
        image_url = response.data[0].url
        image_content = requests.get(image_url).content
        
        return image_content
    except Exception as e:
        print(f"Error generating image: {e}")
        return None

def generate_audio(description):
    """Generate audio using ElevenLabs SDK"""
    print(f"Generating audio with description: {description}")
    # Use the ElevenLabs SDK's generate function
    audio = eleven.text_to_speech.convert(
        text=description,
        voice_id="k03ys8IwB1YU6R28L1x8",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
    )
    return audio

def describe_audio_with_gemini(audio_path):
    """Use Gemini 2.5 Flash to describe the audio content"""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        with open(audio_path, "rb") as f:
            audio_bytes = f.read()
        
        audio_part = {"mime_type": "audio/mp3", "data": base64.b64encode(audio_bytes).decode()}
        
        prompt = "Describe in detail what you hear in this Italian brainrot audio clip. What sounds, music, or speech do you recognize? Are there any artifacts?"
        
        print(f"Getting Gemini to describe audio: {audio_path}")
        response = model.generate_content([prompt, audio_part])
        return response.text
    except Exception as e:
        print(f"Error describing audio with Gemini: {e}")
        return "Failed to describe audio"

def choose_best_combination(image_paths, audio_descriptions, idea_name):
    """Use GPT-4.1 to choose the best image and audio combination"""
    prompt = f"""I have generated 5 images and 5 audio clips for an Italian brainrot meme with the idea: {idea_name}.

The images are as follows (numbered 1-5):
"""
    
    for i, path in enumerate(image_paths, 1):
        prompt += f"{i}. Image {i}\n"
    
    prompt += "\nThe audio clips are described by Gemini as follows:\n"
    
    for i, desc in enumerate(audio_descriptions, 1):
        prompt += f"{i}. {desc}\n"
    
    prompt += """\nBased on these descriptions, which image and audio combination would make the most effective and humorous Italian brainrot meme?

Respond in JSON format like this:
{
  "reasoning": "Explanation of why this combination works best",
  "chosen_image": 1,  // number from 1-5
  "chosen_audio": 1   // number from 1-5
}
"""
    
    response = azure_client.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)

def create_video(image_path, audio_path, output_path):
    """Create a video from a static image and audio using ffmpeg"""
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-i", image_path,
        "-i", audio_path,
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        output_path
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"Video created successfully: {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error creating video: {e}")
        return False

def main():
    """Main function to generate Italian brainrot videos"""
    print("🍝 Italian Brainrot Generator 🍕")
    print("-------------------------------")
    
    # Create output directory
    output_dir = "italian_brainrot_output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate idea
    print("Generating Italian brainrot idea...")
    idea_data = generate_brainrot_ideas()
    
    idea_name = idea_data["idea_name"]
    image_descriptions = idea_data["image_descriptions"]
    audio_descriptions = idea_data["audio_descriptions"]
    
    print(f"\nGenerated idea: {idea_name}")
    
    # Generate images
    image_paths = []
    for i, desc in enumerate(image_descriptions, 1):
        print(f"\nGenerating image {i}/5...")
        image_content = generate_image(desc)
        
        if image_content:
            image_path = os.path.join(output_dir, f"image_{i}.jpg")
            with open(image_path, "wb") as f:
                f.write(image_content)
            image_paths.append(image_path)
            print(f"Image saved to {image_path}")
        
    # Generate audio
    audio_paths = []
    audio_descriptions_by_gemini = []
    
    for i, desc in enumerate(audio_descriptions, 1):
        print(f"\nGenerating audio {i}/5...")
        audio = generate_audio(desc)
        audio_path = os.path.join(output_dir, f"audio_{i}.mp3")
        save(audio, audio_path)
        
        print(f"Audio saved to {audio_path}")
        gemini_desc = describe_audio_with_gemini(audio_path)
        audio_descriptions_by_gemini.append(gemini_desc)
        print(f"Gemini description: {gemini_desc[:100]}...")
        
    # Choose best combination
    print("\nChoosing best image and audio combination...")
    choice = choose_best_combination(image_paths, audio_descriptions_by_gemini, idea_name)
    
    # Convert to 0-based index
    chosen_image_idx = int(choice["chosen_image"]) - 1
    chosen_audio_idx = int(choice["chosen_audio"]) - 1
    
    print(f"Selected image {choice['chosen_image']} and audio {choice['chosen_audio']}")
    print(f"Reasoning: {choice['reasoning']}")
    
    # Create final video
    video_path = os.path.join(output_dir, f"{idea_name.replace(' ', '_')}_final.mp4")
    create_video(
        image_paths[chosen_image_idx], 
        audio_paths[chosen_audio_idx],
        video_path
    )
    
    print(f"\n✅ Italian brainrot video created: {video_path}")

if __name__ == "__main__":
    main()