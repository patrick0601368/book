import mongoose, { Schema, Document } from 'mongoose'

export interface ILearningPage extends Document {
  title: string
  content: string
  subjectId: string
  userId: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  createdAt: Date
  updatedAt: Date
}

const LearningPageSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  subjectId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
}, {
  timestamps: true,
})

export default mongoose.models.LearningPage || mongoose.model<ILearningPage>('LearningPage', LearningPageSchema)
