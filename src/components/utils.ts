import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseLocalDate = (dateString: string) => {
  if (!dateString || typeof dateString !== 'string') return new Date();
  const parts = dateString.split('-');
  if (parts.length !== 3) return new Date();
  const [year, month, day] = parts.map(Number);
  return new Date(year, month - 1, day);
};

export const groupShiftsByDate = (shifts: any[]) => {
  const groups: { [key: string]: any } = {};
  
  (shifts || []).forEach(shift => {
    if (!shift || !shift.date) return;
    const key = `${shift.date}-${shift.shift_type}`;
    if (!groups[key]) {
      groups[key] = {
        ...shift,
        platforms: [shift.platform].filter(Boolean),
        totalEarnings: shift.earnings || 0,
        totalKm: shift.km || 0
      };
    } else {
      if (shift.platform) groups[key].platforms.push(shift.platform);
      groups[key].totalEarnings += shift.earnings || 0;
      groups[key].totalKm += shift.km || 0;
    }
  });

  return Object.values(groups).sort((a: any, b: any) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime());
};
