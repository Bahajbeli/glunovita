import express from 'express';
import fs from 'fs';
import path from 'path';
import upload, { declarationUpload } from '../middleware/upload.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateDeclarationFiles } from '../services/celiacDocumentAI.service.js';

const router = express.Router();

const uploadsAbsDir = path.join(process.cwd(), 'public', 'uploads');

router.post('/', authenticate, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Aucun fichier téléchargé.' });
    }

    // Return the path relative to public
    const filePath = `/uploads/${req.file.filename}`;
    res.status(200).json({
        success: true,
        url: filePath
    });
});

/** Pièces jointes déclaration (PDF, JPG, PNG) — max 15 fichiers + validation locale (OCR / PDF / score médical) */
router.post(
    '/declaration',
    authenticate,
    declarationUpload.array('files', 15),
    async (req, res, next) => {
        try {
            if (!req.files?.length) {
                return res.status(400).json({ success: false, message: 'Aucun fichier téléchargé.' });
            }

            const fileInfos = req.files.map((f) => ({
                path: path.join(uploadsAbsDir, f.filename),
                mimetype: f.mimetype,
                originalname: f.originalname
            }));

            const validation = await validateDeclarationFiles(fileInfos);
            if (!validation.ok) {
                for (const f of fileInfos) {
                    try {
                        fs.unlinkSync(f.path);
                    } catch {
                        /* ignore */
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: validation.message,
                    details: validation.details
                });
            }

            const urls = req.files.map((f) => `/uploads/${f.filename}`);
            res.status(200).json({
                success: true,
                urls,
                validation: validation.summary
            });
        } catch (err) {
            next(err);
        }
    }
);

export default router;
