'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import dynamic from 'next/dynamic'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import 'katex/dist/katex.min.css'

// Import markdown preview dynamically to avoid SSR issues
const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview'),
  { ssr: false }
)

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

interface Grade {
  _id: string
  name: string
}

export function ContentGenerator() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    difficulty: 'beginner',
    type: 'learning-page',
    provider: 'openai',
    state: '',
    schoolType: '',
    grade: '',
    customPrompt: ''
  })
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [states, setStates] = useState<StateData[]>([])
  const [schoolTypes, setSchoolTypes] = useState<SchoolType[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false)
  const [isAddingNewState, setIsAddingNewState] = useState(false)
  const [isAddingNewSchoolType, setIsAddingNewSchoolType] = useState(false)
  const [isAddingNewGrade, setIsAddingNewGrade] = useState(false)
  
  const [newSubject, setNewSubject] = useState('')
  const [newState, setNewState] = useState('')
  const [newSchoolType, setNewSchoolType] = useState('')
  const [newGrade, setNewGrade] = useState('')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [isLoadingStates, setIsLoadingStates] = useState(true)
  const [isLoadingSchoolTypes, setIsLoadingSchoolTypes] = useState(true)
  const [isLoadingGrades, setIsLoadingGrades] = useState(true)
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

  // Load grades from database
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await apiClient.getGrades()
        setGrades(data)
      } catch (error) {
        console.error('Failed to fetch grades:', error)
      } finally {
        setIsLoadingGrades(false)
      }
    }

    fetchGrades()
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

  const handleAddGrade = async () => {
    const gradeNumber = newGrade.trim()
    
    // Validate that it's a number
    if (!gradeNumber || isNaN(Number(gradeNumber))) {
      toast({
        title: "Invalid Grade",
        description: "Grade must be a number (e.g., 5, 10, 12)",
        variant: "destructive",
        duration: 3000,
      })
      return
    }
    
    if (!grades.find(g => g.name === gradeNumber)) {
      try {
        const newGradeData = await apiClient.createGrade({ name: gradeNumber })
        setGrades([...grades, newGradeData])
        setFormData({ ...formData, grade: newGradeData.name })
        setNewGrade('')
        setIsAddingNewGrade(false)
      } catch (error) {
        console.error('Failed to create grade:', error)
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
        grade: formData.grade,
      })
      
      // Show success toast
      toast({
        title: "Content Saved!",
        description: `"${formData.subject} - ${formData.topic}" has been saved successfully.`,
        duration: 5000,
      })
      
      // Reset form and preview
      setShowPreview(false)
      setGeneratedContent('')
      setEditableContent('')
      setRefinementPrompt('')
    } catch (error) {
      console.error('Error saving content:', error)
      
      // Show error toast
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save content. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Grade (Optional)</Label>
                {isAddingNewGrade ? (
                  <div className="flex gap-2">
                    <Input
                      id="newGrade"
                      type="number"
                      placeholder="Enter grade number (e.g., 5, 10, 12)"
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGrade())}
                      min="1"
                      max="20"
                    />
                    <Button type="button" onClick={handleAddGrade} size="sm">
                      Add
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setIsAddingNewGrade(false)} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => {
                      if (value === 'add_new') {
                        setIsAddingNewGrade(true)
                      } else {
                        setFormData({ ...formData, grade: value })
                      }
                    }}
                    disabled={isLoadingGrades}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingGrades ? "Loading..." : "Select grade (1-12)"} />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.length === 0 && !isLoadingGrades && (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No grades yet. Add one!
                        </div>
                      )}
                      {grades.map((grade) => (
                        <SelectItem key={grade._id} value={grade.name}>
                          Grade {grade.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="add_new" className="text-blue-600 font-medium">
                        + Add New Grade
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-[98vw] max-h-[98vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Content Preview</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
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
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Editor Side */}
              <div className="w-full md:w-1/2 flex flex-col border-r">
                <div className="p-3 bg-gray-50 border-b">
                  <Label htmlFor="editableContent" className="text-sm font-semibold">Edit Content (Source)</Label>
                </div>
                <textarea
                  id="editableContent"
                  className="flex-1 px-4 py-3 text-sm focus:outline-none font-mono resize-none"
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                />
              </div>

              {/* Preview Side */}
              <div className="w-full md:w-1/2 flex flex-col bg-white">
                <div className="p-3 bg-gray-50 border-b">
                  <Label className="text-sm font-semibold">Preview (Formatted)</Label>
                </div>
                <div className="flex-1 overflow-auto px-8 py-6 bg-white">
                  <MarkdownPreview 
                    source={editableContent}
                    style={{ 
                      backgroundColor: 'white',
                      color: '#1f2937',
                      padding: 0,
                      fontSize: '16px',
                      lineHeight: '1.75'
                    }}
                    wrapperElement={{
                      "data-color-mode": "light"
                    }}
                    rehypePlugins={[[rehypeKatex, { strict: false, output: 'html' }]]}
                    remarkPlugins={[remarkMath, remarkGfm]}
                    components={{
                      h1: ({ children, ...props }) => <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }} {...props}>{children}</h1>,
                      h2: ({ children, ...props }) => <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '1.25rem', marginBottom: '0.75rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }} {...props}>{children}</h2>,
                      h3: ({ children, ...props }) => <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }} {...props}>{children}</h3>,
                      p: ({ children, ...props }) => <p style={{ marginBottom: '1rem', lineHeight: '1.75' }} {...props}>{children}</p>,
                      ul: ({ children, ...props }) => <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }} {...props}>{children}</ul>,
                      ol: ({ children, ...props }) => <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5rem', marginBottom: '1rem' }} {...props}>{children}</ol>,
                      li: ({ children, ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props}>{children}</li>,
                      strong: ({ children, ...props }) => <strong style={{ fontWeight: '700', color: '#111827' }} {...props}>{children}</strong>,
                      em: ({ children, ...props }) => <em style={{ fontStyle: 'italic' }} {...props}>{children}</em>,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 space-y-3">
              <div>
                <Label htmlFor="refinementPrompt" className="text-sm font-semibold">Refine Content (Optional)</Label>
                <div className="flex gap-2 mt-1">
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
              </div>

              <div className="flex gap-2">
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
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Save Content
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleNewGeneration} 
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
