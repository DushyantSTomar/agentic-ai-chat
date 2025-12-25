// import "dotenv/config";
// import { MongoClient } from "mongodb";
// import { ChatOpenAI } from "@langchain/openai";
// import { PromptTemplate } from "@langchain/core/prompts";
// import {
//   RunnableWithMessageHistory,
// } from "@langchain/core/runnables";
// import { MongoDBChatMessageHistory } from "@langchain/community/stores/message/mongodb";

// // ------- DB Setup --------
// const client = new MongoClient(process.env.MONGO_URL);
// await client.connect();
// const collection = client.db("langchain").collection("messages");

// // ------- LLM Setup -------
// const llm = new ChatOpenAI({
//   model: "gpt-4o-mini",
//   temperature: 0.3,
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // ------- Prompt Setup -------
// const prompt = PromptTemplate.fromTemplate(`
// Conversation between AI and User.
// History:
// {history}
// User: {input}
// AI:`);

// // ------- Chain Setup -------
// const chain = prompt.pipe(llm);

// // ------- Memory Wrapper -------
// const runnable = new RunnableWithMessageHistory({
//   runnable: chain,
//   getMessageHistory: async (sessionId) => {
//     return new MongoDBChatMessageHistory({
//       collection,
//       sessionId,
//     });
//   },
//   inputMessagesKey: "input",
//   historyMessagesKey: "history",
// });

// // ------- Run Chat -------
// const response = await runnable.invoke(
//   { input: "Hello AI, how are you?" },
//   { configurable: { sessionId: "user123" } }
// );

// console.log("AI:", response);

// /*
// Run again:
// It will load messages from MongoDB
// */
// // const response2 = await runnable.invoke(
// //   { input: "What did I say earlier?" },
// //   { configurable: { sessionId: "user123" } }
// // );

// // console.log("AI:", response2);
import "dotenv/config";
import { MongoClient } from "mongodb";
import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence, RunnableWithMessageHistory } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { MongoChatHistory } from "./mongoChatHistory.js";

// Mongo setup
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();

const db = client.db("langchain");
const collection = db.collection("chat_memory");

// LLM
const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4.1-mini",
});

// Prompt
const prompt = new PromptTemplate({
  template: `Conversation so far:
{history}

Human: {input}
AI:`,
  inputVariables: ["history", "input"],
});

const chain = RunnableSequence.from([prompt, llm]);

// Runnable with memory
const runnable = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: async (sessionId) =>
    new MongoChatHistory(collection, sessionId),
  inputMessagesKey: "input",
  historyMessagesKey: "history",
});

// Run
// const res = await runnable.invoke(
//   { input: "What is typescript" },
//   { configurable: { sessionId: "user-123" } }
// );

// console.log(res.content);
const response2 = await runnable.invoke(
    { input: "What did I say earlier?" },
     { configurable: { sessionId: "user-123" } }
   );
  
   console.log("AI:", response2.content);
