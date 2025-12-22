import { toast as sonnerToast, type ExternalToast } from 'sonner';

export const toast = {
  success: (message: string, options?: ExternalToast) => {
    return sonnerToast.success(message, {
      ...options,
      className: 'group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200 dark:group-[.toaster]:bg-green-900/30 dark:group-[.toaster]:text-green-100 dark:group-[.toaster]:border-green-800',
    });
  },
  error: (message: string, options?: ExternalToast) => {
    return sonnerToast.error(message, {
      ...options,
      className: 'group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200 dark:group-[.toaster]:bg-red-900/30 dark:group-[.toaster]:text-red-100 dark:group-[.toaster]:border-red-800',
    });
  },
  info: (message: string, options?: ExternalToast) => {
    return sonnerToast.info(message, {
      ...options,
      className: 'group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200 dark:group-[.toaster]:bg-blue-900/30 dark:group-[.toaster]:text-blue-100 dark:group-[.toaster]:border-blue-800',
    });
  },
  warning: (message: string, options?: ExternalToast) => {
    return sonnerToast.warning(message, {
      ...options,
      className: 'group-[.toaster]:bg-amber-50 group-[.toaster]:text-amber-900 group-[.toaster]:border-amber-200 dark:group-[.toaster]:bg-amber-900/30 dark:group-[.toaster]:text-amber-100 dark:group-[.toaster]:border-amber-800',
    });
  },
  message: (message: string, options?: ExternalToast) => {
    return sonnerToast(message, options);
  },
  promise: <T,>(
    promise: Promise<T> | (() => Promise<T>),
    options?: Parameters<typeof sonnerToast.promise>[1]
  ) => {
    return sonnerToast.promise(promise, options);
  },
  loading: (message: string, options?: ExternalToast) => {
    return sonnerToast.loading(message, options);
  },
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },
};

