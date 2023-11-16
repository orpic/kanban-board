"use client";

import { trpc } from "@/app/_trpc/client";
import { Link, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import KanbanDash from "./KanbanDash";
import { DragDropContext } from "react-beautiful-dnd";
import { useToast } from "./ui/use-toast";
import { useState } from "react";
import { DialogContent } from "./ui/dialog";
import { AlertDialog, AlertDialogContent } from "./ui/alert-dialog";

const Kanban = ({ kanbanid }: { kanbanid: string }) => {
  const [screenLoading, setScreenLoading] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { data: kanbanDetail, isLoading: isLoadingKanbanDetails } =
    trpc.getSingleKanbanDetails.useQuery({
      id: kanbanid,
    });

  const { data: kanbanColumns, isLoading: isLoadingColumns } =
    trpc.getColumnsOfkanbanBoard.useQuery({
      kanbanId: kanbanid,
    });

  const {
    mutate: dragnDropItemBetweenColumns,
    isLoading: isLoadingDragnDropItemBetweenColumns,
  } = trpc.dragnDropItemBetweenColumns.useMutation({
    onSuccess(data, variables, context) {
      utils.getAllItemsOfAColumn.invalidate();
      return toast({
        title: "Saved",
      });
    },
    onMutate(variables) {
      toast({
        title: "Moving",
      });
    },
    onSettled(data, error, variables, context) {
      setScreenLoading(false);
    },
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
    <DragDropContext
      onDragEnd={(dropResult) => {
        if (
          dropResult.destination?.droppableId === dropResult.source.droppableId
        ) {
          return;
        }
        setScreenLoading(true);
        console.log(dropResult);
        dragnDropItemBetweenColumns({
          itemId: dropResult.draggableId,
          destinationColumnId:
            dropResult.destination?.droppableId ||
            dropResult.source.droppableId,
          sourceColumnId: dropResult.source.droppableId,
        });
      }}
    >
      <KanbanDash kanbanDetails={kanbanDetail} kanbanColumns={kanbanColumns} />
      <AlertDialog open={screenLoading}>
        <AlertDialogContent className="w-min">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-black" />
        </AlertDialogContent>
      </AlertDialog>
    </DragDropContext>
  );
};

export default Kanban;
