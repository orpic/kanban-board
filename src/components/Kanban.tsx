"use client";

import { trpc } from "@/app/_trpc/client";
import { Link, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import KanbanDash from "./KanbanDash";

const Kanban = ({ kanbanid }: { kanbanid: string }) => {
  const { data: kanbanDetail, isLoading: isLoadingKanbanDetails } =
    trpc.getSingleKanbanDetails.useQuery({
      id: kanbanid,
    });

  const { data: kanbanColumns, isLoading: isLoadingColumns } =
    trpc.getColumnsOfkanbanBoard.useQuery({
      kanbanId: kanbanid,
    });

  if (isLoadingKanbanDetails || isLoadingColumns) {
    return (
      <div className="w-full flex justify-center items-center flex-col">
        <p className="mt-10 ">Loading</p>
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  if (!kanbanDetail || !kanbanColumns) {
    return (
      <div className="w-full flex justify-center items-center flex-col">
        <p className="mt-10">Something Went Wrong</p>
        <Link href={"/"} className="">
          <Button>Go to home</Button>
        </Link>
      </div>
    );
  }

  //   console.log(kanbanDetail, kanbanColumns);

  return (
    <KanbanDash kanbanDetails={kanbanDetail} kanbanColumns={kanbanColumns} />
  );
};

export default Kanban;
