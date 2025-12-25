import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4.1-mini",
});

async function main() {
  // Step 2: Create a prompt template
  const template = new PromptTemplate({
    inputVariables: ["topic"],
    template: "Explain {topic} in simple words with a real-life example.",
  });

  // Fill the template with user input
  const finalPrompt = await template.format({
    topic: "JavaScript Closures",
  });

  // LLM call
  const response = await llm.invoke(finalPrompt);

  console.log("AI:", response.content);
}

main();