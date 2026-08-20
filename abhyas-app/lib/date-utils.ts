/**
 * Returns the current date in IST (Asia/Kolkata) as a string formatted 'YYYY-MM-DD'.
 * Essential for daily streak logic which must roll over at 12:00 AM IST.
 */
export function getTodayDateIST(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Returns yesterday's date in IST (Asia/Kolkata) as a string formatted 'YYYY-MM-DD'.
 */
export function getYesterdayDateIST(): string {
  const date = new Date(Date.now() - 86400000); // minus 24 hours
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}
