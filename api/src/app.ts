import express from 'express'
import cors from 'cors'
import transcribeRouter from './routes/transcribe'
import { accountRouter } from './routes/accounts'
import { getProDailyTranscriptionLimit } from './lib/config'

const createApp = () => {
    const dailyLimit = getProDailyTranscriptionLimit()

    const app = express()

    app.use(cors())
    
    app.use(express.json())

    app.get('/health', (_req, res) => {
        res.json({
            ok: true,
            message:'Voice Journal API is running'
        })
    })

    app.use('/transcribe', transcribeRouter)
    app.use('/account', accountRouter)

    return app
}

export {createApp}