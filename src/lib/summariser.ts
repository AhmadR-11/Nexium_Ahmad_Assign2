import axios from 'axios';

/**
 * Text summarization utility that uses both extractive and AI-based methods
 */
export async function summarizeText(fullText: string, sentenceCount = 6): Promise<{summary: string, title: string}> {
  try {
    // Try AI-based summarization first
    const { summary: aiSummary, title } = await generateAISummary(fullText, sentenceCount);
    return { summary: aiSummary, title };
  } catch (error) {
    console.error("AI summarization failed, falling back to extractive method:", error);
    // Fallback to extractive summarization if AI fails
    const extractiveSummary = extractiveSummarize(fullText, sentenceCount);
    const title = generateExtractiveTitle(fullText);
    return { summary: extractiveSummary, title };
  }
}

/**
 * Calls the Gemini API to generate an AI-powered summary and title
 */
async function generateAISummary(text: string, sentenceCount: number): Promise<{summary: string, title: string}> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables");
  }

  // Try with a more stable model version
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  
  try {
    // Add timeout and retry logic
    const response = await axios.post(
      `${url}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `For the following text, provide: 
                1. A concise title (max 10 words)
                2. A summary in ${sentenceCount} sentences, keeping the most important information
                
                Format your response as:
                TITLE: [your title here]
                SUMMARY: [your summary here]
                
                Text to summarize:
                ${text}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    // Extract the summary from the response
    const generatedText = response.data.candidates[0]?.content?.parts[0]?.text;
    
    if (!generatedText) {
      throw new Error("No summary was generated by the API");
    }
    
    // Parse title and summary from response
    const titleMatch = generatedText.match(/TITLE:\s*(.*?)(?:\n|$)/i);
    const summaryMatch = generatedText.match(/SUMMARY:\s*([\s\S]*?)(?:\n\n|$)/i);
    
    const title = titleMatch?.[1]?.trim() || generateExtractiveTitle(text);
    const summary = summaryMatch?.[1]?.trim() || generatedText.trim();
    
    return { summary, title };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // If we get a 503 error, wait and retry once with a different model
    if (axios.isAxiosError(error) && error.response?.status === 503) {
      try {
        console.log("Retrying after 503 error...");
        // Wait 2 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try with a different model as fallback
        const fallbackUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
        
        const retryResponse = await axios.post(
          `${fallbackUrl}?key=${apiKey}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `For the following text, provide: 
                    1. A concise title (max 10 words)
                    2. A summary in ${sentenceCount} sentences, keeping the most important information
                    
                    Format your response as:
                    TITLE: [your title here]
                    SUMMARY: [your summary here]
                    
                    Text to summarize:
                    ${text}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 800,
            }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 15000 // Longer timeout for retry
          }
        );
        
        const generatedText = retryResponse.data.candidates[0]?.content?.parts[0]?.text;
        
        if (!generatedText) {
          throw new Error("No summary was generated by the API on retry");
        }
        
        // Parse title and summary from response
        const titleMatch = generatedText.match(/TITLE:\s*(.*?)(?:\n|$)/i);
        const summaryMatch = generatedText.match(/SUMMARY:\s*([\s\S]*?)(?:\n\n|$)/i);
        
        const title = titleMatch?.[1]?.trim() || generateExtractiveTitle(text);
        const summary = summaryMatch?.[1]?.trim() || generatedText.trim();
        
        return { summary, title };
      } catch (retryError) {
        console.error("Retry also failed:", retryError);
        throw retryError; // Propagate the error to trigger the fallback
      }
    }
    
    throw error;
  }
}

/**
 * Extractive summarization algorithm that selects important sentences
 * based on length, position, and keyword frequency.
 */
function extractiveSummarize(fullText: string, sentenceCount = 6): string {
  // Clean and split the text into sentences
  const sentences = fullText
    .replace(/\n/g, " ")
    .split(/(?<=[.?!])\s+/)
    .filter((s) => s.length > 20);
  
  if (sentences.length <= sentenceCount) {
    return sentences.join(" ");
  }

  // Calculate sentence scores based on position and length
  const scores = sentences.map((sentence, index) => {
    // Position score - earlier sentences are often more important
    const positionScore = 1 - (index / sentences.length);
    
    // Length score - favor medium-length sentences
    const lengthScore = Math.min(sentence.length / 100, 1);
    
    // Word count score - sentences with more words often contain more information
    const wordCount = sentence.split(/\s+/).length;
    const wordCountScore = Math.min(wordCount / 20, 1);
    
    // Combined score
    return {
      index,
      sentence,
      score: (positionScore * 0.6) + (lengthScore * 0.2) + (wordCountScore * 0.2)
    };
  });
  
  // Sort by score and take top sentences
  const topSentences = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount)
    .sort((a, b) => a.index - b.index) // Restore original order
    .map(item => item.sentence);
  
  return topSentences.join(" ");
}

/**
 * Generates a simple title based on the first sentence or key phrases
 */
function generateExtractiveTitle(text: string): string {
  // Get the first sentence
  const firstSentence = text.split(/[.!?]/, 1)[0].trim();
  
  // If it's short enough, use it as the title
  if (firstSentence.length <= 60) {
    return firstSentence;
  }
  
  // Otherwise, extract key words from the beginning
  const words = firstSentence.split(/\s+/).slice(0, 8);
  return words.join(' ') + '...';
}