"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateServerEnv = validateServerEnv;
exports.validateClientEnv = validateClientEnv;
function validateServerEnv() {
    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://cyberlab:cyberlab_secret@localhost:5432/cyberlab',
        REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
        SESSION_SECRET: process.env.SESSION_SECRET || 'dev_secret_key_change_in_production',
        PORT_API: parseInt(process.env.PORT_API || '4000', 10),
        PORT_ORCHESTRATOR: parseInt(process.env.PORT_ORCHESTRATOR || '5000', 10),
    };
}
function validateClientEnv() {
    return {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
        NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
    };
}
