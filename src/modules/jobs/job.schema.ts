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