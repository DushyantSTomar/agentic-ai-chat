import { BaseChatMessageHistory } from "@langchain/core/chat_history";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

export class MongoChatHistory extends BaseChatMessageHistory {
  constructor(collection, sessionId) {
    super();
    this.collection = collection;
    this.sessionId = sessionId;
  }

  async getMessages() {
    const docs = await this.collection
      .find({ sessionId: this.sessionId })
      .sort({ createdAt: 1 })
      .toArray();

    return docs.map((msg) =>
      msg.role === "human"
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );
  }

  async addMessage(message) {
    await this.collection.insertOne({
      sessionId: this.sessionId,
      role: message._getType(),
      content: message.content,
      createdAt: new Date(),
    });
  }

  async clear() {
    await this.collection.deleteMany({ sessionId: this.sessionId });
  }
}
