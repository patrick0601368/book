import mongoose, { Schema, Document } from 'mongoose'

export interface IExercise extends Document {
  title: string
  question: string
  solution: string
  subjectId: string
  userId: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  createdAt: Date
  updatedAt: Date
}

const ExerciseSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  solution: {
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

export default mongoose.models.Exercise || mongoose.model<IExercise>('Exercise', ExerciseSchema)
