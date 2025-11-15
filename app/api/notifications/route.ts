import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all notifications for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to 50 notifications
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PATCH mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, notificationIds, markAllAsRead, userId } = body;

    if (markAllAsRead && userId) {
      // Mark all notifications as read for user
      await prisma.notification.updateMany({
        where: { userId },
        data: { isRead: true },
      });

      return NextResponse.json(
        { message: "All notifications marked as read" },
        { status: 200 }
      );
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark multiple notifications as read
      await prisma.notification.updateMany({
        where: { id: { in: notificationIds } },
        data: { isRead: true },
      });

      return NextResponse.json(
        { message: "Notifications marked as read" },
        { status: 200 }
      );
    }

    if (notificationId) {
      // Mark single notification as read
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return NextResponse.json({ notification }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
