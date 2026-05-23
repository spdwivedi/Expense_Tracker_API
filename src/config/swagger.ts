export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Expense Tracker API',
    version: '1.0.0',
    description: 'Production-ready REST API documentation for managing personal finances.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter token: Bearer <token>',
      },
    },
  },
  paths: {
    '/api/v1/health': {
      get: {
        summary: 'Health check',
        tags: ['System'],
        responses: {
          200: { description: 'Healthy' }
        }
      }
    },
    '/api/v1/auth/register': {
      post: {
        summary: 'Register user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'S.P. Dwivedi' },
                  email: { type: 'string', example: 'test@spdwivedi.me' },
                  password: { type: 'string', example: 'SecurePass123!' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Created' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'test@spdwivedi.me' },
                  password: { type: 'string', example: 'SecurePass123!' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Authenticated' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/v1/auth/profile': {
      get: {
        summary: 'Get profile',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Success' },
          401: { description: 'Unauthorized' }
        }
      },
      put: {
        summary: 'Update profile',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: { type: 'string', example: 'S.P. Dwivedi' },
                  email: { type: 'string', example: 'test@spdwivedi.me' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Updated' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/v1/auth/change-password': {
      put: {
        summary: 'Change password',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', example: 'SecurePass123!' },
                  newPassword: { type: 'string', example: 'NewSecurePass123!' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Changed' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/v1/auth/logout': {
      post: {
        summary: 'Logout user',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Logged out' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/v1/categories': {
      get: {
        summary: 'List categories',
        tags: ['Categories'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Success' }
        }
      },
      post: {
        summary: 'Create category',
        tags: ['Categories'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Freelance Equipment' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Created' }
        }
      }
    },
    '/api/v1/categories/{id}': {
      put: {
        summary: 'Update category',
        tags: ['Categories'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Updated Category Name' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Updated' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' }
        }
      },
      delete: {
        summary: 'Delete category',
        tags: ['Categories'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Deleted' },
          403: { description: 'Forbidden' },
          404: { description: 'Not found' }
        }
      }
    },
    '/api/v1/transactions': {
      post: {
        summary: 'Create transaction',
        tags: ['Transactions'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'type', 'categoryId', 'date'],
                properties: {
                  amount: { type: 'number', example: 450.50 },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE' },
                  categoryId: { type: 'string', example: 'uuid-string' },
                  date: { type: 'string', format: 'date-time', example: '2026-05-22T12:00:00Z' },
                  note: { type: 'string', example: 'Dinner at restaurant' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Created' }
        }
      },
      get: {
        summary: 'List transactions',
        tags: ['Transactions'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          { in: 'query', name: 'type', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } },
          { in: 'query', name: 'categoryId', schema: { type: 'string' } },
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['date', 'amount'], default: 'date' } },
          { in: 'query', name: 'order', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } }
        ],
        responses: {
          200: { description: 'Success' }
        }
      }
    },
    '/api/v1/transactions/{id}': {
      get: {
        summary: 'Get transaction',
        tags: ['Transactions'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Success' },
          404: { description: 'Not found' }
        }
      },
      put: {
        summary: 'Update transaction',
        tags: ['Transactions'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number', example: 500.00 },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                  categoryId: { type: 'string' },
                  date: { type: 'string', format: 'date-time' },
                  note: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Updated' },
          404: { description: 'Not found' }
        }
      },
      delete: {
        summary: 'Delete transaction',
        tags: ['Transactions'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Deleted' },
          404: { description: 'Not found' }
        }
      }
    },
    '/api/v1/analytics/overview': {
      get: {
        summary: 'Overview stats',
        tags: ['Analytics'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } }
        ],
        responses: {
          200: { description: 'Success' }
        }
      }
    },
    '/api/v1/analytics/category-breakdown': {
      get: {
        summary: 'Category breakdown',
        tags: ['Analytics'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } }
        ],
        responses: {
          200: { description: 'Success' }
        }
      }
    },
    '/api/v1/analytics/month-over-month': {
      get: {
        summary: 'Trend analysis',
        tags: ['Analytics'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'months', schema: { type: 'integer', default: 6 } }
        ],
        responses: {
          200: { description: 'Success' }
        }
      }
    }
  }
};