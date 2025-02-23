import { useState, useCallback } from 'react';
import { z } from 'zod';

type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export const commonSchemas = {
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  collegeId: z.string().min(3, 'Please enter a valid college ID'),
  phoneNumber: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number').optional(),
};

export function useFormValidation<T extends Record<string, unknown>>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});

  const validateField = useCallback(
    (field: keyof T, value: unknown) => {
      try {
        // Validate the value against the schema
        schema.parse({ [field]: value });
        setErrors(prev => ({ ...prev, [field]: undefined }));
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find(err => err.path.includes(field as string))?.message;
          if (fieldError) {
            setErrors(prev => ({ ...prev, [field]: fieldError }));
          }
        }
        return false;
      }
    },
    [schema]
  );

  const validateForm = useCallback(
    (data: unknown) => {
      try {
        schema.parse(data);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: ValidationErrors<T> = {};
          error.errors.forEach((err) => {
            if (err.path[0]) {
              const field = err.path[0] as keyof T;
              newErrors[field] = err.message;
            }
          });
          setErrors(newErrors);
        }
        return false;
      }
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
  };
}
