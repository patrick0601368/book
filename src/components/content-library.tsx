'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Search, FileText, BookOpen, ClipboardList, Eye, X } from 'lucide-react'
import { apiClient } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import 'katex/dist/katex.min.css'

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
  createdAt: string
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
  const [contents, setContents] = useState<Content[]>([])
  const [filteredContents, setFilteredContents] = useState<Content[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [states, setStates] = useState<State[]>([])
  const [schoolTypes, setSchoolTypes] = useState<SchoolType[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterState, setFilterState] = useState('all')
  const [filterSchoolType, setFilterSchoolType] = useState('all')
  const [filterGrade, setFilterGrade] = useState('all')

  // Convert LaTeX delimiters to markdown math format
  const convertLatexDelimiters = (content: string) => {
    if (!content) return ''
    
    // First convert display math \[ ... \] to $$ ... $$
    let converted = content.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (match, math) => {
      return '\n\n$$' + math.trim() + '$$\n\n'
    })
    
    // Then convert inline math \( ... \) to $ ... $
    converted = converted.replace(/\\\(\s*(.*?)\s*\\\)/g, (match, math) => {
      return '$' + math.trim() + '$'
    })
    
    return converted
  }

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
                          <p className="text-xs text-gray-500 mt-2">
                            Created {new Date(content.createdAt).toLocaleDateString()}
                          </p>
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
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                >
                  {convertLatexDelimiters(selectedContent.content)}
                </ReactMarkdown>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
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
                <Button onClick={() => setSelectedContent(null)} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
