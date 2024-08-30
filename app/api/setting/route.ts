import { db } from "@/lib/db";
import { UserAuth } from "@/lib/get-current-user";
import { SettingSchema } from "@/schema";
import { NextResponse } from "next/server";

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