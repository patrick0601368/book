import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Mistral AI configuration
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, subject, topic, difficulty, provider = 'openai' } = await request.json()

    let prompt = ''
    
    switch (type) {
      case 'learning-page':
        prompt = `Create a comprehensive learning page about "${topic}" in the subject of "${subject}". 
        Difficulty level: ${difficulty}. 
        Include:
        - Clear explanations
        - Key concepts
        - Examples
        - Visual descriptions where helpful
        Format as markdown with proper headings.`
        break
        
      case 'exercise':
        prompt = `Create a ${difficulty} level exercise about "${topic}" in the subject of "${subject}".
        Include:
        - A clear question/problem
        - Step-by-step solution
        - Explanation of the reasoning
        Format as markdown.`
        break
        
      case 'solution-path':
        prompt = `Create a detailed solution path for learning "${topic}" in the subject of "${subject}".
        Difficulty: ${difficulty}.
        Include:
        - Prerequisites
        - Learning sequence
        - Key milestones
        - Practice recommendations
        Format as a structured learning path.`
        break
        
      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    let content = ''

    if (provider === 'mistral') {
      // Use Mistral AI
      if (!MISTRAL_API_KEY) {
        return NextResponse.json({ error: 'Mistral API key not configured' }, { status: 500 })
      }

      const mistralResponse = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator. Create high-quality, engaging learning materials that are clear, accurate, and pedagogically sound.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      })

      if (!mistralResponse.ok) {
        throw new Error(`Mistral API error: ${mistralResponse.statusText}`)
      }

      const mistralData = await mistralResponse.json()
      content = mistralData.choices[0]?.message?.content || ''
    } else {
      // Use OpenAI (default)
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert educational content creator. Create high-quality, engaging learning materials that are clear, accurate, and pedagogically sound."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      })

      content = completion.choices[0]?.message?.content || ''
    }

    return NextResponse.json({ content, provider })
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
