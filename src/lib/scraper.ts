// src/lib/scraper.ts
import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeTextFromURL(url: string): Promise<string> {
  // Pretend to be a real browser
  const response = await axios.get(url, {
    headers: {
      // Modern browser UA string
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/115.0.0.0 Safari/537.36",
      // Accept HTML only
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      // Some sites check Referer
      Referer: url,
    },
    // Make sure we don’t reject non-2xx status codes immediately
    validateStatus: (status) => status < 500,
  });

  if (response.status === 403) {
    throw new Error("Medium is blocking our request (got 403).");
  }
  if (response.status !== 200) {
    throw new Error(`Unexpected status ${response.status}`);
  }

  const $ = cheerio.load(response.data);

  // Pull text from <article> and <p>
  let text = "";
  $("article, p").each((_, el) => {
    text += $(el).text().trim() + " ";
  });

  return text.trim();
}
