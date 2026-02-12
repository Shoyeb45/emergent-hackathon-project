import { Router } from 'express';
import hostedRouter from './hosted';
import invitedRouter from './invited';
import createRouter from './create';
import getAndUpdateRouter from './get';
import eventsRouter from './events';
import guestsRouter from './guests';
import photosRouter from './photos';

const router = Router();

router.use('/hosted', hostedRouter);
router.use('/invited', invitedRouter);
router.use(createRouter);
router.use('/', getAndUpdateRouter);
router.use('/:weddingId/events', eventsRouter);
router.use('/:weddingId/guests', guestsRouter);
router.use('/:weddingId/photos', photosRouter);

export default router;
