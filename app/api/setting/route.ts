import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { SettingSchema } from "@/schema";
import { NextResponse } from "next/server";
/**
 * @swagger
 * /api/setting:
 *   put:
 *     summary: Update user settings
 *     description: Updates the settings for the authenticated user based on the provided data.
 *     requestBody:
 *       description: The settings data to update for the user.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               showAPIDoc:
 *                 type: boolean
 *                 example: true
 *             required:
 *               - showAPIDoc
 *     responses:
 *       200:
 *         description: Settings updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "user-id-123"
 *                 showAPIDocs:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid settings data.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Invalid setting Data!"
 *       403:
 *         description: User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Unauthenticated"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Not Found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Internal error"
 */
export async function PUT(
  req: Request,
) {
  try {
      const user = await UserAuth();

      const body = await req.json();

      if (!user || !user.id) {
          return new NextResponse("Unauthenticated", { status: 403 });
      }

      const validateFields = SettingSchema.safeParse(body);
      console.log(validateFields.error?.errors);

      if (!validateFields.success) {
          return new NextResponse("Invalid setting Data!", { status: 400 });
      }

      const {
          showAPIDoc
      } = validateFields.data;

      const updatedSetting = await db.user.update({
              where: {
                  id: user.id,
              },
              data: {
                showAPIDocs: showAPIDoc
              },
          });
          

      if (!updatedSetting) {
          return new NextResponse("Not Found", { status: 404 });
      }

      return NextResponse.json(updatedSetting);
  } catch (error) {
      console.log("[SETTING_PATCH]", error);
      return new NextResponse("Internal error", { status: 500 });
  }
}