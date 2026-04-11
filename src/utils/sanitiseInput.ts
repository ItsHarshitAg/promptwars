import DOMPurify from 'dompurify';

export const sanitiseInput = (input: string): string => {
  if (!input) return "";
  
  // Strip HTML using DOMPurify
  const sanitised = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }); // strip all tags
  
  // Truncate to 500 characters
  return sanitised.slice(0, 500);
};
