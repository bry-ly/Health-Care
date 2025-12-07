/**
 * Standardized API Response Helpers
 * Provides consistent response format across all API routes
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Create a success response with optional data and message
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): Response {
  const body: ApiResponse<T> = { success: true, data };
  if (message) body.message = message;
  return Response.json(body, { status });
}

/**
 * Create an error response with message and optional status code
 */
export function errorResponse(message: string, status = 400): Response {
  return Response.json({ success: false, error: message } as ApiResponse, {
    status,
  });
}

/**
 * Create a not found response
 */
export function notFoundResponse(resource = "Resource"): Response {
  return errorResponse(`${resource} not found`, 404);
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized"): Response {
  return errorResponse(message, 401);
}

/**
 * Create an internal server error response
 */
export function serverErrorResponse(error?: unknown): Response {
  console.error("Server Error:", error);
  return errorResponse("Internal server error", 500);
}
