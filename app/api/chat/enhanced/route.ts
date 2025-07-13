import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

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
      "OkADA & CO manages a comprehensive commercial real estate portfolio with 225 properties across Manhattan. Our dataset includes detailed information about property addresses, floor plans, suite numbers, square footage (ranging from 9,000 to 20,000+ sq ft), and rental rates. Annual rents range from $750,000 to over $2 million. Our experienced associates include Jack Sparrow, Davy Jones, Elizabeth Swann, Will Turner, and many others who manage properties on locations like Broadway, Fifth Avenue, West 36th Street, and other prime Manhattan locations. We track monthly rent, annual rent, GCI over 3 years, and work with various building classes from Executive to Premium properties.",
    embedding: [],
  },
]

async function getPropertyContext(query: string) {
  // Check if query is property-related
  const propertyKeywords = [
    "property", "properties", "rent", "rental", "square feet", "sf", "sqft",
    "floor", "suite", "broker", "associate", "annual rent", "monthly rent",
    "building", "address", "broadway", "avenue", "street", "lease", "market"
  ]
  const isPropertyQuery = propertyKeywords.some((keyword) => 
    query.toLowerCase().includes(keyword.toLowerCase())
  )

  if (!isPropertyQuery) return ""

  try {
    // Use our backend property search service
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    
    // Search for relevant properties
    const searchResponse = await fetch(
      `${backendUrl}/api/analytics/search?q=${encodeURIComponent(query)}&limit=3`,
      { headers: { 'Content-Type': 'application/json' } }
    )
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      
      if (searchData.results && searchData.results.length > 0) {
        let context = "\n\nRELEVANT PROPERTY DATA:\n"
        searchData.results.forEach((result: any, index: number) => {
          const prop = result.property
          context += `${index + 1}. ${prop.formatted_info}\n`
        })
        
        // Also get market summary
        const marketResponse = await fetch(`${backendUrl}/api/analytics/market-summary`)
        if (marketResponse.ok) {
          const marketData = await marketResponse.json()
          const summary = marketData.summary
          context += `\nMARKET OVERVIEW:\n`
          context += `Total Properties: ${summary.total_properties || 0}\n`
          context += `Average Annual Rent: $${(summary.average_rent || 0).toLocaleString()}\n`
          context += `Average Size: ${(summary.average_size || 0).toLocaleString()} sq ft\n`
        }
        
        return context + "\n\nUse this specific property data to provide accurate, helpful responses."
      }
    }
    
    return ""
  } catch (error) {
    console.error('Property context error:', error)
    return ""
  }
}

// Enhanced chat endpoint that creates and manages conversation sessions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Enhanced chat API received:', JSON.stringify(body, null, 2));
    
    // Support both AI SDK format ({ messages }) and custom format ({ message, sessionId })
    let message: string;
    let sessionId: string | undefined;
    let userId: string | undefined;
    let userEmail: string | undefined;
    
    if (body.messages && Array.isArray(body.messages)) {
      // AI SDK format - get the last user message
      const lastMessage = body.messages[body.messages.length - 1];
      if (lastMessage?.role === 'user') {
        message = lastMessage.content;
      } else {
        console.error('No user message found in messages array:', body.messages);
        return new Response('No user message found', { status: 400 });
      }
      // Extract session info from body
      sessionId = body.sessionId;
      userId = body.userId;
      userEmail = body.userEmail;
    } else if (body.message) {
      // Custom format
      message = body.message;
      sessionId = body.sessionId;
      userId = body.userId;
      userEmail = body.userEmail;
    } else {
      console.error('Invalid request format:', body);
      return new Response('Invalid request format. Expected messages array or message string.', { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.error('Message validation failed:', { message, type: typeof message });
      return new Response('Valid message is required', { status: 400 });
    }

    console.log('Parsed message:', message, 'sessionId:', sessionId);

    let currentSessionId = sessionId;

    // Create new session if none provided
    if (!currentSessionId) {
      try {
        const sessionResponse = await fetch(`${BACKEND_URL}/api/conversations/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId || null,
            user_email: userEmail || null,
            title: message.length > 50 ? message.substring(0, 50) + '...' : message
          })
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          currentSessionId = sessionData.session_id;
        }
      } catch (error) {
        console.warn('Failed to create session:', error);
      }
    }

    // Get conversation history for context
    let conversationHistory: any[] = [];
    if (currentSessionId) {
      try {
        const historyResponse = await fetch(`${BACKEND_URL}/api/conversations/sessions/${currentSessionId}/history`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          // Get recent messages (last 10) for context
          conversationHistory = historyData.messages.slice(-10).map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));
        }
      } catch (error) {
        console.warn('Failed to fetch conversation history:', error);
      }
    }

    // Add user message to conversation history
    if (currentSessionId) {
      try {
        await fetch(`${BACKEND_URL}/api/conversations/sessions/${currentSessionId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: message,
            sender: 'user',
            metadata: { timestamp: new Date().toISOString() }
          })
        });
      } catch (error) {
        console.warn('Failed to save user message:', error);
      }
    }

    // Get property context if relevant
    const propertyContext = await getPropertyContext(message);

    // Combine all context
    const context = knowledgeBase.map((item) => item.content).join("\n\n") + propertyContext;

    // Build messages array with conversation history
    const messages = [
      {
        role: "system" as const,
        content: `You are an AI assistant for OkADA & CO, a business consulting firm with expertise in commercial real estate. Use the following context to answer questions about the company, provide business advice, and analyze property data. If you don't know something, say so honestly.

Context:
${context}

When discussing properties, you can reference specific data points from the dataset. Always be professional, helpful, and provide actionable insights for commercial real estate decisions.`,
      },
      ...conversationHistory,
      { role: "user" as const, content: message }
    ];

    const result = await streamText({
      model: openrouter(process.env.OPENAI_MODEL || "google/gemma-2-27b-it"),
      messages,
      onFinish: async (result) => {
        // Save assistant response to conversation history
        if (currentSessionId && result.text) {
          try {
            await fetch(`${BACKEND_URL}/api/conversations/sessions/${currentSessionId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content: result.text,
                sender: 'assistant',
                metadata: { 
                  model: process.env.OPENAI_MODEL || "google/gemma-2-27b-it",
                  usage: result.usage,
                  timestamp: new Date().toISOString()
                }
              })
            });
          } catch (error) {
            console.warn('Failed to save assistant message:', error);
          }
        }
      }
    });

    return result.toDataStreamResponse({
      headers: {
        'X-Session-Id': currentSessionId || '',
      }
    });

  } catch (error) {
    console.error('Enhanced chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
