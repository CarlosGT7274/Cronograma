import React, { useState, useEffect } from 'react'
import { TareaService, Tarea } from '@/services/tareaService'
import { format } from 'date-fns'

interface Week {
  numero: number
  estado: boolean
}

interface Month {
  mes: string
  semanas: Week[]
}

interface Tarea {
  pos: string
  equipo: string
  area: string
  servicios: string
  programa: string
  meses: Month[]
  status: 'completado' | 'en-progreso' | 'pendiente' | 'no-iniciado'
  description?: string
  comments: Array<{
    text: string
    createdAt: Date
  }>
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Tarea | null
  onSuccess?: () => void
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  initialData = null,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Tarea>({
    pos: '',
    equipo: '',
    area: '',
    servicios: '',
    programa: '2024 - 2025',
    meses: [],
    status: 'no-iniciado',
    description: '',
    comments: []
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleInputChange = (field: keyof Tarea, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMonthChange = (index: number, field: keyof Month, value: any) => {
    setFormData(prev => {
      const newMeses = [...prev.meses]
      newMeses[index] = { ...newMeses[index], [field]: value }
      return { ...prev, meses: newMeses }
    })
  }

  const handleWeekChange = (monthIndex: number, weekIndex: number, estado: boolean) => {
    setFormData(prev => {
      const newMeses = [...prev.meses]
      newMeses[monthIndex].semanas[weekIndex].estado = estado
      return { ...prev, meses: newMeses }
    })
  }

  const addMonth = () => {
    setFormData(prev => ({
      ...prev,
      meses: [
        ...prev.meses,
        {
          mes: '',
          semanas: Array.from({ length: 4 }, (_, i) => ({ 
            numero: i + 1, 
            estado: false 
          }))
        }
      ]
    }))
  }

  const removeMonth = (index: number) => {
    setFormData(prev => ({
      ...prev,
      meses: prev.meses.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (initialData?._id) {
        await TareaService.updateTarea(initialData._id, formData)
        alert('Tarea actualizada correctamente')
      } else {
        await TareaService.createTarea(formData)
        alert('Tarea creada correctamente')
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error al guardar la tarea:', error)
      alert('Error al guardar la tarea')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async (comment: string) => {
    if (!initialData?._id) return

    try {
      await TareaService.addComment(initialData._id, comment)
      const updatedTask = { 
        ...formData,
        comments: [...formData.comments, {
          text: comment,
          createdAt: new Date()
        }]
      }
      setFormData(updatedTask)
    } catch (error) {
      console.error('Error al añadir comentario:', error)
      alert('Error al añadir comentario')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {initialData ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">POS</label>
                <input
                  type="text"
                  value={formData.pos}
                  onChange={(e) => handleInputChange('pos', e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Equipo</label>
                <input
                  type="text"
                  value={formData.equipo}
                  onChange={(e) => handleInputChange('equipo', e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Área</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Servicios</label>
                <input
                  type="text"
                  value={formData.servicios}
                  onChange={(e) => handleInputChange('servicios', e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Programa</label>
                <input
                  type="text"
                  value={formData.programa}
                  onChange={(e) => handleInputChange('programa', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="no-iniciado">No Iniciado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en-progreso">En Progreso</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Meses y Semanas</label>
                <button
                  type="button"
                  onClick={addMonth}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Añadir Mes
                </button>
              </div>
              <div className="space-y-4">
                {formData.meses.map((mes, monthIndex) => (
                  <div key={monthIndex} className="p-4 border rounded-lg">
                    <div className="flex gap-4 mb-2">
                      <div className="flex-1">
                        <input 
                          type="month" 
                          value={mes.mes}
                          onChange={(e) => handleMonthChange(monthIndex, 'mes', e.target.value)}
                          className='w-full px-3 py-2 border rounded-lg'
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMonth(monthIndex)}
                        className="px-3 py-2 text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {mes.semanas.map((semana, weekIndex) => (
                        <div key={weekIndex} className="flex items-center gap-2">
                          <label className="text-sm">Semana {semana.numero}</label>
                          <input
                            type="checkbox"
                            checked={semana.estado}
                            onChange={(e) => handleWeekChange(monthIndex, weekIndex, e.target.checked)}
                            className="h-4 w-4 text-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {initialData?._id && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Comentarios</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.comments.map((comment, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">
                        <span>{format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                      </div>
                      <p className="mt-1">{comment.text}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Añadir comentario..."
                    id="newComment"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement
                        handleAddComment(input.value)
                        input.value = ''
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('newComment') as HTMLInputElement
                      handleAddComment(input.value)
                      input.value = ''
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Añadir
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : initialData?._id ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>        </div>
      </div>
    </div>
  )
}

export default TaskModal
