import { formatTime, shiftTime } from './time';

describe('time helpers', () => {
  it('shifts and wraps around midnight', () => {
    expect(shiftTime('06:30', 15)).toBe('06:45');
    expect(shiftTime('23:45', 30)).toBe('00:15');
    expect(shiftTime('00:00', -15)).toBe('23:45');
  });

  it('formats as 12-hour time', () => {
    expect(formatTime('06:05')).toBe('6:05 AM');
    expect(formatTime('12:00')).toBe('12:00 PM');
    expect(formatTime('00:30')).toBe('12:30 AM');
    expect(formatTime('17:00')).toBe('5:00 PM');
  });
});
