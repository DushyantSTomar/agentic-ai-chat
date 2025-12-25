// 🧠 STEP 1 — IMPORTS
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";


// 🧠 STEP 2 — MODEL
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 STEP 3 — MEMORY CREATE KARO
const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "history",
});


// 🧠 STEP 4 — PROMPT
const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful assistant.
Conversation so far:
{history}

User: {input}
Assistant:
`);


// 🧠 STEP 5 — FINAL MEMORY CHAIN
const memoryChain = new ConversationChain({
  llm: model,
  memory: memory,
  prompt: prompt,
});


// 🧠 STEP 6 — USE CHAIN MULTIPLE TIMES
let r1 = await memoryChain.call({ input: "Hi, my name is Dushyant." });
console.log("1:", r1.response);

let r2 = await memoryChain.call({ input: "What is my name?" });
console.log("2:", r2.response);

let r3 = await memoryChain.call({ input: "Remember I like React Native." });
console.log("3:", r3.response);

let r4 = await memoryChain.call({ input: "What do I like?" });
console.log("4:", r4.response);
