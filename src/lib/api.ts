/**
 * Client-side API utility for communicating with the NestJS Backend.
 * Since we configured Vite proxy, all calls to '/api' will be forwarded to localhost:3000 during development.
 */

export const api = {
  /**
   * Financial Engine Calls
   */
  financial: {
    analyze: async (data: any) => {
      const response = await fetch('/api/financial/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    }
  },

  /**
   * AI Module Calls (Cached)
   */
  ai: {
    ask: async (prompt: string) => {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      return response.json();
    }
  },

  /**
   * Projects CRUD
   */
  projects: {
    create: async (data: any) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    getAll: async () => {
      const response = await fetch('/api/projects');
      return response.json();
    },
    getOne: async (id: string) => {
      const response = await fetch(`/api/projects/${id}`);
      return response.json();
    }
  }
};
