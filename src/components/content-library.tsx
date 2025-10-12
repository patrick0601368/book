'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Search, FileText, BookOpen, ClipboardList, Eye, X, Sparkles, CheckCircle2 } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { marked } from 'marked'
import { useToast } from '@/hooks/use-toast'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(enLocale)

interface Content {
  _id: string
  title: string
  content: string
  subject: string
  topic: string
  difficulty: string
  type: string
  state?: string
  schoolType?: string
  grade?: string
  language?: string
  country?: string
  creatorName?: string
  creatorEmail?: string
  createdAt: string
  updatedAt?: string
}

interface Subject {
  _id: string
  name: string
}

interface State {
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

export function ContentLibrary() {
  const { toast } = useToast()
  const [contents, setContents] = useState<Content[]>([])
  const [filteredContents, setFilteredContents] = useState<Content[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [states, setStates] = useState<State[]>([])
  const [schoolTypes, setSchoolTypes] = useState<SchoolType[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatedNewContent, setGeneratedNewContent] = useState('')
  const [editableContent, setEditableContent] = useState('')
  const [refinementPrompt, setRefinementPrompt] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [baseContent, setBaseContent] = useState<Content | null>(null) // Store the original content
  
  // Add new state/schoolType/grade UI states
  const [isAddingNewState, setIsAddingNewState] = useState(false)
  const [isAddingNewSchoolType, setIsAddingNewSchoolType] = useState(false)
  const [isAddingNewGrade, setIsAddingNewGrade] = useState(false)
  const [newState, setNewState] = useState('')
  const [newSchoolType, setNewSchoolType] = useState('')
  const [newGrade, setNewGrade] = useState('')
  
  // Form data for generation based on existing content
  const [generateForm, setGenerateForm] = useState({
    subject: '',
    topic: '',
    difficulty: 'beginner',
    type: 'learning-page',
    state: '',
    schoolType: '',
    grade: '',
    language: 'English',
    country: '',
    customPrompt: '',
    provider: 'openai'
  })
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterState, setFilterState] = useState('all')
  const [filterSchoolType, setFilterSchoolType] = useState('all')
  const [filterGrade, setFilterGrade] = useState('all')

  // Simple markdown renderer - MathJax will handle the math
  const renderMarkdown = (content: string) => {
    if (!content) return ''
    
    try {
      // Step 1: Protect LaTeX from markdown parser by replacing with placeholders
      const latexPlaceholders: { [key: string]: string } = {}
      let placeholderIndex = 0
      
      // Protect display math \[ ... \]
      let protectedContent = content.replace(/\\\[([\s\S]*?)\\\]/g, (match) => {
        const placeholder = `XLATEXDISPLAYX${placeholderIndex}XLATEXDISPLAYX`
        latexPlaceholders[placeholder] = match
        placeholderIndex++
        return placeholder
      })
      
      // Protect inline math \( ... \)
      protectedContent = protectedContent.replace(/\\\((.*?)\\\)/g, (match) => {
        const placeholder = `XLATEXINLINEX${placeholderIndex}XLATEXINLINEX`
        latexPlaceholders[placeholder] = match
        placeholderIndex++
        return placeholder
      })
      
      // Configure marked with custom renderer
      const renderer = new marked.Renderer()
      
      // Override code block rendering to prevent dark backgrounds
      renderer.code = ({ text, lang, escaped }: any) => {
        return `<pre class="bg-gray-100 text-gray-900 p-4 rounded"><code>${text}</code></pre>`
      }
      
      // Override inline code rendering
      renderer.codespan = ({ text }: any) => {
        return `<code class="bg-pink-100 text-pink-700 px-1 rounded">${text}</code>`
      }
      
      marked.setOptions({
        breaks: true,
        gfm: true,
        renderer: renderer
      })
      
      // Step 2: Parse markdown
      let html = marked.parse(protectedContent) as string
      
      // Step 3: Restore LaTeX placeholders
      Object.keys(latexPlaceholders).forEach(placeholder => {
        // Escape special regex characters in placeholder
        const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escapedPlaceholder, 'g')
        html = html.replace(regex, latexPlaceholders[placeholder])
      })
      
      return html
    } catch (error) {
      console.error('Rendering error:', error)
      return `<div class="text-gray-900">${content.replace(/\n/g, '<br>')}</div>`
    }
  }

  // Trigger MathJax rendering after content changes
  useEffect(() => {
    if (selectedContent) {
      const renderMath = () => {
        if (typeof window !== 'undefined' && (window as any).MathJax) {
          console.log('Triggering MathJax typeset for library...')
          ;(window as any).MathJax.typesetPromise?.()
            .then(() => console.log('MathJax rendering complete'))
            .catch((err: any) => console.error('MathJax error:', err))
        } 
      }
      
      // Initial render
      setTimeout(renderMath, 100)
    }
  }, [selectedContent])

  // Trigger MathJax for generated content preview
  useEffect(() => {
    if (generatedNewContent && showGenerateModal) {
      const renderMath = () => {
        if (typeof window !== 'undefined' && (window as any).MathJax) {
          console.log('Triggering MathJax typeset for generated content preview...')
          ;(window as any).MathJax.typesetPromise?.()
            .then(() => console.log('MathJax rendering complete'))
            .catch((err: any) => console.error('MathJax error:', err))
        } 
      }
      setTimeout(renderMath, 100)
    }
  }, [generatedNewContent, showGenerateModal, editableContent])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contentsResponse = await apiClient.getContent()
        const subjectsData = await apiClient.getSubjects()
        const statesData = await apiClient.getStates()
        const schoolTypesData = await apiClient.getSchoolTypes()
        const gradesData = await apiClient.getGrades()
        
        setContents(contentsResponse)
        setFilteredContents(contentsResponse)
        setSubjects(subjectsData)
        setStates(statesData)
        setSchoolTypes(schoolTypesData)
        setGrades(gradesData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = [...contents]

    if (searchQuery) {
      filtered = filtered.filter(content =>
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterSubject !== 'all') {
      filtered = filtered.filter(content => content.subject === filterSubject)
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(content => content.type === filterType)
    }

    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(content => content.difficulty === filterDifficulty)
    }

    if (filterState !== 'all') {
      filtered = filtered.filter(content => content.state === filterState)
    }

    if (filterSchoolType !== 'all') {
      filtered = filtered.filter(content => content.schoolType === filterSchoolType)
    }

    if (filterGrade !== 'all') {
      filtered = filtered.filter(content => content.grade === filterGrade)
    }

    setFilteredContents(filtered)
  }, [searchQuery, filterSubject, filterType, filterDifficulty, filterState, filterSchoolType, filterGrade, contents])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'learning-page':
        return <BookOpen className="h-5 w-5 text-blue-600" />
      case 'exercise':
        return <ClipboardList className="h-5 w-5 text-green-600" />
      case 'exercise-with-solution':
        return <FileText className="h-5 w-5 text-purple-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'learning-page':
        return 'Learning Page'
      case 'exercise':
        return 'Exercise'
      case 'exercise-with-solution':
        return 'Exercise with Solution'
      default:
        return type
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterSubject('all')
    setFilterType('all')
    setFilterDifficulty('all')
    setFilterState('all')
    setFilterSchoolType('all')
    setFilterGrade('all')
  }

  const handleAddState = async () => {
    if (!newState.trim()) return
    try {
      await apiClient.createState({ name: newState })
      const statesData = await apiClient.getStates()
      setStates(statesData)
      setGenerateForm({ ...generateForm, state: newState })
      setNewState('')
      setIsAddingNewState(false)
      toast({ title: "Success", description: "State added successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to add state", variant: "destructive" })
    }
  }

  const handleAddSchoolType = async () => {
    if (!newSchoolType.trim()) return
    try {
      await apiClient.createSchoolType({ name: newSchoolType })
      const schoolTypesData = await apiClient.getSchoolTypes()
      setSchoolTypes(schoolTypesData)
      setGenerateForm({ ...generateForm, schoolType: newSchoolType })
      setNewSchoolType('')
      setIsAddingNewSchoolType(false)
      toast({ title: "Success", description: "School type added successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to add school type", variant: "destructive" })
    }
  }

  const handleAddGrade = async () => {
    if (!newGrade.trim()) return
    try {
      await apiClient.createGrade({ name: newGrade })
      const gradesData = await apiClient.getGrades()
      setGrades(gradesData)
      setGenerateForm({ ...generateForm, grade: newGrade })
      setNewGrade('')
      setIsAddingNewGrade(false)
      toast({ title: "Success", description: "Grade added successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to add grade", variant: "destructive" })
    }
  }

  const handleGenerateBasedOn = (content: Content) => {
    // Store the base content for context
    setBaseContent(content)
    
    // Pre-fill form with existing content data
    setGenerateForm({
      subject: content.subject,
      topic: content.topic,
      difficulty: content.difficulty,
      type: content.type,
      state: content.state || '',
      schoolType: content.schoolType || '',
      grade: content.grade || '',
      language: content.language || 'English',
      country: content.country || '',
      customPrompt: '',
      provider: 'openai'
    })
    setShowGenerateModal(true)
    setSelectedContent(null) // Close the view modal
  }

  const handleGenerateNew = async () => {
    if (!generateForm.subject || !generateForm.topic) {
      toast({
        title: "Error",
        description: "Subject and topic are required",
        variant: "destructive"
      })
      return
    }

    try {
      setGenerating(true)
      
      // If we have base content, include it in the request
      const requestData = {
        ...generateForm,
        // Add the existing content as context
        existingContent: baseContent ? baseContent.content : undefined,
        customPrompt: baseContent 
          ? `${generateForm.customPrompt || 'Generate similar content with improvements or a different approach.'}\n\n---\n\nExisting content for reference:\n\n${baseContent.content}`
          : generateForm.customPrompt
      }
      
      const data = await apiClient.generateContent(requestData)
      setGeneratedNewContent(data.content)
      setEditableContent(data.content)
      
      toast({
        title: "Success!",
        description: "Content generated. Edit and preview before saving."
      })
    } catch (error) {
      console.error('Error generating content:', error)
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleRefine = async () => {
    if (!refinementPrompt.trim()) return

    try {
      setIsRefining(true)
      
      const requestData = {
        ...generateForm,
        customPrompt: `${refinementPrompt}\n\nCurrent content to refine:\n\n${editableContent}`
      }
      
      const data = await apiClient.generateContent(requestData)
      setEditableContent(data.content)
      setRefinementPrompt('')
      
      toast({
        title: "Refined!",
        description: "Content has been refined based on your instructions"
      })
    } catch (error) {
      console.error('Error refining content:', error)
      toast({
        title: "Error",
        description: "Failed to refine content",
        variant: "destructive"
      })
    } finally {
      setIsRefining(false)
    }
  }

  const handleSaveGeneratedContent = async () => {
    try {
      await apiClient.saveContent({
        title: `${generateForm.subject} - ${generateForm.topic}`,
        content: editableContent,
        subject: generateForm.subject,
        topic: generateForm.topic,
        difficulty: generateForm.difficulty,
        type: generateForm.type,
        state: generateForm.state,
        schoolType: generateForm.schoolType,
        grade: generateForm.grade,
      })
      
      toast({
        title: "Saved!",
        description: "New content saved successfully"
      })
      
      // Reset and close
      setShowGenerateModal(false)
      setGeneratedNewContent('')
      setEditableContent('')
      setRefinementPrompt('')
      setBaseContent(null)
      setGenerateForm({
        subject: '',
        topic: '',
        difficulty: 'beginner',
        type: 'learning-page',
        state: '',
        schoolType: '',
        grade: '',
        language: 'English',
        country: '',
        customPrompt: '',
        provider: 'openai'
      })
      
      // Refresh content list
      const contentsResponse = await apiClient.getContent()
      setContents(contentsResponse)
      setFilteredContents(contentsResponse)
    } catch (error) {
      console.error('Error saving content:', error)
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Content Library</CardTitle>
          <CardDescription>
            View and filter all your generated learning content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by title, topic, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Subject</Label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Content Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="learning-page">Learning Page</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="exercise-with-solution">Exercise with Solution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Difficulty</Label>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Grade</Label>
              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade._id} value={grade.name}>
                      Grade {grade.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">State</Label>
              <Select value={filterState} onValueChange={setFilterState}>
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state._id} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">School Type</Label>
              <Select value={filterSchoolType} onValueChange={setFilterSchoolType}>
                <SelectTrigger>
                  <SelectValue placeholder="All School Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All School Types</SelectItem>
                  {schoolTypes.map((type) => (
                    <SelectItem key={type._id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 lg:col-span-2 flex items-end">
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredContents.length} of {contents.length} items
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredContents.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No content found matching your filters.</p>
              </div>
            ) : (
              filteredContents.map((content) => (
                <Card key={content._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getTypeIcon(content.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {content.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {content.topic}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {content.subject}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {getTypeLabel(content.type)}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {content.difficulty}
                            </span>
                            {content.grade && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Grade {content.grade}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-2 space-y-1">
                            <p>
                              Created {new Date(content.createdAt).toLocaleDateString()} at {new Date(content.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {content.creatorName && (
                              <p className="flex items-center gap-1">
                                <span className="font-medium">By:</span> {content.creatorName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedContent(content)}
                        size="sm"
                        variant="outline"
                        className="ml-4"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-[90vw] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-bold">{selectedContent.title}</h2>
                <p className="text-sm text-gray-600">{selectedContent.topic}</p>
              </div>
              <Button
                onClick={() => setSelectedContent(null)}
                variant="ghost"
                size="sm"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-8 bg-white">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedContent.content) }}
              />
            </div>

            <div className="p-4 border-t bg-gray-50 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {selectedContent.subject}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {selectedContent.difficulty}
                    </span>
                    {selectedContent.grade && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Grade {selectedContent.grade}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    <p>Created: {new Date(selectedContent.createdAt).toLocaleDateString()} at {new Date(selectedContent.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    {selectedContent.creatorName && (
                      <p className="mt-1">Creator: <span className="font-medium">{selectedContent.creatorName}</span></p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleGenerateBasedOn(selectedContent)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Based on This
                  </Button>
                  <Button onClick={() => setSelectedContent(null)} variant="outline">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Based On Modal */}
      {showGenerateModal && !generatedNewContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Generate New Content Based on Existing</h2>
              <Button
                onClick={() => {
                  setShowGenerateModal(false)
                  setGeneratedNewContent('')
                  setEditableContent('')
                  setRefinementPrompt('')
                  setBaseContent(null)
                }}
                variant="ghost"
                size="sm"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={generateForm.subject}
                    onChange={(e) => setGenerateForm({ ...generateForm, subject: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Topic</Label>
                  <Input
                    value={generateForm.topic}
                    onChange={(e) => setGenerateForm({ ...generateForm, topic: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>State (Optional)</Label>
                  {isAddingNewState ? (
                    <div className="flex gap-2">
                      <Input
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
                      value={generateForm.state || 'none'}
                      onValueChange={(value) => {
                        if (value === 'add_new') {
                          setIsAddingNewState(true)
                        } else if (value === 'none') {
                          setGenerateForm({ ...generateForm, state: '' })
                        } else {
                          setGenerateForm({ ...generateForm, state: value })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No state</SelectItem>
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
                  <Label>School Type (Optional)</Label>
                  {isAddingNewSchoolType ? (
                    <div className="flex gap-2">
                      <Input
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
                      value={generateForm.schoolType || 'none'}
                      onValueChange={(value) => {
                        if (value === 'add_new') {
                          setIsAddingNewSchoolType(true)
                        } else if (value === 'none') {
                          setGenerateForm({ ...generateForm, schoolType: '' })
                        } else {
                          setGenerateForm({ ...generateForm, schoolType: value })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select school type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No school type</SelectItem>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Grade (Optional)</Label>
                  {isAddingNewGrade ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter grade"
                        value={newGrade}
                        onChange={(e) => setNewGrade(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGrade())}
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
                      value={generateForm.grade || 'none'}
                      onValueChange={(value) => {
                        if (value === 'add_new') {
                          setIsAddingNewGrade(true)
                        } else if (value === 'none') {
                          setGenerateForm({ ...generateForm, grade: '' })
                        } else {
                          setGenerateForm({ ...generateForm, grade: value })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade (1-12)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No grade</SelectItem>
                        {grades.map((grade) => (
                          <SelectItem key={grade._id} value={grade.name}>
                            {grade.name}
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
                  <Label>Difficulty Level</Label>
                  <Select
                    value={generateForm.difficulty}
                    onValueChange={(value) => setGenerateForm({ ...generateForm, difficulty: value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Content Type</Label>
                  <Select
                    value={generateForm.type}
                    onValueChange={(value) => setGenerateForm({ ...generateForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learning-page">Learning Page</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="exercise-with-solution">Exercise with Solution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>AI Provider</Label>
                  <Select
                    value={generateForm.provider}
                    onValueChange={(value) => setGenerateForm({ ...generateForm, provider: value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Output Language</Label>
                  <Select
                    value={generateForm.language}
                    onValueChange={(value) => setGenerateForm({ ...generateForm, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Italian">Italian</SelectItem>
                      <SelectItem value="Portuguese">Portuguese</SelectItem>
                      <SelectItem value="Dutch">Dutch</SelectItem>
                      <SelectItem value="Polish">Polish</SelectItem>
                      <SelectItem value="Russian">Russian</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Korean">Korean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Country (Optional)</Label>
                  <Select
                    value={generateForm.country || 'none'}
                    onValueChange={(value) => setGenerateForm({ ...generateForm, country: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No country preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No country preference</SelectItem>
                      {Object.entries(countries.getNames('en')).map(([code, name]) => (
                        <SelectItem key={code} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Additional Instructions</Label>
                <textarea
                  className="w-full min-h-[150px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={generateForm.customPrompt}
                  onChange={(e) => setGenerateForm({ ...generateForm, customPrompt: e.target.value })}
                  placeholder="Generate more like this"
                />
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowGenerateModal(false)
                  setGeneratedNewContent('')
                  setEditableContent('')
                  setRefinementPrompt('')
                  setBaseContent(null)
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleGenerateNew} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Preview Modal (matches main generator) */}
      {showGenerateModal && generatedNewContent && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Content Preview</h2>
              <span className="text-sm text-gray-600">Powered by {generateForm.provider === 'openai' ? 'OpenAI' : 'Mistral AI'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setGeneratedNewContent('')
                  setEditableContent('')
                  setRefinementPrompt('')
                }}
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
                <Label htmlFor="editableContentLibrary" className="text-sm font-semibold">Edit Content (Source)</Label>
              </div>
              <textarea
                id="editableContentLibrary"
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
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(editableContent) }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 space-y-3">
            <div>
              <Label htmlFor="refinementPromptLibrary" className="text-sm font-semibold">Refine Content (Optional)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="refinementPromptLibrary"
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
                onClick={handleSaveGeneratedContent} 
                className="flex-1"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save Content
              </Button>
              <Button 
                onClick={() => {
                  setShowGenerateModal(false)
                  setGeneratedNewContent('')
                  setEditableContent('')
                  setRefinementPrompt('')
                  setBaseContent(null)
                }} 
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}