import type { NextApiRequest, NextApiResponse } from "next"
import { ChatVectorDBQAChain } from "langchain/chains"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { OpenAI } from "langchain/llms"
import { PineconeStore } from "langchain/vectorstores"

import { createPineconeIndex } from "@/lib/pinecone"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { question, chatHistory} = req.body

  try {
    const index = await createPineconeIndex({
      pineconeApiKey: process.env.pinecone_api_key ?? "",
      pineconeEnvironment: process.env.pinecone_environment,
      pineconeIndexName: process.env.pinecone_index ?? "",
    })

    const vectorStore = await PineconeStore.fromExistingIndex(
      index,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      })
    )

    const model = new OpenAI({
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    const chain = ChatVectorDBQAChain.fromLLM(model, vectorStore)
    const response = await chain.call({
      question,
      max_tokens: 500, // todo: pick up a sensible value
      chat_history: chatHistory || [],
    })

    res.status(200).json(response)
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Unknown error." })
  }
}
