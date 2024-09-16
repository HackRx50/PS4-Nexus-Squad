import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | number) {
  const givenDate = new Date(date);
  const now = new Date();
  
  // Calculate the difference in milliseconds, then convert to days
  const diffInMilliseconds = givenDate.getTime() - now.getTime();
  const diffInDays = Math.round(diffInMilliseconds / (1000 * 60 * 60 * 24));

  // If the difference is 2 days or less, use RelativeTimeFormat
  if (Math.abs(diffInDays) <= 2) {
    const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    return relativeFormatter.format(diffInDays, 'day');
  } 

  // If the difference is more than 2 days, use DateTimeFormat to format as '19, Sep 2024'
  const dateFormatter = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  return dateFormatter.format(givenDate);
}
