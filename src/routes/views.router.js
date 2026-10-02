import { Router } from 'express';
import { renderServices } from '../controllers/views.controller.js';

const router = Router();

router.get('/services', renderServices);

export default router;
