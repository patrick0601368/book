import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, subject, topic, difficulty } = await request.json()

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

    const content = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
