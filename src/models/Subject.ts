import mongoose, { Schema, Document } from 'mongoose'

export interface ISubject extends Document {
  name: string
  description: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

const SubjectSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
})

export default mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema)
