// API Utilities
export const handleApiError = (error) => {
  if (!error) return 'An unknown error occurred';

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return 'Session expired. Please login again.';
    }

    if (status === 403) {
      return 'You do not have permission to perform this action.';
    }

    if (status === 404) {
      return 'Resource not found.';
    }

    if (status === 422) {
      return data?.message || 'Invalid input data. Please check and try again.';
    }

    if (status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }

    if (status === 500) {
      return 'Server error. Please try again later.';
    }

    return data?.message || `Error: ${status}`;
  }

  if (error.request) {
    return 'No response from server. Please check your internet connection.';
  }

  return error.message || 'An error occurred';
};

export const isApiError = (error) => {
  return error?.response || error?.request;
};

export const getApiErrorStatus = (error) => {
  return error?.response?.status || null;
};

export const getApiErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Unknown error';
};

export const formatApiError = (error) => {
  return {
    message: handleApiError(error),
    status: getApiErrorStatus(error),
    isNetworkError: !!error?.request && !error?.response,
    isServerError: getApiErrorStatus(error) >= 500,
  };
};
