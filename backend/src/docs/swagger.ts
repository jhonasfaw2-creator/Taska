import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

const router = Router();

const possiblePaths = [
  path.resolve(__dirname, 'openapi.yaml'),
  path.resolve(__dirname, '../../src/docs/openapi.yaml'),
];

let specPath = '';
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    specPath = p;
    break;
  }
}

if (specPath) {
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
} else {
  router.get('/', (_req: Request, res: Response) => {
    res.status(503).json({ error: 'API documentation not available' });
  });
}

export default router;
