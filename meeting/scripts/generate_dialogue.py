#!/usr/bin/env python3
"""Generate dialogue audio for meeting recap video using ElevenLabs TTS."""

import os
import sys
import re
import tempfile
import subprocess
from pathlib import Path

import requests
from dotenv import load_dotenv

# ── Configuration ──────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / ".env")

API_KEY = os.environ.get("ELEVENLABS_API_KEY")
if not API_KEY:
    print("ERROR: ELEVENLABS_API_KEY not found in .env")
    sys.exit(1)

AUDIO_DIR = BASE_DIR / "audio"
AUDIO_DIR.mkdir(exist_ok=True)

# Voice IDs (from ElevenLabs)
VOICES = {
    "Alex": "CwhRBWXzGAHq8TQ4Fs17",    # Roger — male, laid-back, resonant
    "Jordan": "FGY2WhTYpPnrIDTdsKH5",   # Laura — female, energetic, quirky
}

MODEL_ID = "eleven_multilingual_v2"
TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
SILENCE_MS = 350  # silence between turns

# ── Dialogue Scripts ───────────────────────────────────────────────────────────
SECTIONS = [
    {
        "name": "01-intro",
        "dialogue": [
            ("Alex", "Hey everyone, welcome back! Today we're breaking down a really "
                     "important team meeting — the AEM team's mission and goals session "
                     "from February second, twenty twenty-six, led by Paolo Mottadelli."),
            ("Jordan", "And this wasn't just any meeting! This was basically the team's "
                       "big moment to redefine who they are and where they're headed."),
            ("Alex", "Exactly. Paolo laid out four key pillars: an accelerator model, "
                     "a new customer journey framework, a fresh value measurement system, "
                     "and — this is the exciting part — an AI-first way of working."),
            ("Jordan", "Plus, Nicole Glauser made it clear — nothing's set in stone yet. "
                       "This is an open invitation for the whole team to shape the vision together."),
            ("Alex", "That's what makes it special. Let's dive into the details."),
        ],
    },
    {
        "name": "02-customer-journey",
        "dialogue": [
            ("Alex", "So Paolo started with this really compelling visual — the engineered "
                     "customer journey. Think of the customer lifecycle as a continuous loop, "
                     "not a funnel."),
            ("Jordan", "Right, pre-sales in blue, post-sales in green, and it just keeps "
                       "cycling through renewal, upsell, and expansion."),
            ("Alex", "And here's the key insight — there are two lines on the chart. "
                     "The orange line is the status quo, and the blue line is what he "
                     "calls the engineered path."),
            ("Jordan", "The gap between them is the opportunity! That's where the team comes in."),
            ("Alex", "Exactly. They identified three specific intervention areas. First, "
                     "intelligent value discovery — reaching the right customer at the "
                     "right time. Second, personalisation — showing outcome-specific value, "
                     "like Digital Insights does. And third, reducing migration barriers."),
            ("Jordan", "That last one is huge. Enterprise migration complexity is the "
                       "biggest blocker for adoption."),
            ("Alex", "And any percentage you reduce it, the business grows. Simple as that."),
        ],
    },
    {
        "name": "03-mission-statement",
        "dialogue": [
            ("Alex", "Alright, let's talk about the mission statement itself. And I have "
                     "to say, it's really well crafted."),
            ("Jordan", "Hit me with it!"),
            ("Alex", "Accelerate AEM growth and adoption by deeply engaging with customers "
                     "to discover, validate, and scale the accelerators that drive their success."),
            ("Jordan", "There's a lot packed in there. Discover, validate, scale — "
                       "that's a whole lifecycle."),
            ("Alex", "And the methodology is just as important — rapid experimentation, "
                     "close customer partnership, identifying AI-driven capabilities and "
                     "modernization pathways that unlock real value."),
            ("Jordan", "I love the five keywords Paolo highlighted. Rapid experimentation, "
                       "customer partnership, AI-driven, modernization, and real value."),
            ("Alex", "The outcome vision is turning engineering breakthroughs into "
                     "repeatable growth engines for the broader AEM ecosystem."),
            ("Jordan", "So it's not just one-off wins. It's about building systems "
                       "that keep delivering. That's powerful."),
        ],
    },
    {
        "name": "04-accelerator-model",
        "dialogue": [
            ("Alex", "Now here's where it gets really practical. Paolo introduced "
                     "the concept of accelerators."),
            ("Jordan", "What exactly counts as an accelerator?"),
            ("Alex", "Anything that raises the value line at any customer journey stage. "
                     "A better demo, a migration tool, a new insight — if it moves the "
                     "needle, it's an accelerator."),
            ("Jordan", "And they have a clear lifecycle, right?"),
            ("Alex", "Four stages — experiment, customer use, validated, and made to "
                     "product. Mapped across acquisition, adoption, and expansion."),
            ("Jordan", "The Skoda story was my favorite! Experience Catalyst imported "
                       "two hundred pages, and the decision maker who'd been resisting "
                       "EDS completely flipped."),
            ("Alex", "Ha, he literally said let's go with EDS after seeing the POC. "
                     "That's the power of a good accelerator."),
            ("Jordan", "And the operating model is lean — five to seven customer "
                       "engagements in parallel, just one or two people each. Small bets, "
                       "fast cycles. All inspired by the pancake chart methodology."),
        ],
    },
    {
        "name": "05-measuring-success",
        "dialogue": [
            ("Alex", "This next part is a real mindset shift. Paolo introduced the "
                     "six-plus-one value framework."),
            ("Jordan", "Six plus one? What are the six?"),
            ("Alex", "Perceived value, contractual value — that's Adobe revenue — "
                     "top-line value for the customer, G-A usage, bottom-line value "
                     "meaning cost savings, and post-G-A usage. Plus one more dimension."),
            ("Jordan", "But here's what really stood out to me — the team doesn't "
                       "chase dollar targets."),
            ("Alex", "That's the big insight. Success for this team is measured by "
                     "usage. Period. Not direct revenue."),
            ("Jordan", "As Paolo said — we don't talk about sales, we talk about usage."),
            ("Alex", "And the KPIs are concrete. Pages imported with Experience Catalyst. "
                     "Deals instrumented with Digital Insights. Deals reporting actual impact. "
                     "Customer production deployments."),
            ("Jordan", "So it's all about — did someone actually use this? Did it go "
                       "to production?"),
            ("Alex", "Exactly. At the product level, sure, Adobe communicates value in "
                     "dollars. But for this team, usage is the north star."),
        ],
    },
    {
        "name": "06-ai-first",
        "dialogue": [
            ("Alex", "Alright, this last section is where things get really fired up. "
                     "The AI-first mandate."),
            ("Jordan", "And this isn't just about building AI for customers — it's about "
                       "transforming how the team itself operates."),
            ("Alex", "Paolo's goal is bold — deliver ten X by working zero point five X. "
                     "Not harder, smarter."),
            ("Jordan", "Karl Pauls backed this up with real examples. Cloud Co-Work "
                       "went from idea to release in two weeks — built entirely with "
                       "Claude Code."),
            ("Alex", "The Experience Catalyst pivot? First prototype in three to four "
                     "days, real users within a week."),
            ("Jordan", "That's the speed Karl was talking about. Execution velocity "
                       "is completely different now."),
            ("Alex", "The workshop next week will be eighty to ninety percent hands-on "
                     "AI adoption. Vibe coding, AI-assisted planning, the works."),
            ("Jordan", "Nicole's closing words say it all — Nothing is set in stone yet. "
                       "This is an invite to all of you to help us shape and create."),
            ("Alex", "The future's being built together. And it starts now."),
        ],
    },
]


# ── TTS Generation ─────────────────────────────────────────────────────────────
def generate_speech(text: str, voice_id: str, output_path: Path) -> None:
    """Call ElevenLabs TTS and save audio to output_path."""
    clean_text = re.sub(r"\[.*?\]\s*", "", text)

    resp = requests.post(
        TTS_URL.format(voice_id=voice_id),
        headers={
            "xi-api-key": API_KEY,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        json={
            "text": clean_text,
            "model_id": MODEL_ID,
            "voice_settings": {
                "stability": 0.50,
                "similarity_boost": 0.75,
                "style": 0.30,
            },
        },
        timeout=60,
    )
    resp.raise_for_status()
    output_path.write_bytes(resp.content)
    print(f"    Generated: {output_path.name} ({len(resp.content) / 1024:.1f} KB)")


def generate_silence(path: Path, duration_ms: int) -> None:
    """Generate a silent MP3 of given duration."""
    subprocess.run(
        [
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", f"anullsrc=r=44100:cl=stereo",
            "-t", str(duration_ms / 1000),
            "-c:a", "libmp3lame", "-q:a", "2",
            str(path),
        ],
        capture_output=True,
        check=True,
    )


def concatenate_audio(parts: list, silence_path: Path, output: Path) -> None:
    """Concatenate audio files with silence gaps using ffmpeg concat demuxer."""
    list_path = output.parent / f"_concat_{output.stem}.txt"
    with open(list_path, "w") as f:
        for i, part in enumerate(parts):
            f.write(f"file '{part}'\n")
            if i < len(parts) - 1:
                f.write(f"file '{silence_path}'\n")

    subprocess.run(
        [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", str(list_path),
            "-ar", "44100", "-ac", "2",
            "-c:a", "libmp3lame", "-q:a", "2",
            str(output),
        ],
        capture_output=True,
        check=True,
    )
    list_path.unlink(missing_ok=True)


def get_duration(audio_path: Path) -> float:
    """Get audio duration in seconds using ffprobe."""
    result = subprocess.run(
        [
            "ffprobe", "-v", "quiet",
            "-show_entries", "format=duration",
            "-of", "csv=p=0",
            str(audio_path),
        ],
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip()) if result.stdout.strip() else 0.0


def main():
    print("=" * 60)
    print("  ElevenLabs Dialogue Generator")
    print("=" * 60)

    # Pre-generate a silence clip for reuse
    silence_path = AUDIO_DIR / "_silence.mp3"
    generate_silence(silence_path, SILENCE_MS)

    total_duration = 0.0

    for section in SECTIONS:
        name = section["name"]
        dialogue = section["dialogue"]
        output_path = AUDIO_DIR / f"{name}.mp3"

        print(f"\n  Section: {name}")
        print(f"  {'─' * 40}")

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            parts = []

            for i, (speaker, text) in enumerate(dialogue):
                voice_id = VOICES[speaker]
                part_path = tmp / f"{i:02d}-{speaker.lower()}.mp3"
                generate_speech(text, voice_id, part_path)
                parts.append(part_path)

            # Concatenate all turns with silence between them
            concatenate_audio(parts, silence_path, output_path)

        duration = get_duration(output_path)
        total_duration += duration
        print(f"    Output: {output_path.name} ({duration:.1f}s)")

    # Cleanup
    silence_path.unlink(missing_ok=True)

    print(f"\n{'=' * 60}")
    print(f"  All done! Total audio duration: {total_duration:.1f}s")
    print(f"  Files in: {AUDIO_DIR}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
