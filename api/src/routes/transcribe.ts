import { Router } from 'express'
import path from 'path'
import multer from 'multer'
import { transcribeAudio } from '../services/transcribeService';
import { requirePremium } from '../middleware/requirePremium';

const transcribeRouter = Router()

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || '.m4a'
        cb(null, `${Date.now()}${ext}`)
    }
})

const upload = multer({storage})

transcribeRouter.post("/", requirePremium, upload.single('audio'), async (req, res) => {
    
     if (!req.file) {
       console.log("No file!");

       return res.status(400).json({
         error: "No file uploaded",
       });
     }

  const transcript = await transcribeAudio(req.file.path)

    res.json({
    message: transcript,
  });
});

export default transcribeRouter;