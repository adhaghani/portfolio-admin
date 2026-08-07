// ---------------------------------------------------------------------------
// User-safe error message extraction
// ---------------------------------------------------------------------------

/**
 * Returns a user-safe error message, hiding internal details in production.
 * In development, the raw error message is returned for debugging.
 *
 * Usage:
 *   catch (err) {
 *     toast.error(getErrorMessage(err, "Failed to save"))
 *   }
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : ""

  // Log the full error for debugging in development
  if (process.env.NODE_ENV === "development" && raw) {
    console.error("[Error]", raw)
  }

  if (process.env.NODE_ENV === "production") {
    // Map known Supabase error patterns to user-friendly messages
    if (raw.includes("Invalid login credentials")) {
      return "Invalid email or password."
    }
    if (raw.includes("duplicate key") || raw.includes("already exists")) {
      return "An item with this identifier already exists."
    }
    if (raw.includes("JWT") || raw.includes("token") || raw.includes("session")) {
      return "Your session has expired. Please log in again."
    }
    if (raw.includes("row-level security") || raw.includes("permission")) {
      return "You don't have permission to perform this action."
    }
    if (raw.includes("network") || raw.includes("fetch")) {
      return "A network error occurred. Please check your connection."
    }
    // Always return the generic fallback in production
    return fallback
  }

  // Development: return the actual message for debugging, fallback if empty
  return raw || fallback
}
