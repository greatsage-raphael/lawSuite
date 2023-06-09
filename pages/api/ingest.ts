import type { NextApiRequest, NextApiResponse, PageConfig } from "next"
import formidable from "formidable"
import { Document } from "langchain/document"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { PineconeStore } from "langchain/vectorstores"
import { Writable } from 'stream'
import { fileConsumer, formidablePromise } from "@/lib/formidable"
import { getTextContentFromPDF } from "@/lib/pdf"
import { createPineconeIndex } from "@/lib/pinecone"
import { chunk } from "@/lib/utils"

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10_000_000,
  maxFieldsSize: 10_000_000,
  maxFields: 7,
  allowEmptyFiles: false,
  multiples: true,
}

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const endBuffers: {
    [filename: string]: Buffer
  } = {}

  const { files } = await formidablePromise(req, {
    ...formidableConfig,
    // consume this, otherwise formidable tries to save the file to disk
     // @ts-ignore
    fileWriteStreamHandler: (file: any): Writable => fileConsumer(file, endBuffers),
  })

  const openaiApiKey = process.env.OPENAI_API_KEY ?? ""
  const pineconeEnvironment = process.env.pinecone_environment ?? ""
  const pineconeIndex = process.env.pinecone_index ?? ""
  const pineconeApiKey = process.env.pinecone_api_key ?? ""

  const docs = await Promise.all(
     // @ts-ignore
    Object.values(files).map(async (fileObj: formidable.File) => {
      let fileText = ""
      const fileData = endBuffers[fileObj.newFilename]
      switch (fileObj.mimetype) {
        case "text/plain":
          fileText = fileData.toString()
          break
        case "application/pdf":
          fileText = await getTextContentFromPDF(fileData)
          break
        case "application/octet-stream":
          fileText = fileData.toString()
          break
        default:
          throw new Error("Unsupported file type.")
      }

      const rawDocs = new Document({ pageContent: fileText })
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      })
      return await textSplitter.splitDocuments([rawDocs])
    })
  )
  const flatDocs = docs.flat()

  try {
    const index = await createPineconeIndex({
      pineconeApiKey: pineconeApiKey,
      pineconeEnvironment: pineconeEnvironment,
      pineconeIndexName: pineconeIndex,
    })

    const chunkSize = 100
    const chunks = chunk(flatDocs, chunkSize)

    await Promise.all(
      chunks.map((chunk) => {
        return PineconeStore.fromDocuments(
          index,
          chunk,
          new OpenAIEmbeddings({
            modelName: "text-embedding-ada-002",
            openAIApiKey: openaiApiKey,
          })
        )
      })
    )

    res.status(200).json({})
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Unknown error." })
  }
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
}

export default handler
