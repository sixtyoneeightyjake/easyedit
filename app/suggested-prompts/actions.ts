"use server";

import Together from "together-ai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import invariant from "tiny-invariant";
import { getIPAddress, getRateLimiter } from "@/lib/rate-limiter";

const together = new Together();

const schema = z.array(z.string());
const jsonSchema = zodToJsonSchema(schema, { target: "openAi" });

const ratelimit = getRateLimiter();

export async function getSuggestions(
  imageUrl: string,
  userAPIKey: string | null,
) {
  invariant(typeof imageUrl === "string");

  if (ratelimit && !userAPIKey) {
    const ipAddress = await getIPAddress();

    const { success } = await ratelimit.limit(`${ipAddress}-suggestions`);
    if (!success) {
      return [];
    }
  }

  if (userAPIKey) {
    together.apiKey = userAPIKey;
  }

  const response = await together.chat.completions.create({
    model: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
    response_format: { type: "json_object", schema: jsonSchema },
    messages: [
      {
        role: "system",
        content:
          "The following is an image that a user will be making edits to in an LLM-powered image editing app via prompting. Please suggest three good simple edits that the user could make. Answer only in JSON.",
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
  });

  if (!response?.choices?.[0]?.message?.content) return [];

  const json = JSON.parse(response?.choices?.[0]?.message?.content);
  const result = schema.safeParse(json);

  if (result.error) return [];

  return result.data;
}
