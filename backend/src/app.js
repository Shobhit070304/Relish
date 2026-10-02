import cors from 'cors';
import express from 'express';
import dishRoutes from './routes/dishRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/dishes', dishRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
