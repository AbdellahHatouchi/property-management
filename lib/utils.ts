import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formattedNumberToMAD(n:number):string{
  return Intl.NumberFormat('fr-MA',{
    style:'currency',
    currency:'MAD'
  }).format(n)
}

export const calculateAmount = (data: {
  dailyRentalCost: number
  monthlyRentalCost: number
  rentalType: 'Daily' | 'Monthly'
  dateRange: {
    from: Date,
    to: Date
  }
}) => {
  if (data.dateRange) {
    const fromDate = new Date(data.dateRange.from);
    const toDate = new Date(data.dateRange.to);

    // Calculate the difference in days between the 'from' and 'to' dates
    const dateDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

    let totalAmount = 0;

    if (data.rentalType === 'Daily') {
      // For daily rentals, multiply the number of days by the daily rental cost
      totalAmount = dateDiff * data.dailyRentalCost;
    } else if (data.rentalType === 'Monthly') {
      // For monthly rentals, divide the number of days by 30 and multiply by the monthly rental cost
      const numberOfMonths = Math.ceil(dateDiff / 30);
      totalAmount = numberOfMonths * data.monthlyRentalCost;
    }
    
    return (totalAmount|| 0);
  }
};