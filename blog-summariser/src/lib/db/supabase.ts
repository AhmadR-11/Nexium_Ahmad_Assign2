import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function saveToSupabase(data: {
  url: string;
  summary: string;
  translated: string;
  title: string;
  urduTitle: string;
}) {
  try {
    // Enable RLS bypass for this operation
    const { error } = await supabase
      .from("summaries")
      .insert([
        {
          url: data.url,
          summary: data.summary,
          translated: data.translated,
          title: data.title,
          urdu_title: data.urduTitle,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error details:", error);
      throw new Error("Failed to save summary to Supabase: " + error.message);
    }
    
    return { success: true };
  } catch (err) {
    console.error("Supabase save error:", err);
    throw err;
  }
}

export async function findExistingSummary(url: string) {
  try {
    const { data, error } = await supabase
      .from("summaries")
      .select("summary, translated, title, urdu_title")
      .eq("url", url)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error("Supabase query error:", error);
      throw new Error("Failed to query Supabase: " + error.message);
    }
    
    return data || null;
  } catch (err) {
    console.error("Supabase query error:", err);
    return null;
  }
}