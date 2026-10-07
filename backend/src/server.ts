import { app } from './app';
import { ENV } from './config/env';
import { prisma } from './config/database';

async function bootstrap() {
  try {
    // Verify database connectivity
    await prisma.$connect();
    console.log('[Database] Connected to PostgreSQL successfully.');

    app.listen(ENV.PORT, () => {
      console.log(`[Server] MSME FinTech Backend listening on port ${ENV.PORT}`);
      console.log(`[Server] Health check: http://localhost:${ENV.PORT}/health`);
      console.log(`[Server] Auth endpoints: http://localhost:${ENV.PORT}/api/v1/auth`);
      console.log(`[Server] Product catalog: http://localhost:${ENV.PORT}/api/v1/products`);
    });
  } catch (err) {
    console.error('[Bootstrap Error] Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();
