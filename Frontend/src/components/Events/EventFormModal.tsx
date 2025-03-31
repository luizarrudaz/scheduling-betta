import { Dialog } from '@headlessui/react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { Event } from "../Types/Event" 

interface EventFormModalProps {
  isOpen: boolean
  onClose: () => void
  event?: Event | null
}

export default function EventFormModal({ isOpen, onClose, event }: EventFormModalProps) {
  const { 
    register, 
    handleSubmit, 
    watch, 
    reset,
    formState: { errors } 
  } = useForm<Event>({
    defaultValues: event || {
      id: 0,
      nome: '',
      tamanhoSessao: 30,
      pausa: false,
      localidade: '',
      dataInicio: '',
      dataFim: '',
      vagasDisponiveis: 0,
    }
  })
  
  const hasPause = watch('pausa')

  const handleClose = () => {
    onClose()
    reset(event || { 
      nome: '',
      tamanhoSessao: 30,
      localidade: '',
      dataInicio: '',
      dataFim: '',
      pausa: false,
      pausaInicio: '',
      pausaVolta: '',
      vagasDisponiveis: 0,
      id: 0
    })
  }

  const onSubmit = (data: Event) => {
    handleClose()
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
      <motion.div
        layout
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: hasPause ? 0.80 : 0.85, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 20,    
          layout: {
            duration: 0.18,
            ease: 'easeInOut'
          }
        }}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h2
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-gray-800"
          >
            {event ? 'Editar Evento' : 'Novo Evento'}
          </motion.h2>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-7 w-7" />
          </motion.button>
        </div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-2">Nome do Evento *</label>
              <motion.input
                {...register('nome', { required: 'Campo obrigatório' })}
                className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                whileFocus={{ scale: 1.01 }}
              />
              {errors.nome && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs block mt-1"
                >
                  {errors.nome.message}
                </motion.span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Duração (minutos) *</label>
              <motion.input
                type="number"
                {...register('tamanhoSessao', { 
                  required: 'Campo obrigatório',
                  min: { value: 1, message: 'Mínimo 1 minuto' }
                })}
                className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                whileFocus={{ scale: 1.01 }}
              />
              {errors.tamanhoSessao && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs block mt-1"
                >
                  {errors.tamanhoSessao.message}
                </motion.span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Local *</label>
              <motion.input
                {...register('localidade', { required: 'Campo obrigatório' })}
                className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                whileFocus={{ scale: 1.01 }}
              />
              {errors.localidade && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs block mt-1"
                >
                  {errors.localidade.message}
                </motion.span>
              )}
            </div>

            <div className="col-span-2 flex items-center gap-3">
              <motion.input
                type="checkbox"
                {...register('pausa')}
                className="h-5 w-5 text-[#FA7014] rounded focus:ring-[#FA7014]"
                whileTap={{ scale: 0.9 }}
              />
              <label className="text-sm text-gray-600">Incluir pausa programada</label>
            </div>

            {hasPause && (
              <div className="col-span-2 grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Início da Pausa *</label>
                  <motion.input
                    type="time"
                    {...register('pausaInicio', { 
                      required: 'Campo obrigatório',
                      validate: value => !!value && (value < (watch('pausaVolta') || '23:59'))
                    })}
                    className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                    whileFocus={{ scale: 1.01 }}
                  />
                  {errors.pausaInicio && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-xs block mt-1"
                    >
                      {errors.pausaInicio.message}
                    </motion.span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Fim da Pausa *</label>
                  <motion.input
                    type="time"
                    {...register('pausaVolta', { 
                      required: 'Campo obrigatório',
                      validate: value => !!value && (value > (watch('pausaInicio') || '00:00'))
                    })}
                    className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                    whileFocus={{ scale: 1.01 }}
                  />
                  {errors.pausaVolta && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-xs block mt-1"
                    >
                      {errors.pausaVolta.message}
                    </motion.span>
                  )}
                </div>
              </div>
            )}

            <div className="col-span-2 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Data Início *</label>
                <motion.input
                  type="datetime-local"
                  {...register('dataInicio', { 
                    required: 'Campo obrigatório',
                    validate: value => !!value && (value < (watch('dataFim') || '9999-12-31'))
                  })}
                  className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                  whileFocus={{ scale: 1.01 }}
                />
                {errors.dataInicio && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs block mt-1"
                  >
                    {errors.dataInicio.message}
                  </motion.span>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Data Fim *</label>
                <motion.input
                  type="datetime-local"
                  {...register('dataFim', { 
                    required: 'Campo obrigatório',
                    validate: value => !!value && (value > (watch('dataInicio') || '0000-01-01'))
                  })}
                  className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2"
                  whileFocus={{ scale: 1.01 }}
                />
                {errors.dataFim && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-xs block mt-1"
                  >
                    {errors.dataFim.message}
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.92 }}
            className="w-full bg-[#FA7014] text-white py-3 rounded-xl font-semibold hover:bg-[#E55F00] transition-all duration-300 shadow-md"
          >
            {event ? 'Salvar Alterações' : 'Criar Evento'}
          </motion.button>
        </motion.form>
      </motion.div>
    </Dialog>
  )
}