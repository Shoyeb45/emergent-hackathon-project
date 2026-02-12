import { Router } from 'express';
import signupRoute from './signup';
import signinRoute from './signin';
import signoutRoute from './signout';
import refreshTokenRouter from './token';
import meRoute from './me';
import forgotPasswordRoute from './forgot-password';
import resetPasswordRoute from './reset-password';

const router = Router();

router.use('/signup', signupRoute);
router.use('/signin', signinRoute);
router.use('/signout', signoutRoute);
router.use('/token', refreshTokenRouter);
router.use('/me', meRoute);
router.use('/forgot-password', forgotPasswordRoute);
router.use('/reset-password', resetPasswordRoute);

export default router;
