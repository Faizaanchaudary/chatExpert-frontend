import moment from 'moment';

// Get the formatted date for display
export const getFormattedDate = (timeString: string) => {
  const date = moment(timeString, [
    'DD/MM/YYYY, h:mm:ss A',
    'DD/MM/YYYY, HH:mm:ss',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD h:mm:ss A',
    'MM/DD/YYYY, h:mm:ss A',
    'MM/DD/YYYY HH:mm:ss',
  ]);

  if (date.isValid()) {
    return date.format('MMMM D, YYYY');
  }
  return '';
};

// Helper function to format date safely
export const formatMessageTime = (timeString: string | undefined): string => {
  if (!timeString) return '';

  // Try different date formats
  const formats = [
    'DD/MM/YYYY, h:mm:ss A',
    'DD/MM/YYYY, HH:mm:ss',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD h:mm:ss A',
    'MM/DD/YYYY, h:mm:ss A',
    'MM/DD/YYYY HH:mm:ss',
  ];

  for (const format of formats) {
    const date = moment(timeString, format);
    if (date.isValid()) {
      return date.format('hh:mm A');
    }
  }

  // If all parsing attempts fail, try native Date
  try {
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return moment(date).format('hh:mm A');
    }
  } catch (e) {
    console.log('Error parsing date:', e);
  }

  // Return the original string or a placeholder if parsing fails
  return timeString || 'Time N/A';
};

export const getDayFromTime = (timeString: string) => {
  const date = moment(timeString, [
    'DD/MM/YYYY, h:mm:ss A',
    'DD/MM/YYYY, HH:mm:ss',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD h:mm:ss A',
    'MM/DD/YYYY, h:mm:ss A',
    'MM/DD/YYYY HH:mm:ss',
  ]);

  if (date.isValid()) {
    return date.format('YYYY-MM-DD');
  }
  return '';
};
