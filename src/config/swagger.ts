import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Library Microservice API',
      version: '1.0.0',
      description: 'API REST de gestion de bibliothèque numérique — M1 Architecture Logicielle',
    },
    servers: [{ url: 'http://localhost:8080', description: 'Local' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Book: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Clean Code' },
            author: { type: 'string', example: 'Robert C. Martin' },
            isbn: { type: 'string', example: '978-0132350884' },
            available: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Borrow: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            bookId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            borrowedAt: { type: 'string', format: 'date-time' },
            returnedAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['success', 'error'] },
            message: { type: 'string' },
            data: {},
          },
        },
      },
    },
    paths: {
      '/api/v1/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Inscription',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Utilisateur créé' },
            '400': { description: 'Champs manquants' },
            '409': { description: 'Email déjà utilisé' },
          },
        },
      },
      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Connexion (JWT)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Token JWT retourné' },
            '400': { description: 'Champs manquants' },
            '401': { description: 'Identifiants invalides' },
          },
        },
      },
      '/api/v1/books': {
        get: {
          tags: ['Books'],
          summary: 'Liste paginée des livres',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'size', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'title', in: 'query', schema: { type: 'string' } },
            { name: 'author', in: 'query', schema: { type: 'string' } },
            { name: 'available', in: 'query', schema: { type: 'boolean' } },
          ],
          responses: { '200': { description: 'Liste des livres' } },
        },
        post: {
          tags: ['Books'],
          summary: 'Créer un livre (ADMIN)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'author', 'isbn'],
                  properties: {
                    title: { type: 'string' },
                    author: { type: 'string' },
                    isbn: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Livre créé' },
            '401': { description: 'Non authentifié' },
            '403': { description: 'Rôle insuffisant' },
          },
        },
      },
      '/api/v1/books/{id}': {
        get: {
          tags: ['Books'],
          summary: "Détail d'un livre",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Livre trouvé' }, '404': { description: 'Non trouvé' } },
        },
        put: {
          tags: ['Books'],
          summary: 'Modifier un livre (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    author: { type: 'string' },
                    isbn: { type: 'string' },
                    available: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'Livre modifié' }, '404': { description: 'Non trouvé' } },
        },
        delete: {
          tags: ['Books'],
          summary: 'Supprimer un livre (ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Livre supprimé' }, '404': { description: 'Non trouvé' } },
        },
      },
      '/api/v1/books/{id}/borrow': {
        post: {
          tags: ['Borrows'],
          summary: 'Emprunter un livre',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '201': { description: 'Livre emprunté' },
            '409': { description: 'Livre indisponible' },
          },
        },
      },
      '/api/v1/books/{id}/return': {
        post: {
          tags: ['Borrows'],
          summary: 'Retourner un livre',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            '200': { description: 'Livre retourné' },
            '404': { description: 'Emprunt non trouvé' },
          },
        },
      },
      '/health': {
        get: {
          tags: ['Monitoring'],
          summary: 'Health check',
          responses: { '200': { description: 'Service UP' } },
        },
      },
      '/metrics': {
        get: {
          tags: ['Monitoring'],
          summary: 'Métriques Prometheus',
          responses: { '200': { description: 'Métriques au format text/plain' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
