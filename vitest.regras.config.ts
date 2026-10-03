import { defineConfig } from 'vitest/config'

// Testes das regras do Firestore: precisam do emulador (npm run test:regras).
export default defineConfig({
  test: {
    include: ['testes-regras/**/*.test.ts'],
    testTimeout: 20000,
    fileParallelism: false,
  },
})
