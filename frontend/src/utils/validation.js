// Validation Utilities
export const isEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isPasswordStrong = (password) => {
  return password && password.length >= 8;
};

export const validateProjectName = (name) => {
  if (!name || name.trim().length === 0) return 'Project name is required';
  if (name.length < 3) return 'Project name must be at least 3 characters';
  if (name.length > 100) return 'Project name must be less than 100 characters';
  return null;
};

export const validateRepositoryUrl = (url) => {
  try {
    new URL(url);
    if (!url.includes('github.com') && !url.includes('gitlab.com') && !url.includes('bitbucket.org')) {
      return 'URL must be from GitHub, GitLab, or Bitbucket';
    }
    return null;
  } catch {
    return 'Invalid URL format';
  }
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!isEmail(email)) return 'Invalid email format';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

export const validateLoginForm = (email, password) => {
  const errors = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  
  if (!password) errors.password = 'Password is required';
  return errors;
};

export const validateSignupForm = (name, email, password, confirmPassword) => {
  const errors = {};
  
  if (!name || name.trim().length === 0) errors.name = 'Name is required';
  
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  
  const confirmPasswordError = validatePasswordMatch(password, confirmPassword);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  return errors;
};
