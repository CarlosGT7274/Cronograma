import mongoose from 'mongoose'

const TareaSchema = new mongoose.Schema({
  pos: { type: String, required: true },
  equipo: { type: String, required: true },
  area: { type: String, required: true },
  servicios: { type: String, required: true },
  programa: { type: String, default: '2024 - 2025' },
  meses: [{
    mes: { type: String, required: true },
    semanas: [{ 
      numero: { type: Number, required: true },
      estado: { type: Boolean, default: false }
    }]
  }],
  status: {
    type: String,
    enum: ['completado', 'en-progreso', 'pendiente', 'no-iniciado'],
    required: true
  },
  description: { type: String },
  comments: [{
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.models.Tarea ||
  mongoose.model('Tarea', TareaSchema)
