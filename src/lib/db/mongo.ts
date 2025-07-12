import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
let client: MongoClient | null = null;
const dbName = "blog_summariser";

export async function saveToMongo(data: { 
  url: string; 
  fullText: string; 
  title: string;
  urduTitle: string;
}) {
  try {
    // Create a new client if one doesn't exist
    if (!client) {
      client = new MongoClient(uri);
    }
    
    // Connect to the client
    await client.connect();
    
    const db = client.db(dbName);
    const collection = db.collection("full_texts");

    // Insert the document
    const result = await collection.insertOne({
      url: data.url,
      fullText: data.fullText,
      title: data.title,
      urduTitle: data.urduTitle,
      createdAt: new Date(),
    });
    
    console.log("MongoDB save successful, document ID:", result.insertedId);
    return { success: true, id: result.insertedId };
  } catch (err) {
    console.error("MongoDB save error:", err);
    throw err;
  }
}