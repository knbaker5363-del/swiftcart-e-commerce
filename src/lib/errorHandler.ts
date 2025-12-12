// Centralized Error Handler with Arabic Messages

interface ErrorMessage {
  title: string;
  description: string;
}

// Map of common error codes/messages to Arabic translations
const errorMap: Record<string, ErrorMessage> = {
  // Authentication errors
  'Invalid login credentials': {
    title: '❌ بيانات غير صحيحة',
    description: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من البيانات وحاول مرة أخرى'
  },
  'invalid_credentials': {
    title: '❌ بيانات غير صحيحة',
    description: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
  },
  'User already registered': {
    title: '📧 البريد موجود مسبقاً',
    description: 'هذا البريد الإلكتروني مستخدم. جرب تسجيل الدخول بدلاً من إنشاء حساب جديد'
  },
  'Email already registered': {
    title: '📧 البريد موجود مسبقاً',
    description: 'هذا البريد الإلكتروني مستخدم بالفعل'
  },
  'duplicate key value violates unique constraint': {
    title: '📧 البريد موجود مسبقاً',
    description: 'هذا البريد الإلكتروني أو الحساب مسجل بالفعل'
  },
  'Email not confirmed': {
    title: '📧 البريد غير مؤكد',
    description: 'يرجى تأكيد بريدك الإلكتروني أولاً'
  },
  'Password should be at least 6 characters': {
    title: '🔒 كلمة المرور قصيرة',
    description: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
  },
  'Invalid email': {
    title: '📧 بريد إلكتروني غير صالح',
    description: 'يرجى إدخال بريد إلكتروني صحيح'
  },
  
  // Network errors
  'Network request failed': {
    title: '⚠️ مشكلة في الاتصال',
    description: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى'
  },
  'Failed to fetch': {
    title: '⚠️ مشكلة في الاتصال',
    description: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى'
  },
  'NetworkError': {
    title: '⚠️ انقطاع في الاتصال',
    description: 'يبدو أن اتصالك بالإنترنت غير مستقر'
  },
  'TypeError: Failed to fetch': {
    title: '⚠️ مشكلة في الاتصال',
    description: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى'
  },
  
  // Database/Stock errors
  'Not enough stock': {
    title: '😔 المنتج نفذ من المخزون',
    description: 'هذا المنتج غير متوفر حالياً بالكمية المطلوبة'
  },
  'out of stock': {
    title: '😔 المنتج غير متوفر',
    description: 'هذا المنتج نفذ من المخزون'
  },
  
  // Rate limiting
  'rate limit exceeded': {
    title: '⏳ يرجى الانتظار',
    description: 'لقد أرسلت طلبات كثيرة. يرجى الانتظار قليلاً'
  },
  
  // Server errors
  '500': {
    title: '⚠️ خطأ في الخادم',
    description: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً'
  },
  '503': {
    title: '⚠️ الخدمة غير متاحة',
    description: 'الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً'
  },
  '404': {
    title: '❌ غير موجود',
    description: 'العنصر المطلوب غير موجود'
  },
  '401': {
    title: '🔒 غير مصرح',
    description: 'يرجى تسجيل الدخول للمتابعة'
  },
  '403': {
    title: '🚫 غير مسموح',
    description: 'ليس لديك صلاحية للوصول إلى هذا المحتوى'
  },
  
  // Generic
  'Something went wrong': {
    title: '❌ حدث خطأ',
    description: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى'
  },
};

/**
 * Get Arabic error message from error object
 */
export const getArabicErrorMessage = (error: any): ErrorMessage => {
  if (!error) {
    return {
      title: '❌ حدث خطأ',
      description: 'يرجى المحاولة مرة أخرى لاحقاً'
    };
  }

  // Extract error message from various formats
  const errorMessage = 
    error?.message || 
    error?.error_description || 
    error?.error?.message ||
    error?.code ||
    (typeof error === 'string' ? error : '');

  // Check for exact match first
  if (errorMap[errorMessage]) {
    return errorMap[errorMessage];
  }

  // Check for partial match
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Check for HTTP status codes
  const statusCode = error?.status || error?.code;
  if (statusCode && errorMap[String(statusCode)]) {
    return errorMap[String(statusCode)];
  }

  // Default fallback with the original message if available
  return {
    title: '❌ حدث خطأ',
    description: errorMessage || 'يرجى المحاولة مرة أخرى لاحقاً'
  };
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  const message = error?.message || '';
  return (
    message.includes('Network') ||
    message.includes('fetch') ||
    message.includes('Failed to fetch') ||
    error?.name === 'NetworkError'
  );
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: any): boolean => {
  const message = error?.message || '';
  const code = error?.status || error?.code;
  return (
    code === 401 ||
    code === 403 ||
    message.includes('credentials') ||
    message.includes('unauthorized') ||
    message.includes('authenticated')
  );
};
