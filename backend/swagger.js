/**
 * OpenAPI 3.0 Specification and Interactive Swagger UI for CampusConnect
 */

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'CampusConnect REST API',
    version: '1.0.0',
    description:
      'Interactive API documentation for the CampusConnect campus communication mobile application backend. Test all endpoints directly in real time using the **"Try it out"** buttons below.',
    contact: {
      name: 'Shreyash Golhani',
      email: 'shreyashgolhani@gmail.com',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Current Server Environment (Local or Vercel)',
    },
  ],
  tags: [
    { name: 'System', description: 'Health check and server diagnostic endpoints' },
    { name: 'Users', description: 'Student & faculty directory, profiles' },
    { name: 'Conversations', description: 'Direct messages (DM) and campus group chats' },
    { name: 'Messages', description: 'Chat message threads, text & photo messaging' },
  ],
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'Health check and service discovery',
        description: 'Returns backend server status, active version, and available resource routes.',
        responses: {
          200: {
            description: 'Server is healthy and online',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'online' },
                    app: { type: 'string', example: 'CampusConnect Backend API' },
                    version: { type: 'string', example: '1.0.0' },
                    documentation: { type: 'string', example: '/docs' },
                    endpoints: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['/docs', '/user', '/user/profile', '/conversation', '/message'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/user': {
      get: {
        tags: ['Users'],
        summary: 'List all campus directory users',
        description: 'Retrieves all registered students and faculty members in the campus network.',
        responses: {
          200: {
            description: 'Array of user profiles',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
                example: [
                  { id: 1, name: 'Prof. Vaibhav Chawla', bio: 'Computer Science Department • Faculty Lead' },
                  { id: 2, name: 'Shreyash Golhani', bio: '3rd Year CSE • CampusConnect Lead Developer' },
                  { id: 3, name: 'Aarav Sharma', bio: 'Class Representative • Mobile Application Dev' },
                  { id: 4, name: 'Priya Patel', bio: 'Tech Club Secretary • AI & Data Science' },
                  { id: 5, name: 'Rohan Verma', bio: 'Newton School of Technology • CSE Batch 2026' },
                ],
              },
            },
          },
        },
      },
    },
    '/user/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get individual user profile',
        description: 'Fetches details and bio for a specific user by their user ID.',
        parameters: [
          {
            name: 'user_id',
            in: 'query',
            required: true,
            description: 'Unique numeric ID of the user',
            schema: { type: 'integer', example: 2 },
          },
        ],
        responses: {
          200: {
            description: 'User profile details found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
                example: {
                  id: 2,
                  name: 'Shreyash Golhani',
                  bio: '3rd Year CSE • CampusConnect Lead Developer',
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'User not found' },
              },
            },
          },
        },
      },
    },
    '/conversation': {
      get: {
        tags: ['Conversations'],
        summary: 'List all conversations',
        description: 'Retrieves all campus group chats and direct message threads.',
        responses: {
          200: {
            description: 'Array of active conversations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Conversation' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Conversations'],
        summary: 'Create a new conversation (DM or Campus Group)',
        description: 'Creates a new group conversation or direct chat with specified participant IDs.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateConversationRequest' },
              example: {
                type: 'GROUP',
                name: 'Algorithms & Data Structures Study Group',
                participants_ids: [1, 2, 3],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Conversation created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Conversation' },
              },
            },
          },
          400: {
            description: 'Missing required fields or invalid participant list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'type and participants_ids are required' },
              },
            },
          },
        },
      },
    },
    '/message': {
      get: {
        tags: ['Messages'],
        summary: 'Fetch message history for a conversation',
        description: 'Retrieves all chronologically ordered messages in a given conversation thread.',
        parameters: [
          {
            name: 'conversation_id',
            in: 'query',
            required: true,
            description: 'Numeric ID of the conversation',
            schema: { type: 'integer', example: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Thread messages wrapped in a data property',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Message' },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Missing conversation_id query parameter',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'conversation_id is required' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Messages'],
        summary: 'Send a new text or photo message',
        description: 'Sends a message to a conversation. Supports text content, Base64 image payload, or both.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendMessageRequest' },
              example: {
                conversation_id: 1,
                content: 'Hello everyone! Please remember to review the viva notes before tomorrow.',
                imageInfo: null,
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Message sent and appended to thread',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          400: {
            description: 'Validation failed (missing conversation_id, or neither content nor image provided)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'content or imageInfo is required' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 2 },
          name: { type: 'string', example: 'Shreyash Golhani' },
          bio: { type: 'string', example: '3rd Year CSE • CampusConnect Lead Developer' },
        },
      },
      Conversation: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: '📢 Campus Notices & Announcements' },
          type: { type: 'string', enum: ['DM', 'GROUP'], example: 'GROUP' },
          createdBy: { type: 'integer', example: 1 },
          participants_ids: {
            type: 'array',
            items: { type: 'integer' },
            example: [1, 2, 3, 4, 5],
          },
        },
      },
      CreateConversationRequest: {
        type: 'object',
        required: ['type', 'participants_ids'],
        properties: {
          type: { type: 'string', enum: ['DM', 'GROUP'], example: 'GROUP' },
          name: { type: 'string', example: 'CSE Final Year Project Group' },
          participants_ids: {
            type: 'array',
            items: { type: 'integer' },
            example: [1, 2, 3],
          },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          conversation_id: { type: 'integer', example: 1 },
          content: { type: 'string', nullable: true, example: 'Welcome to CampusConnect!' },
          imageInfo: {
            type: 'object',
            nullable: true,
            properties: {
              uri: { type: 'string', example: 'data:image/jpeg;base64,...' },
              width: { type: 'integer', example: 1080 },
              height: { type: 'integer', example: 720 },
            },
          },
          senderId: { type: 'integer', example: 2 },
          createdAt: { type: 'string', format: 'date-time', example: '2026-11-23T14:00:00.000Z' },
        },
      },
      SendMessageRequest: {
        type: 'object',
        required: ['conversation_id'],
        properties: {
          conversation_id: { type: 'integer', example: 1 },
          content: { type: 'string', nullable: true, example: 'Hi Professor!' },
          imageInfo: {
            type: 'object',
            nullable: true,
            properties: {
              uri: { type: 'string', example: 'data:image/jpeg;base64,...' },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Resource not found' },
        },
      },
    },
  },
};

/**
 * Returns complete interactive Swagger UI HTML
 */
function getSwaggerHtml(spec) {
  const specJson = JSON.stringify(spec);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CampusConnect API Interactive Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .custom-header {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      color: #ffffff;
      padding: 24px 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .custom-header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .custom-header .badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 500;
    }
    .custom-header .links a {
      color: #ffffff;
      text-decoration: none;
      background: rgba(255, 255, 255, 0.15);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.2s;
    }
    .custom-header .links a:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    .swagger-ui .topbar {
      display: none !important;
    }
    .swagger-ui {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    .swagger-ui .info {
      margin: 20px 0;
    }
    .swagger-ui .info .title {
      color: #0f172a;
    }
  </style>
</head>
<body>
  <header class="custom-header">
    <div>
      <h1>🎓 CampusConnect REST API <span class="badge">OpenAPI 3.0</span></h1>
      <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">
        Interactive endpoints console • Test requests directly in your browser
      </p>
    </div>
    <div class="links">
      <a href="/openapi.json" target="_blank">📄 Raw OpenAPI JSON</a>
      <a href="/" target="_blank">🩺 Health Check</a>
    </div>
  </header>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const spec = ${specJson};
      
      // Point dynamically to current host for "Try it out"
      spec.servers = [
        {
          url: window.location.origin,
          description: 'Current API Host'
        }
      ];

      window.ui = SwaggerUIBundle({
        spec: spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        docExpansion: "list",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true
      });
    };
  </script>
</body>
</html>`;
}

module.exports = {
  openApiSpec,
  getSwaggerHtml,
};
