import { db } from "@/db";
import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  // ...
  getKanbanBoardsList: publicProcedure.query(async () => {
    return await db.kanban.findMany();
  }),

  getSingleKanbanDetails: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;

      const kanbanDetails = await db.kanban.findFirst({
        where: {
          id: id,
        },
      });

      return kanbanDetails;
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

  editKanbanData: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z
          .string()
          .min(3, "Please provide a name longer than 3 characters"),
        description: z
          .string()
          .min(5, "Please provide a description longer than 5 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const { id, name, description } = input;

      const updatedKanban = await db.kanban.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          description: description,
        },
      });

      return updatedKanban;
    }),

  deleteSingleKanbanBoard: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input;

      const deleted = await db.kanban.delete({
        where: {
          id: id,
        },
      });

      return deleted;
    }),

  createSingleColumn: publicProcedure
    .input(
      z.object({
        kanbanId: z.string(),
        name: z.string().min(3),
      })
    )
    .mutation(async ({ input }) => {
      const { kanbanId, name } = input;

      const kanbanDetails = await db.kanban.findFirst({
        where: {
          id: kanbanId,
        },
      });

      if (!kanbanDetails)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No kanban Exist with this id",
        });

      const addedColumn = await db.kanbanColumn.create({
        data: {
          name: name,
          kanbanId: kanbanId,
        },
      });

      return addedColumn;
    }),

  getColumnsOfkanbanBoard: publicProcedure
    .input(
      z.object({
        kanbanId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { kanbanId } = input;
      const columns = await db.kanbanColumn.findMany({
        where: {
          kanbanId: kanbanId,
        },
      });

      return columns;
    }),

  editSingleColumnName: publicProcedure
    .input(
      z.object({
        columnId: z.string(),
        name: z.string().min(3),
      })
    )
    .mutation(async ({ input }) => {
      const { columnId, name } = input;

      const columnChanged = await db.kanbanColumn.update({
        where: {
          id: columnId,
        },
        data: {
          name: name,
        },
      });

      return columnChanged;
    }),

  deleteSingleColumn: publicProcedure
    .input(
      z.object({
        columnId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { columnId } = input;

      const deletedColumn = await db.kanbanColumn.delete({
        where: {
          id: columnId,
        },
      });

      return deletedColumn;
    }),

  getAllItemsOfAColumn: publicProcedure
    .input(
      z.object({
        columnId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { columnId } = input;

      const allColumnItems = await db.kanbanItem.findMany({
        where: {
          kanbanColumnId: columnId,
        },
      });

      return allColumnItems;
    }),

  addSingleItemInColumn: publicProcedure
    .input(
      z.object({
        columnId: z.string(),
        name: z.string().min(3),
        description: z.string().min(5),
        dueDate: z
          .string()
          .transform((str) => new Date(str))
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { columnId, name, description, dueDate } = input;

      const createdItem = await db.kanbanItem.create({
        data: {
          kanbanColumnId: columnId,
          name: name,
          description: description,
          dueDate: dueDate,
        },
      });

      return createdItem;
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
