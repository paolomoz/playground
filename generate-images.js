import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (parent directory)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("No GEMINI_API_KEY or GOOGLE_API_KEY found in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const IMAGES = [
  {
    name: "hero-banner",
    outputPath: "assets/hero-banner.png",
    prompt: `Epic Olympic ice hockey championship poster art. Two teams facing off at center ice in a massive arena in Milan, Italy. Left side dominated by Canada red with maple leaf motifs, right side dominated by USA navy blue and red with stars. The center ice circle glows with dramatic stadium lighting. Overhead scoreboard reads "CANADA vs USA". Crowd packed in silhouette. Ultra-dramatic low-angle perspective, cinematic lighting, smoke/ice-mist atmosphere. Style: premium sports editorial illustration, bold graphic design, deep shadows, vibrant team colors, Olympic rings subtly visible in background smoke. NO text overlaid. Wide format 1200x400px composition.`,
  },
  {
    name: "canada-badge",
    outputPath: "assets/canada-badge.png",
    prompt: `Dramatic graphic design badge for Canada Olympic ice hockey team. Centered maple leaf in brilliant white on deep red background. Surrounding elements: subtle hockey sticks crossed behind the maple leaf, faint crowd in background, golden Olympic ring accent. Bold, clean, championship feel. Square format, dark red vignette at edges. Style: official sports badge / emblem art, premium print quality. NO text.`,
  },
  {
    name: "usa-badge",
    outputPath: "assets/usa-badge.png",
    prompt: `Dramatic graphic design badge for USA Olympic ice hockey team. Bold stars and stripes motif in navy blue and red on dark background. Central eagle silhouette with wings spread, ice rink reflection below, Olympic rings subtly glowing in background. Championship energy, sharp geometric lines, patriotic but premium. Square format. Style: official sports badge / emblem art, premium print quality. NO text.`,
  },
  {
    name: "og-thumbnail",
    outputPath: "assets/og-thumbnail.png",
    prompt: `Professional sports-meets-tech announcement graphic. Bold split composition: LEFT half in deep Canada red with a white maple leaf and an upward-curving hockey-stick shaped growth line labeled "300 USERS" glowing white. RIGHT half in USA navy blue with stars and an upward-curving hockey-stick shaped growth line labeled "425 REPORTS" glowing gold. CENTER: large bold white text "2026 HOCKEY STICKS" and below it "OLYMPIC FINAL EDITION". Bottom strip: "CANADA vs USA - MILANO - FEB 21, 2026". Style: premium sports editorial design, dramatic stadium lighting atmosphere, cinematic depth. The composition must READ CLEARLY as a thumbnail at small sizes — high contrast, large typography, bold shapes. Landscape format 1200x630px.`,
  },
];

async function generateImage(imageConfig) {
  const { name, outputPath, prompt } = imageConfig;
  console.log(`Generating ${name}...`);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-image-preview",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["image", "text"],
      },
    });

    const response = result.response;
    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates in response");
    }

    const parts = candidates[0].content.parts;
    let imageData = null;

    for (const part of parts) {
      if (part.inlineData) {
        imageData = part.inlineData;
        break;
      }
    }

    if (!imageData) {
      throw new Error("No image data in response parts");
    }

    const outputDir = path.dirname(path.resolve(__dirname, outputPath));
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const buffer = Buffer.from(imageData.data, "base64");
    fs.writeFileSync(path.resolve(__dirname, outputPath), buffer);
    console.log(`  Saved ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return true;
  } catch (error) {
    console.error(`  FAILED ${name}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("Hockey Poster — AI Image Generation");
  console.log("====================================\n");

  const results = [];
  // Generate sequentially to avoid rate limits
  for (const img of IMAGES) {
    const success = await generateImage(img);
    results.push({ name: img.name, success });
  }

  console.log("\n--- Results ---");
  for (const r of results) {
    console.log(`  ${r.success ? "OK" : "FAIL"}  ${r.name}`);
  }

  const failed = results.filter((r) => !r.success).length;
  if (failed > 0) {
    console.log(`\n${failed} image(s) failed. The poster will use CSS gradient fallbacks.`);
  } else {
    console.log("\nAll images generated successfully.");
  }
}

main();
