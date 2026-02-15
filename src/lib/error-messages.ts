/**
 * Helpful Error Messages Library
 *
 * Constitution-aligned error messages that are:
 * - Conversational and friendly
 * - Explain WHY something is wrong
 * - Provide clear "what to do next" guidance
 * - No intimidating or judgmental language
 * - Encouraging and supportive
 */

export interface HelpfulErrorMessage {
  title: string;
  message: string;
  action?: string;
  variant?: "default" | "destructive" | "warning";
}

export const ErrorMessages = {
  // ========================================
  // Quiz & Learning Errors
  // ========================================
  noAnswerSelected: {
    title: "No answer yet!",
    message:
      "Hmm, looks like you haven't picked an answer yet! Give it a shot - even if you're not sure, taking a guess helps with learning. 🤔",
    action: "Select an answer above and click 'Check Answer'",
    variant: "warning" as const,
  },

  quizAnswerIncorrect: (correctAnswer: string, explanation?: string) => ({
    title: "Not quite!",
    message: explanation
      ? `Close! ${explanation}`
      : `The correct answer is: ${correctAnswer}. Don't worry - making mistakes is how we learn best! 💡`,
    action: explanation ? undefined : "Try creating a flashcard to review this later",
    variant: "default" as const,
  }),

  flashcardCreationFailed: {
    title: "Couldn't create flashcard",
    message:
      "Oops! We had trouble saving that flashcard. This usually happens if there's a connection hiccup.",
    action: "Try again in a moment, or refresh the page if the problem continues",
    variant: "destructive" as const,
  },

  // ========================================
  // Flashcard Errors
  // ========================================
  flashcardsLoadFailed: {
    title: "Couldn't load flashcards",
    message:
      "We're having trouble loading your flashcards right now. This could be a temporary connection issue.",
    action: "Try refreshing the page. If this keeps happening, check your internet connection",
    variant: "destructive" as const,
  },

  noFlashcardsDue: {
    title: "You're all caught up!",
    message:
      "Great work! You don't have any flashcards due for review right now. Check back later, or create some new ones from your learning materials. 🎉",
    action: "Come back later or create new flashcards",
    variant: "default" as const,
  },

  flashcardReviewFailed: {
    title: "Couldn't save your review",
    message: "We weren't able to save your answer. Don't worry - we'll try again automatically.",
    action: "If this keeps happening, refresh the page to reconnect",
    variant: "warning" as const,
  },

  // ========================================
  // Query Builder Errors
  // ========================================
  queryEmpty: {
    title: "Query needs more details",
    message:
      "Hmm, you'll need to add at least one sensor (what to ask about) before running the query. Think of sensors as the questions you want to ask your computers!",
    action: "Click 'Add Sensor' to choose what information you want to get",
    variant: "warning" as const,
  },

  querySyntaxError: (details: string) => ({
    title: "Query syntax needs a tweak",
    message: `Almost there! ${details}. Tanium queries have specific syntax - like grammar rules for talking to computers.`,
    action: "Check the example queries for the correct format",
    variant: "warning" as const,
  }),

  queryExecutionFailed: {
    title: "Couldn't run the query",
    message:
      "We hit a snag trying to run your query. This might be a temporary issue with the demo environment.",
    action: "Try again in a moment. The query itself looks good!",
    variant: "destructive" as const,
  },

  // ========================================
  // Form Validation Errors
  // ========================================
  fieldRequired: (fieldName: string) => ({
    title: `${fieldName} is required`,
    message: `We need your ${fieldName.toLowerCase()} to continue. This helps us keep your account secure and personalized.`,
    action: `Enter your ${fieldName.toLowerCase()} above`,
    variant: "warning" as const,
  }),

  emailInvalid: {
    title: "Email format looks off",
    message:
      "Hmm, that doesn't look like a complete email address. Make sure it has an @ symbol and a domain (like .com or .edu).",
    action: "Try something like: yourname@example.com",
    variant: "warning" as const,
  },

  passwordTooShort: (minLength: number) => ({
    title: "Password needs to be longer",
    message: `For security, passwords need at least ${minLength} characters. Think of it like a stronger lock on your door! 🔐`,
    action: `Add ${minLength - 0} more characters to meet the minimum`,
    variant: "warning" as const,
  }),

  passwordComplexityFailed: {
    title: "Password needs a bit more variety",
    message:
      "For security, your password needs at least 8 characters with a mix of uppercase letters, lowercase letters, and numbers. Think of it like creating a secret code! 🔐",
    action:
      "Make sure your password has all three: uppercase (A-Z), lowercase (a-z), and numbers (0-9)",
    variant: "warning" as const,
  },

  passwordMismatch: {
    title: "Passwords don't match",
    message:
      "The two passwords you entered are different. This happens to everyone - typos are sneaky!",
    action: "Double-check both password fields and make sure they're identical",
    variant: "warning" as const,
  },

  // ========================================
  // Authentication Errors
  // ========================================
  loginFailed: {
    title: "Couldn't log you in",
    message:
      "We couldn't log you in with those credentials. Double-check your email and password - typos happen to everyone!",
    action: "Try again, or click 'Forgot Password' if you need to reset it",
    variant: "destructive" as const,
  },

  sessionExpired: {
    title: "Your session timed out",
    message:
      "For security, we automatically log you out after a period of inactivity. No worries - just log back in to continue!",
    action: "Log in again to pick up where you left off",
    variant: "warning" as const,
  },

  signupFailed: (reason?: string) => ({
    title: "Couldn't create your account",
    message: reason
      ? `We hit a snag: ${reason}. Let's try to fix this together.`
      : "Something went wrong while creating your account. This is usually temporary.",
    action: reason?.includes("email")
      ? "Try using a different email address"
      : "Wait a moment and try again, or contact support if this continues",
    variant: "destructive" as const,
  }),

  // ========================================
  // Admin/Question Editor Errors
  // ========================================
  questionValidationFailed: (issues: string[]) => ({
    title: "Question needs some adjustments",
    message: `Before saving, let's fix these items: ${issues.join(", ")}. These checks help ensure high-quality learning materials!`,
    action: "Review and fix the items above, then try saving again",
    variant: "warning" as const,
  }),

  bulkImportFailed: (successCount: number, failCount: number) => ({
    title: "Import completed with some issues",
    message: `Good news: ${successCount} questions imported successfully! However, ${failCount} couldn't be imported - usually due to formatting issues.`,
    action: "Check the error log below to see which questions need fixing",
    variant: "warning" as const,
  }),

  // ========================================
  // Network & Connection Errors
  // ========================================
  networkError: {
    title: "Connection problem",
    message:
      "We're having trouble connecting right now. Check your internet connection, or if you're online, our servers might be taking a quick break.",
    action: "Try again in a moment. Your work is saved locally!",
    variant: "destructive" as const,
  },

  timeoutError: {
    title: "Request took too long",
    message:
      "That took longer than expected and timed out. This sometimes happens with slow connections or if the server is busy.",
    action: "Try again - it usually works the second time!",
    variant: "warning" as const,
  },

  // ========================================
  // Data/Save Errors
  // ========================================
  saveFailed: (itemType: string) => ({
    title: `Couldn't save ${itemType}`,
    message: `We weren't able to save your ${itemType}. This is usually a temporary glitch.`,
    action: "Try saving again. If this keeps happening, copy your work and refresh the page",
    variant: "destructive" as const,
  }),

  deleteFailed: (itemType: string) => ({
    title: `Couldn't delete ${itemType}`,
    message: `We hit a problem trying to delete that ${itemType}. It might already be gone, or there could be a connection issue.`,
    action: "Refresh the page to see the current state",
    variant: "destructive" as const,
  }),

  // ========================================
  // Generic/Fallback Errors
  // ========================================
  genericError: {
    title: "Something unexpected happened",
    message:
      "We ran into an unexpected issue. This doesn't usually happen! The technical details have been logged.",
    action: "Try what you were doing again. If it keeps happening, let us know!",
    variant: "destructive" as const,
  },
} as const;

/**
 * Helper function to create custom helpful error messages
 */
export function createHelpfulError(
  title: string,
  message: string,
  action?: string,
  variant: "default" | "destructive" | "warning" = "default"
): HelpfulErrorMessage {
  return { title, message, action, variant };
}

/**
 * Convert a technical error into a user-friendly message
 */
export function humanizeError(error: unknown): HelpfulErrorMessage {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return ErrorMessages.networkError;
    }

    // Timeout errors
    if (error.message.includes("timeout") || error.message.includes("timed out")) {
      return ErrorMessages.timeoutError;
    }

    // Generic fallback with error message if helpful
    const isUserFriendly =
      !error.message.includes("undefined") &&
      !error.message.includes("null") &&
      error.message.length < 100;

    return createHelpfulError(
      "Something went wrong",
      isUserFriendly
        ? `We hit a snag: ${error.message}. Don't worry - this is usually fixable!`
        : "We ran into an unexpected issue. The technical details have been logged.",
      "Try again, or refresh the page if the problem continues",
      "destructive"
    );
  }

  // Unknown error type
  return ErrorMessages.genericError;
}
