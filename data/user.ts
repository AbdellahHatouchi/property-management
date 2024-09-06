import { db } from "../lib/db";

export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.user.findUnique({
            where: { email },
        });
        return user;
    } catch (error) {
        return null;
    }
};

export const getUserById = async (id: string) => {
    try {
        const user = await db.user.findUnique({
            where: { id },
        });
        return user;
    } catch (error) {
        return null;
    }
};
export const verifiedUserById = async (id: string) => {
    try {
        console.log('id:',id);
        
        const user = await db.user.update({
            where: { id },
            data:{
                emailVerified: new Date(),
            }
        });
        return user;
    } catch (error) {
        console.log(error);
        
        return null;
    }
};

