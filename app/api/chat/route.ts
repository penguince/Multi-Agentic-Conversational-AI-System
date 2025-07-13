import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import type { NextRequest } from "next/server"

// Initialize OpenRouter client
const openrouter = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
})

// Enhanced knowledge base with property dataset context
const knowledgeBase = [
  {
    content:
      "OkADA & CO is a leading business consulting firm specializing in digital transformation and AI integration. We help companies modernize their operations and leverage cutting-edge technology.",
    embedding: [],
  },
  {
    content:
      "Our services include strategic planning, process optimization, technology implementation, and change management. We work with Fortune 500 companies across various industries.",
    embedding: [],
  },
  {
    content:
      "The company was founded in 2015 and has offices in New York, London, and Tokyo. We have a team of over 200 consultants and technology experts.",
    embedding: [],
  },
  {
    content:
      "OkADA & CO manages a comprehensive property portfolio with over 200 commercial properties. Our dataset includes detailed information about property addresses, floor plans, suite numbers, square footage, rental rates, and associated brokers. We track annual and monthly rent values, with properties ranging from small office spaces to large commercial complexes. Our top associates include experienced professionals like Joshamee Gibbs, Arya Stark, Dr. Sturgis, and Lewis Hamilton who manage various properties across different locations.",
    embedding: [],
  },
]

async function getPropertyContext(query: string) {
  // Check if query is property-related
  const propertyKeywords = [
    "property",
    "rent",
    "square feet",
    "sf",
    "floor",
    "suite",
    "broker",
    "associate",
    "annual rent",
    "monthly rent",
  ]
  const isPropertyQuery = propertyKeywords.some((keyword) => query.toLowerCase().includes(keyword.toLowerCase()))

  if (!isPropertyQuery) return ""

  try {
    // Fetch property data for context
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dataset-2Qr9RNz53lb9EaOetp0WpnjWOJOys6.csv",
    )
    const csvText = await response.text()

    // Parse and provide sample data for context
    const lines = csvText.split("\n").slice(0, 6) // First 5 records + header
    return `\n\nProperty Dataset Sample:\n${lines.join("\n")}\n\nThis dataset contains information about commercial properties including addresses, floor/suite details, square footage, rental rates, associated brokers, and financial metrics.`
  } catch (error) {
    return ""
  }
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  const lastMessage = messages[messages.length - 1]

  try {
    // Get property context if relevant
    const propertyContext = await getPropertyContext(lastMessage.content)

    // Combine all context
    const context = knowledgeBase.map((item) => item.content).join("\n\n") + propertyContext

    const result = await streamText({
      model: openrouter(process.env.OPENAI_MODEL || "google/gemma-2-27b-it"),
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for OkADA & CO, a business consulting firm with expertise in commercial real estate. Use the following context to answer questions about the company, provide business advice, and analyze property data. If you don't know something, say so honestly.

Context:
${context}

When discussing properties, you can reference specific data points from the dataset. Always be professional, helpful, and provide actionable insights for commercial real estate decisions.`,
        },
        ...messages,
      ],
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
