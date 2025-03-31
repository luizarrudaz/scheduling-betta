export interface Event {
  id: number
  nome: string
  tamanhoSessao: number
  pausa: boolean
  pausaInicio?: string
  pausaVolta?: string
  localidade: string
  dataInicio: string
  dataFim: string
  vagasDisponiveis: number
}