import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4.1-mini",
});

async function main() {
  // 1. Prompt Template
  const prompt = new PromptTemplate({
    template: "Explain {topic} in extremely simple words with a real-life example.",
    inputVariables: ["topic"],
  });

  // 2. Create Chain: Prompt → LLM → Output
  const chain = RunnableSequence.from([
    prompt,
    llm,
  ]);

  // Run chain with input
  const result = await chain.invoke({
    topic: "Promises in JavaScript",
  });

  console.log("\nAI:", result.content);
}

main();
