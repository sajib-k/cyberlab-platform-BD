export interface ServerEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  REDIS_URL: string;
  SESSION_SECRET: string;
  PORT_API: number;
  PORT_ORCHESTRATOR: number;
}

export interface ClientEnv {
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_WEB_URL: string;
}

export function validateServerEnv(): ServerEnv {
  return {
    NODE_ENV: (process.env.NODE_ENV as ServerEnv['NODE_ENV']) || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://cyberlab:cyberlab_secret@localhost:5432/cyberlab',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    SESSION_SECRET: process.env.SESSION_SECRET || 'dev_secret_key_change_in_production',
    PORT_API: parseInt(process.env.PORT_API || '4000', 10),
    PORT_ORCHESTRATOR: parseInt(process.env.PORT_ORCHESTRATOR || '5000', 10),
  };
}

export function validateClientEnv(): ClientEnv {
  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
  };
}
