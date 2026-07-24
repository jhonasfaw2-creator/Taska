import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

const router = Router();

const specPath = path.resolve(__dirname, 'openapi.yaml');
const raw = fs.readFileSync(specPath, 'utf8');
const swaggerDocument = yaml.load(raw) as Record<string, unknown>;

router.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Taska API Docs',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  }),
);

export default router;
