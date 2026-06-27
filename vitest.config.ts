import { defineConfig } from 'vitest/config';

// Unit tests target pure validation/sanitization logic (no DOM needed).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
