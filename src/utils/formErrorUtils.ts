import { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { logger } from './logger';

interface ApiResponseWithErrors {
  errors?: Record<string, string>;
  message?: string;
}

export function mapApiErrorsToForm<T extends FieldValues>(
  response: ApiResponseWithErrors,
  setError: UseFormSetError<T>,
  validFields: readonly string[] = [],
  toastError?: (message: string) => void
): boolean {
  if (!response.errors || typeof response.errors !== 'object' || Array.isArray(response.errors)) {
    return false;
  }

  let hasErrors = false;

  try {
    Object.entries(response.errors).forEach(([field, message]) => {
      if (field === 'message') return;
      if (validFields.length === 0 || validFields.includes(field)) {
        setError(field as Path<T>, { message: String(message) });
        hasErrors = true;
      }
    });

    if (hasErrors && toastError) {
      const toastMessage =
        response.message ||
        (typeof response.errors.message === 'string' ? response.errors.message : null) ||
        'Please fix the errors and try again';
      toastError(toastMessage);
    }
  } catch (error) {
    logger.error('mapApiErrorsToForm error:', error);
    if (toastError) {
      toastError('An error occurred while processing the response');
    }
  }

  return hasErrors;
}
