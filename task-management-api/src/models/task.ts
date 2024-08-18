import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done';
    project: mongoose.Types.ObjectId; // Reference to the Project
    createdBy: mongoose.Types.ObjectId; // Reference to the User who created the task
}

const TaskSchema: Schema<ITask> = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'done'],
            default: 'todo',
        },
        project: {
            type: Schema.Types.ObjectId, // Use Schema.Types.ObjectId instead of mongoose.Types.ObjectId
            ref: 'Project',
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId, // Use Schema.Types.ObjectId instead of mongoose.Types.ObjectId
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
