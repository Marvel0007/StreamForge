export const getJobSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        minLength: 1,
      },
    },
    additionalProperties: false,
  },
} as const;

export const updateJobStatusSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        minLength: 1,
      },
    },
    additionalProperties: false,
  },
  body: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      },
    },
    additionalProperties: false,
  },
} as const;
