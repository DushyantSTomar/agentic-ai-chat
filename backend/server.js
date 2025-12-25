import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import { ChatOpenAI } from "@langchain/openai";
import {
  RunnableSequence,
  RunnableWithMessageHistory,
} from "@langchain/core/runnables";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { MongoChatHistory } from "./memory/mongoChatHistory.js";

const app = express();
app.use(cors());
app.use(express.json());

/* Mongo */
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const collection = client.db("langchain").collection("chat_memory");

/* LLM */
const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4.1-mini",
});

/* Prompt */
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful AI assistant"],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const chain = RunnableSequence.from([prompt, llm]);

const runnable = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: async (sessionId) =>
    new MongoChatHistory(collection, sessionId),
  inputMessagesKey: "input",
  historyMessagesKey: "history",
});

app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res
        .status(400)
        .json({ error: "message & sessionId required" });
    }

    // IMAGE REQUEST
    if (
      message.toLowerCase().startsWith("generate image") ||
      message.toLowerCase().startsWith("draw")
    ) {
      const prompt = message
        .replace(/generate image/i, "")
        .replace(/draw/i, "")
        .trim();

      try {
        const imageUrl = await generateImage(prompt);

        return res.json({
          type: "image",
          reply: imageUrl,
        });
      } catch (err) {
        console.error("Image error:", err.message);

        return res.json({
          type: "text",
          reply: "⚠️ Image generation is currently unavailable.",
        });
      }
    }

    // TEXT CHAT (LangChain + Memory)
    const response = await runnable.invoke(
      { input: message },
      { configurable: { sessionId } }
    );

    return res.json({
      type: "text",
      reply: response.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);
