export default {
  schema: './apps/api/prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://cyberlab:cyberlab_secret@localhost:5432/cyberlab_db?schema=public",
  },
};
