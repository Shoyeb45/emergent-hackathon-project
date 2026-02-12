import { Router } from 'express';

import healthRoutes from './health/index.js';
import authRoutes from './auth';
import weddingRoutes from './weddings/index.js';
import eventsRoutes from './events/index.js';
import inviteRoutes from './invite/index.js';
import rsvpRoutes from './rsvp/index.js';
import photoRoutes from './photos/index.js';
import internalRoutes from './internal/index.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/weddings', weddingRoutes);
router.use('/events', eventsRoutes);
router.use('/invite', inviteRoutes);
router.use('/rsvp', rsvpRoutes);
router.use('/photos', photoRoutes);
router.use('/internal', internalRoutes);

export default router;
