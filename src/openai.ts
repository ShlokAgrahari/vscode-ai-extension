import axios from "axios";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export async function askAI(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-0528:free", 
        messages: [
          {
    role: "system",
    content: "You are a helpful assistant. Always reply in English.When given code, analyze it step-by-step with detailed explanation.When given image analyze the image and explain or tell about it"
  },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yourdomain.com", 
          "X-Title": "VSCode AI Chat"               
        }
      }
    );

    const reply = response.data.choices?.[0]?.message?.content;
    return reply || "No response from DeepSeek.";
  } catch (error: any) {
    console.error("OpenRouter API Error:", error?.response?.data || error.message);
    return error?.response?.data?.error?.message || "Error contacting AI assistant.";
  }
}
