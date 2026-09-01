export const createFileSchema = {
  body: {
    type: "object",
    required: ["userId", "originalName", "storageKey", "mimeType", "size"],
    properties: {
      userId: {
        type: "string",
        minLength: 1,
      },
      originalName: {
        type: "string",
        minLength: 1,
        maxLength: 255,
      },
      storageKey: {
        type: "string",
        minLength: 1,
        maxLength: 1024,
      },
      mimeType: {
        type: "string",
        minLength: 1,
        maxLength: 255,
      },
      size: {
        type: "integer",
        minimum: 1,
      },
    },
    additionalProperties: false,
  },
} as const;

export const listFilesSchema = {
  querystring: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: {
        type: "string",
        minLength: 1,
      },
      limit: {
        type: "integer",
        minimum: 1,
      },
      cursor: {
        type: "string",
        minLength: 1,
      },
    },
    additionalProperties: false,
  },
} as const;

export const fileOwnershipSchema = {
  querystring: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: {
        type: "string",
        minLength: 1,
      },
    },
    additionalProperties: false,
  },
} as const;
