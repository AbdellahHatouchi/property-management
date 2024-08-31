import { db } from "./db";

export const getRentalNumber = async() => {
    // Get the last rental property entry from the database
    const lastRental = await db.rentalProperty.findFirst({
        orderBy: {
            rentalNumber: "desc",
        },
        select: {
            rentalNumber: true,
        },
    });

    // Extract the number from the last rental number and increment it
    const lastNumber = lastRental
        ? parseInt(lastRental.rentalNumber.split("_")[1])
        : 4000;

    // Generate the new rental number
    return `RNTL_${lastNumber + 1}`;
};
