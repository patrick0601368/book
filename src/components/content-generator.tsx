'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface Subject {
  _id: string
  name: string
  description?: string
}

export function ContentGenerator() {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    difficulty: 'beginner',
    type: 'learning-page',
    provider: 'openai',
    customPrompt: ''
  })
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [generatedContent, setGeneratedContent] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('openai')

  // Load subjects from database
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await apiClient.getSubjects()
        setSubjects(data)
      } catch (error) {
        console.error('Failed to fetch subjects:', error)
      } finally {
        setIsLoadingSubjects(false)
      }
    }

    fetchSubjects()
  }, [])

  const handleAddSubject = async () => {
    if (newSubject.trim() && !subjects.find(s => s.name === newSubject.trim())) {
      try {
        const newSubjectData = await apiClient.createSubject({ name: newSubject.trim() })
        setSubjects([...subjects, newSubjectData])
        setFormData({ ...formData, subject: newSubjectData.name })
        setNewSubject('')
        setIsAddingNewSubject(false)
      } catch (error) {
        console.error('Failed to create subject:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const data = await apiClient.generateContent(formData)
      setGeneratedContent(data.content)
      setSelectedProvider(data.provider || formData.provider)
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>Generate Learning Content</span>
          </CardTitle>
          <CardDescription>
            Create personalized learning materials with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                {isAddingNewSubject ? (
                  <div className="flex gap-2">
                    <Input
                      id="newSubject"
                      placeholder="Enter new subject"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                    />
                    <Button type="button" onClick={handleAddSubject} size="sm">
                      Add
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setIsAddingNewSubject(false)} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => {
                        if (value === 'add_new') {
                          setIsAddingNewSubject(true)
                        } else {
                          setFormData({ ...formData, subject: value })
                        }
                      }}
                      disabled={isLoadingSubjects}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingSubjects ? "Loading subjects..." : "Select a subject"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.length === 0 && !isLoadingSubjects && (
                          <div className="px-2 py-1.5 text-sm text-gray-500">
                            No subjects yet. Add your first one!
                          </div>
                        )}
                        {subjects.map((subject) => (
                          <SelectItem key={subject._id} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="add_new" className="text-blue-600 font-medium">
                          + Add New Subject
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Calculus, Quantum Mechanics, World War II"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customPrompt">Custom Instructions (Optional)</Label>
              <textarea
                id="customPrompt"
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add specific instructions or requirements for the content generation..."
                value={formData.customPrompt}
                onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Content Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learning-page">Learning Page</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="exercise-with-solution">Exercise with Solution Path</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="provider">AI Provider</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                    <SelectItem value="mistral">Mistral AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Content</span>
              <span className="text-sm font-normal text-gray-500">
                Powered by {selectedProvider === 'mistral' ? 'Mistral AI' : 'OpenAI GPT-4'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
