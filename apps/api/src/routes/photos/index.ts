import { Router } from 'express';
import myPhotosRouter from './my-photos';
import faceSampleRouter from './face-sample';

const router = Router();

router.use('/my-photos', myPhotosRouter);
router.use('/face-sample', faceSampleRouter);

export default router;
