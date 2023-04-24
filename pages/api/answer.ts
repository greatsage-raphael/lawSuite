import { OpenAIStream } from "@/utils";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { prompt, systemPrompt } = (await req.json()) as {
      prompt: string,
      systemPrompt: string;
    };
    
    // console.log(systemPrompt)

    const stream = await OpenAIStream(prompt, systemPrompt, process.env.OPENAI_API_KEY ?? "");

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
