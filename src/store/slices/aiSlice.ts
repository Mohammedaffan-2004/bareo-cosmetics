import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AiConsultation } from '@/types'
import { aiService } from '@/services/aiService'

export interface AiState {
  consultations: AiConsultation[]
  isAnalyzing: boolean
  error: string | null
}

const initialState: AiState = {
  consultations: [],
  isAnalyzing: false,
  error: null,
}

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setAnalyzing(state, action: PayloadAction<boolean>) {
      state.isAnalyzing = action.payload
    },
    saveConsultation(state, action: PayloadAction<AiConsultation>) {
      const exists = state.consultations.some((c) => c.id === action.payload.id)
      if (!exists) state.consultations.unshift(action.payload)
    },
    removeConsultation(state, action: PayloadAction<string>) {
      state.consultations = state.consultations.filter((c) => c.id !== action.payload)
    },
    setAiError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
  },
})

export const { setAnalyzing, saveConsultation, removeConsultation, setAiError } = aiSlice.actions

/** Runs the full analysis pipeline with selfie image telemetry and stores the consultation. */
export function runAnalysis(answers: AiConsultation['answers'], selfieSrc?: string | null) {
  return async (dispatch: (action: unknown) => void) => {
    dispatch(setAnalyzing(true))
    dispatch(setAiError(null))
    try {
      const consultation = await aiService().analyzeSkin(answers, selfieSrc)
      dispatch(saveConsultation(consultation))
      return consultation
    } catch (err) {
      dispatch(setAiError((err as Error).message ?? 'Analysis failed'))
      return null
    } finally {
      dispatch(setAnalyzing(false))
    }
  }
}

export default aiSlice.reducer
