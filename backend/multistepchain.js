import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnableMap } from "@langchain/core/runnables";

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4.1-mini",
});

// STEP 1
const cleanPrompt = new PromptTemplate({
  template: "Fix spelling and clean this text: {text}",
  inputVariables: ["text"],
});

// STEP 2
const detectPrompt = new PromptTemplate({
  template: "What language is this? Return only the language name: {clean_text}",
  inputVariables: ["clean_text"],
});

// STEP 3
const simplifyPrompt = new PromptTemplate({
  template: "Convert this into a simple beginner question: {clean_text}",
  inputVariables: ["clean_text"],
});

// STEP 4
const finalPrompt = new PromptTemplate({
  template: `Answer this question helpfully in {language}:\n\n{simple_question}`,
  inputVariables: ["language", "simple_question"],
});

// FULL CHAIN
const chain = RunnableSequence.from([
  
  // 1) CLEAN input first
  RunnableMap.from({
    clean_text: cleanPrompt,
  }),

  // 2) LANGUAGE + SIMPLE QUESTION depend on cleaned text
  RunnableMap.from({
    clean_text: (i) => i.clean_text,
    language: detectPrompt,
    simple_question: simplifyPrompt,
  }),

  // 3) FINAL ANSWER
  async (input) => {
    return finalPrompt.invoke({
      language: input.language,
      simple_question: input.simple_question,
    });
  },

  llm,
]);

async function main() {
  const input = {
    text: "whatt iss daifference betwen varr let and const?",
  };

  const result = await chain.invoke(input);

  console.log("\n🟢 FINAL AI ANSWER:");
  console.log(result.content);
}

main();
