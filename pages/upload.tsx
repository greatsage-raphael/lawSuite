import React, { useCallback, useState } from "react"
import Head from "next/head"
import { useCredentialsCookie } from "@/context/credentials-context"
import { useToast } from "@/hooks/use-toast"
import { Bot, Loader2, Send, UploadCloud, User } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"

const DEFAULT_QUESTION = "what is {contract name} about?"
const INITIAL_MESSAGE = {
  from: "bot",
  content:
    "You can think me as your knowledge base, once you uploaded a book, the knowledge will be persisted in the database. You can come back at any time to ask questions about them, across multiple books.",
}
const DEFAULT_GITHUB_URL = "https://github.com/fraserxu/book-gpt/tree/main"

export default function IndexPage() {
  const [files, setFiles] = useState(null)
  const [question, setQuestion] = useState(DEFAULT_QUESTION)
  const [isUploading, setIsUploading] = useState(false)
  const [isAsking, setIsAsking] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const { cookieValue } = useCredentialsCookie()
  const [githubUrl, setGithubUrl] = useState("")

  const { toast } = useToast()

  const handleGithubUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubUrl(e.target.value)
  }
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value)
  }

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles)
  }, [])

  const handleUpload = useCallback(async () => {
  const formData = new FormData()
  Array.from(files).forEach((file: File) => {
    formData.append(file.name, file)
  })

    setIsUploading(true)
    try {
      const response = await fetch("/api/ingest", {
        method: "post",
        body: formData,
      })
      const result = await response.json()
      if (result.error) {
        toast({
          title: "Something went wrong.",
          description: result.error,
        })
      } else {
        toast({
          title: "Upload success.",
        })
      }

      setIsUploading(false)
    } catch (e) {
      toast({
        title: "Something went wrong.",
      })
      setIsUploading(false)
    }
  }, [files, toast])

  const handleGithubUpload = useCallback(async () => {
    setIsUploading(true)
    try {
      const response = await fetch("/api/github", {
        body: JSON.stringify({
          credentials: cookieValue,
          githubUrl,
        }),
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      })
      const result = await response.json()
      if (result.error) {
        toast({
          title: "Something went wrong.",
          description: result.error,
        })
      } else {
        toast({
          title: "Upload success.",
        })
      }

      setIsUploading(false)
    } catch (e) {
      toast({
        title: "Something went wrong.",
      })
      setIsUploading(false)
    }
  }, [githubUrl, cookieValue, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt", ".md"],
    },
  })

  const handleSubmit = useCallback(async () => {
    setIsAsking(true)
    setQuestion("")
    setChatHistory([
      ...chatHistory,
      {
        from: "user",
        content: question,
      },
    ])

    const response = await fetch("/api/chat", {
      body: JSON.stringify({
        question,
        chatHistory: chatHistory.reduce((prev, curr) => {
          prev += curr.content
          return prev
        }, ""),
      }),
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    })
    const answer = await response.json()

    if (answer.text) {
      setChatHistory((currentChatHistory) => [
        ...currentChatHistory,
        {
          from: "bot",
          content: answer.text,
        },
      ])

      setIsAsking(false)
    } else {
      setIsAsking(false)
      toast({
        title: "Something went wrong.",
        description: answer.error,
      })
    }
  }, [question, chatHistory, toast])

  const handleKeyDown = useCallback(
    async (event) => {
      if (event.key === "Enter") {
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <Layout>
      <Head>
        <title>LawSuite 💼</title>
        <meta
          name="description"
          content={`AI-powered search and chat for Uganda's law Corpus`}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </Head>
      <section className="container flex flex-col justify-items-stretch gap-6 pt-6 pb-8 sm:flex-row md:py-10">
        <div className="min-w-1/5 flex flex-col items-start gap-2">
          <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
            Upload Your Contract/ book 
          </h2>
          <div
            className="min-w-full rounded-md border border-slate-200 p-0 dark:border-slate-700"
            {...getRootProps()}
          >
            <div className="flex min-h-[150px] cursor-pointer items-center justify-center p-10">
              <input {...getInputProps()} />

              {files ? (
                <ul>
                  {files.map((file) => (
                    <li key={file.name}>* {file.name}</li>
                  ))}
                </ul>
              ) : (
                <>
                  {isDragActive ? (
                    <p>Drop the files here ...</p>
                  ) : (
                    <p>
                      Drag and drop files(.pdf, .txt, .md) here, or click to
                      select files
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="self-start">
            <Button
              className="mt-2"
              onClick={handleUpload}
            >
              {!isUploading ? (
                <UploadCloud className="mr-2 h-4 w-4" />
              ) : (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload
            </Button>
          </div>

          {/* <div className="my-2 min-w-full py-4 sm:mb-0">
            <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
              Or provide a url to a Github docs folder
            </h2>
            <div className="my-2 w-full">
              <input
                type="text"
                value={githubUrl}
                placeholder={DEFAULT_GITHUB_URL}
                onChange={handleGithubUrlChange}
                className="w-full rounded-md border border-gray-400 p-2 text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
              />
            </div>

            <Button
              onClick={handleGithubUpload}
              className="mt-2"
            >
              {!isUploading ? (
                <UploadCloud className="mr-2 h-4 w-4" />
              ) : (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload
            </Button>
          </div> */}

          {/* <div>
            This app needs you to{" "}
            <Link
              className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
              href="/credentials"
              rel="noreferrer"
            >
              add credentials
            </Link>{" "}
            to work properly.
          </div> */}
        </div>

        <div className="flex grow flex-col items-start gap-2">
          <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
            Ask me anything about the contract
          </h2>

          <div className="w-full">
            <div className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch flex min-h-[300px] flex-col space-y-4 overflow-y-auto rounded border border-gray-400 p-4">
              {[INITIAL_MESSAGE, ...chatHistory].map((chat, index) => {
                return (
                  <div className="chat-message" key={index}>
                    <div
                      className={cn(
                        "flex",
                        "items-end",
                        chat.from === "bot" && "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "order-2 mx-2 flex max-w-xs flex-col items-start space-y-2 text-xs",
                          chat.from === "bot" && "order-1"
                        )}
                      >
                        <div>
                          <span
                            className={cn(
                              "inline-block rounded-lg bg-gray-300 px-4 py-2 text-gray-600",
                              chat.from === "user" &&
                                "rounded-bl-none bg-gray-300 text-gray-600",
                              chat.from === "bot" &&
                                "rounded-br-none bg-blue-600 text-white"
                            )}
                          >
                            {chat.content}
                          </span>
                        </div>
                      </div>
                      {chat.from === "user" ? (
                        <User className="order-1 h-4 w-4" />
                      ) : (
                        <Bot className="order-1 h-4 w-4" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mb-2 pt-4 sm:mb-0">
              <div className="relative flex">
                <input
                  type="text"
                  value={question}
                  placeholder={DEFAULT_QUESTION}
                  onChange={handleQueryChange}
                  className="mr-2 w-full rounded-md border border-gray-400 pl-2 text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
                  onKeyDown={handleKeyDown}
                />
                <div className="items-center sm:flex">
                  <Button
                    onClick={handleSubmit}
                  >
                    {!isAsking ? (
                      <Send className="h-4 w-4" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
