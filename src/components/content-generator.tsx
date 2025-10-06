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

interface StateData {
  _id: string
  name: string
}

interface SchoolType {
  _id: string
  name: string
}

export function ContentGenerator() {
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    difficulty: 'beginner',
    type: 'learning-page',
    provider: 'openai',
    state: '',
    schoolType: '',
    customPrompt: ''
  })
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [states, setStates] = useState<StateData[]>([])
  const [schoolTypes, setSchoolTypes] = useState<SchoolType[]>([])
  
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false)
  const [isAddingNewState, setIsAddingNewState] = useState(false)
  const [isAddingNewSchoolType, setIsAddingNewSchoolType] = useState(false)
  
  const [newSubject, setNewSubject] = useState('')
  const [newState, setNewState] = useState('')
  const [newSchoolType, setNewSchoolType] = useState('')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [isLoadingStates, setIsLoadingStates] = useState(true)
  const [isLoadingSchoolTypes, setIsLoadingSchoolTypes] = useState(true)
  const [generatedContent, setGeneratedContent] = useState('')
  const [editableContent, setEditableContent] = useState('')
  const [refinementPrompt, setRefinementPrompt] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const [showPreview, setShowPreview] = useState(false)

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

  // Load states from database
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const data = await apiClient.getStates()
        setStates(data)
      } catch (error) {
        console.error('Failed to fetch states:', error)
      } finally {
        setIsLoadingStates(false)
      }
    }

    fetchStates()
  }, [])

  // Load school types from database
  useEffect(() => {
    const fetchSchoolTypes = async () => {
      try {
        const data = await apiClient.getSchoolTypes()
        setSchoolTypes(data)
      } catch (error) {
        console.error('Failed to fetch school types:', error)
      } finally {
        setIsLoadingSchoolTypes(false)
      }
    }

    fetchSchoolTypes()
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

  const handleAddState = async () => {
    if (newState.trim() && !states.find(s => s.name === newState.trim())) {
      try {
        const newStateData = await apiClient.createState({ name: newState.trim() })
        setStates([...states, newStateData])
        setFormData({ ...formData, state: newStateData.name })
        setNewState('')
        setIsAddingNewState(false)
      } catch (error) {
        console.error('Failed to create state:', error)
      }
    }
  }

  const handleAddSchoolType = async () => {
    if (newSchoolType.trim() && !schoolTypes.find(s => s.name === newSchoolType.trim())) {
      try {
        const newSchoolTypeData = await apiClient.createSchoolType({ name: newSchoolType.trim() })
        setSchoolTypes([...schoolTypes, newSchoolTypeData])
        setFormData({ ...formData, schoolType: newSchoolTypeData.name })
        setNewSchoolType('')
        setIsAddingNewSchoolType(false)
      } catch (error) {
        console.error('Failed to create school type:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const data = await apiClient.generateContent(formData)
      setGeneratedContent(data.content)
      setEditableContent(data.content)
      setSelectedProvider(data.provider || formData.provider)
      setShowPreview(true)
      setRefinementPrompt('')
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRefine = async () => {
    if (!refinementPrompt.trim()) return
    
    setIsRefining(true)

    try {
      const data = await apiClient.generateContent({
        ...formData,
        customPrompt: `Based on this existing content:\n\n${editableContent}\n\nPlease make the following changes: ${refinementPrompt}`
      })
      setGeneratedContent(data.content)
      setEditableContent(data.content)
      setRefinementPrompt('')
    } catch (error) {
      console.error('Error refining content:', error)
    } finally {
      setIsRefining(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      await apiClient.saveContent({
        title: `${formData.subject} - ${formData.topic}`,
        content: editableContent,
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty,
        type: formData.type,
        state: formData.state,
        schoolType: formData.schoolType,
      })
      
      // Reset form and preview
      setShowPreview(false)
      setGeneratedContent('')
      setEditableContent('')
      setRefinementPrompt('')
      
      alert('Content saved successfully!')
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleNewGeneration = () => {
    setShowPreview(false)
    setGeneratedContent('')
    setEditableContent('')
    setRefinementPrompt('')
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State (Optional)</Label>
                {isAddingNewState ? (
                  <div className="flex gap-2">
                    <Input
                      id="newState"
                      placeholder="Enter state name"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddState())}
                    />
                    <Button type="button" onClick={handleAddState} size="sm">
                      Add
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setIsAddingNewState(false)} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={formData.state}
                    onValueChange={(value) => {
                      if (value === 'add_new') {
                        setIsAddingNewState(true)
                      } else {
                        setFormData({ ...formData, state: value })
                      }
                    }}
                    disabled={isLoadingStates}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingStates ? "Loading..." : "Select a state"} />
                    </SelectTrigger>
                    <SelectContent>
                      {states.length === 0 && !isLoadingStates && (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No states yet. Add one!
                        </div>
                      )}
                      {states.map((state) => (
                        <SelectItem key={state._id} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="add_new" className="text-blue-600 font-medium">
                        + Add New State
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label htmlFor="schoolType">School Type (Optional)</Label>
                {isAddingNewSchoolType ? (
                  <div className="flex gap-2">
                    <Input
                      id="newSchoolType"
                      placeholder="Enter school type"
                      value={newSchoolType}
                      onChange={(e) => setNewSchoolType(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSchoolType())}
                    />
                    <Button type="button" onClick={handleAddSchoolType} size="sm">
                      Add
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setIsAddingNewSchoolType(false)} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={formData.schoolType}
                    onValueChange={(value) => {
                      if (value === 'add_new') {
                        setIsAddingNewSchoolType(true)
                      } else {
                        setFormData({ ...formData, schoolType: value })
                      }
                    }}
                    disabled={isLoadingSchoolTypes}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingSchoolTypes ? "Loading..." : "Select school type"} />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolTypes.length === 0 && !isLoadingSchoolTypes && (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No school types yet. Add one!
                        </div>
                      )}
                      {schoolTypes.map((type) => (
                        <SelectItem key={type._id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="add_new" className="text-blue-600 font-medium">
                        + Add New School Type
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
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

      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Content Preview</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-normal text-gray-500">
                  Powered by {selectedProvider === 'mistral' ? 'Mistral AI' : 'OpenAI GPT-4'}
                </span>
                <Button 
                  onClick={handleNewGeneration} 
                  variant="outline" 
                  size="sm"
                >
                  New Generation
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="editableContent">Edit Content</Label>
              <textarea
                id="editableContent"
                className="w-full min-h-[400px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="refinementPrompt">Refine Content (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="refinementPrompt"
                  placeholder="e.g., Make it shorter, add more examples, simplify language..."
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isRefining && handleRefine()}
                />
                <Button 
                  onClick={handleRefine} 
                  disabled={isRefining || !refinementPrompt.trim()}
                  variant="outline"
                >
                  {isRefining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refining...
                    </>
                  ) : (
                    'Refine'
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Describe changes you'd like to make to the content
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Content'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
