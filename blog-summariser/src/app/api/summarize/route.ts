import { NextResponse } from "next/server";
import { scrapeTextFromURL } from "@/lib/scraper";
import { summarizeText } from "@/lib/summariser";
import { translateToUrdu, translateTitleToUrdu } from "@/lib/translator";
import { saveToMongo } from "@/lib/db/mongo";
import { saveToSupabase, findExistingSummary } from "@/lib/db/supabase";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

    // Check if URL already exists in Supabase
    const existingSummary = await findExistingSummary(url);
    
    // If we found an existing summary, return it without reprocessing
    if (existingSummary) {
      console.log("Found existing summary for URL:", url);
      return NextResponse.json({
        summary: existingSummary.summary,
        translated: existingSummary.translated,
        title: existingSummary.title,
        urduTitle: existingSummary.urdu_title,
        dbStatus: {
          supabase: { success: true, cached: true },
          mongodb: { success: true, cached: true }
        }
      });
    }

    // URL not found in database, proceed with scraping and processing
    console.log("Processing new URL:", url);
    const fullText = await scrapeTextFromURL(url);
    const { summary, title } = await summarizeText(fullText);
    
    // Get Urdu translation using AI
    const translated = await translateToUrdu(summary);
    const urduTitle = await translateTitleToUrdu(title);

    // Database status tracking
    const dbStatus = {
      supabase: { success: false, error: null as string | null },
      mongodb: { success: false, error: null as string | null }
    };

    // Try Supabase
    try {
      await saveToSupabase({ url, summary, translated, title, urduTitle });
      dbStatus.supabase.success = true;
    } catch (error: unknown) {
      dbStatus.supabase.error = error instanceof Error ? error.message : String(error);
      console.error("Supabase error:", dbStatus.supabase.error);
    }

    // Try MongoDB
    try {
      await saveToMongo({ url, fullText, title, urduTitle });
      dbStatus.mongodb.success = true;
    } catch (error: unknown) {
      dbStatus.mongodb.error = error instanceof Error ? error.message : String(error);
      console.error("MongoDB error:", dbStatus.mongodb.error);
    }

    // Return the summary along with database status
    return NextResponse.json({
      summary,
      translated,
      title,
      urduTitle,
      dbStatus
    });
  } catch (err: unknown) {
    console.error("API error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}