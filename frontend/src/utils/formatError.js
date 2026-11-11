/**
 * Format any API / Network / Validation error into a clean, human-readable string.
 * Prevents React crash when FastAPI returns an array of validation errors (422).
 */
export const formatErrorMessage = (err) => {
  if (!err) return 'An unexpected error occurred.';
  if (typeof err === 'string') return err;

  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = d.loc ? d.loc[d.loc.length - 1] : 'field';
        return `${field}: ${d.msg}`;
      })
      .join(' | ');
  }

  if (err.message === 'Network Error' || !err.response) {
    return 'Cannot connect to backend server. Please verify the backend is running at http://127.0.0.1:8000.';
  }

  return err.message || 'Failed to submit assessment.';
};

