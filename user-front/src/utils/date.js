export const addOrSubtractDaysFromDate = (days, add, startingDate = new Date()) => {
  if (add) return new Date(new Date().setDate(startingDate.getDate() + days));else return new Date(new Date().setDate(startingDate.getDate() - days));
};
export const addOrSubtractMinutesFromDate = (minutes, add, startingDate = new Date()) => {
  if (add) return new Date(new Date().setMinutes(startingDate.getMinutes() + minutes));else return new Date(new Date().setMinutes(startingDate.getMinutes() - minutes));
};
export const timeSince = date => {
  if (typeof date !== 'object') {
    date = new Date(date);
  }
  const seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);
  let interval = 0;
  let intervalType = '';
  const intervals = {
    year: 31536000,
    month: 2592000,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  for (const [key, value] of Object.entries(intervals)) {
    interval = Math.floor(seconds / value);
    if (interval >= 1) {
      intervalType = key;
      break;
    }
  }
  if (interval > 1 || interval === 0) {
    intervalType += 's';
  }
  return `${interval} ${intervalType} ago`;
};

export const timeSinceTurkish = date => {
  if (typeof date !== 'object') {
    date = new Date(date);
  }
  const seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);
  let interval = 0;
  let intervalType = '';
  
  if (seconds < 60) {
    return 'Az önce';
  } else if (seconds < 3600) {
    interval = Math.floor(seconds / 60);
    intervalType = interval === 1 ? 'dakika' : 'dakika';
    return `${interval} ${intervalType} önce`;
  } else if (seconds < 86400) {
    interval = Math.floor(seconds / 3600);
    intervalType = interval === 1 ? 'saat' : 'saat';
    return `${interval} ${intervalType} önce`;
  } else if (seconds < 2592000) {
    interval = Math.floor(seconds / 86400);
    intervalType = interval === 1 ? 'gün' : 'gün';
    return `${interval} ${intervalType} önce`;
  } else if (seconds < 31536000) {
    interval = Math.floor(seconds / 2592000);
    intervalType = interval === 1 ? 'ay' : 'ay';
    return `${interval} ${intervalType} önce`;
  } else {
    interval = Math.floor(seconds / 31536000);
    intervalType = interval === 1 ? 'yıl' : 'yıl';
    return `${interval} ${intervalType} önce`;
  }
};

// Multilingual time since function
export const getTimeSince = (date, t, locale = 'tr') => {
  if (typeof date !== 'object') {
    date = new Date(date);
  }
  const seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);
  let interval = 0;
  
  if (seconds < 60) {
    return t('time.justNow');
  } else if (seconds < 3600) {
    interval = Math.floor(seconds / 60);
    // Check if we need plural form (for English)
    const key = interval === 1 ? 'time.minuteAgo' : (t('time.minutesAgo') !== 'time.minutesAgo' ? 'time.minutesAgo' : 'time.minuteAgo');
    return `${interval} ${t(key)}`;
  } else if (seconds < 86400) {
    interval = Math.floor(seconds / 3600);
    const key = interval === 1 ? 'time.hourAgo' : (t('time.hoursAgo') !== 'time.hoursAgo' ? 'time.hoursAgo' : 'time.hourAgo');
    return `${interval} ${t(key)}`;
  } else if (seconds < 2592000) {
    interval = Math.floor(seconds / 86400);
    const key = interval === 1 ? 'time.dayAgo' : (t('time.daysAgo') !== 'time.daysAgo' ? 'time.daysAgo' : 'time.dayAgo');
    return `${interval} ${t(key)}`;
  } else if (seconds < 31536000) {
    interval = Math.floor(seconds / 2592000);
    const key = interval === 1 ? 'time.monthAgo' : (t('time.monthsAgo') !== 'time.monthsAgo' ? 'time.monthsAgo' : 'time.monthAgo');
    return `${interval} ${t(key)}`;
  } else {
    interval = Math.floor(seconds / 31536000);
    const key = interval === 1 ? 'time.yearAgo' : (t('time.yearsAgo') !== 'time.yearsAgo' ? 'time.yearsAgo' : 'time.yearAgo');
    return `${interval} ${t(key)}`;
  }
};