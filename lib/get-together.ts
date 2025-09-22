import Together from "together-ai";

export function getTogether() {
  const options: ConstructorParameters<typeof Together>[0] = {};

  if (process.env.HELICONE_API_KEY) {
    options.baseURL = "https://together.helicone.ai/v1";
    options.defaultHeaders = {
      "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
      "Helicone-Property-BYOK": "false",
      "Helicone-Property-appname": "sixtyoneeighty",
      "Helicone-Property-environment":
        process.env.VERCEL_ENV === "production" ? "prod" : "dev",
    };
  }

  // Use the environment variable API key
  options.apiKey = process.env.TOGETHER_API_KEY;

  const together = new Together(options);

  return together;
}
