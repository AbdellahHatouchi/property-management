// app/api/example/route.js

import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/hello:
 *   get:
 *     description: Returns the hello world!
 *     responses:
 *       200:
 *         description: Hello World!
 */
export const GET = async () => {
  return NextResponse.json({ message: 'Hello, World!' });
};
