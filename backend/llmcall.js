import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4.1-mini",
});

async function main() {
    const res = await llm.invoke("what is react");
    console.log(res.content);
}

main();
