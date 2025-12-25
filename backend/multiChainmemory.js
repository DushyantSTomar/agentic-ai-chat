import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";

// STEP 1: CLEAN TEXT
const cleanPrompt = PromptTemplate.fromTemplate(`
Clean and correct the spelling of this text:
{text}
`);

const cleanChain = RunnableSequence.from([
  cleanPrompt,
  new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY,model: "gpt-4o-mini", temperature: 0 }),
]);

// STEP 2: DETECT LANGUAGE
const langPrompt = PromptTemplate.fromTemplate(`
Return ONLY the language name of this text:
{clean_text}
`);

const langChain = RunnableSequence.from([
  langPrompt,
  new ChatOpenAI({apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o-mini", temperature: 0 }),
]);

// STEP 3: FINAL RESPONSE
const finalPrompt = PromptTemplate.fromTemplate(`
Cleaned Text: {clean_text}
Language: {lang}

Give the final best answer.
`);

const finalChain = RunnableSequence.from([
  {
    clean_text: (i) => cleanChain.invoke({ text: i.text }),
  },
  {
    lang: (i) => langChain.invoke({ clean_text: i.clean_text }),
    clean_text: (i) => i.clean_text,
  },
  finalPrompt,
  new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY,model: "gpt-4o-mini", temperature: 0 }),
]);

// MEMORY USING RunnableWithMessageHistory
const chainWithMemory = new RunnableWithMessageHistory({
  runnable: finalChain,
  getMessageHistory: () => new ChatMessageHistory(),
  inputMessagesKey: "text",
  historyMessagesKey: "history",
});

// RUN NOW
const result = await chainWithMemory.invoke(
  {
    text: "whatt iss daifference betwen varr let and const?",
  },
  { configurable: { sessionId: "user1" } }
);

console.log("🟢 FINAL AI ANSWER:\n", result.content);
