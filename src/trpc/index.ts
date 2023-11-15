import { db } from "@/db";
import { z } from "zod";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  // ...
  getKanbanBoardsList: publicProcedure.query(async () => {
    return await db.kanban.findMany();
  }),

  createNewKanban: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(3, "Please provide a name longer than 3 characters"),
        description: z
          .string()
          .min(5, "Please provide a description longer than 5 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const { name, description } = input;

      const createNewKanban = await db.kanban.create({
        data: {
          name: name,
          description: description,
        },
      });

      const createDefaultColumns = await db.kanbanColumn.createMany({
        data: [
          {
            name: "To Do",
            kanbanId: createNewKanban.id,
          },
          {
            name: "In Progress",
            kanbanId: createNewKanban.id,
          },
          {
            name: "Completed",
            kanbanId: createNewKanban.id,
          },
        ],
      });

      return createNewKanban;
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
