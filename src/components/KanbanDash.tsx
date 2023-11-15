"use client";

import { Dispatch, SetStateAction, useState } from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button, buttonVariants } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";

interface KanbanDashProps {
  kanbanDetails: {
    id: string;
    name: string;
    description: string;
  };
  kanbanColumns: {
    id: string;
    name: string;
    kanbanId: string | null;
  }[];
}

const KanbanDash = ({ kanbanDetails, kanbanColumns }: KanbanDashProps) => {
  //   console.log(kanbanDetails, kanbanColumns);
  return (
    <div className="w-full">
      <MaxWidthWrapper>
        <div className="flex items-center justify-between">
          <div className="my-4 ">
            <p className="font-semibold text-xl">
              Board name: {kanbanDetails?.name || "loading.."}
            </p>
            <p className="">
              Board description: {kanbanDetails?.description || "loading.."}
            </p>
          </div>
          <CreateNewColumnButton kanbanId={kanbanDetails.id} />
        </div>
      </MaxWidthWrapper>
      <div className="flex justify-center">
        <KanbanBoards kanbanColumns={kanbanColumns} />
      </div>
    </div>
  );
};

export default KanbanDash;

const CreateNewColumnButton = ({ kanbanId }: { kanbanId: string }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger
        onClick={() => {
          setIsOpen(true);
        }}
        asChild
      >
        <Button>Create new column</Button>
      </DialogTrigger>
      <DialogContent>
        <CreateNewColumn setIsOpen={setIsOpen} kanbanId={kanbanId} />
      </DialogContent>
    </Dialog>
  );
};

const CreateNewColumn = ({
  setIsOpen,
  kanbanId,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  kanbanId: string;
}) => {
  const [columnName, setColumnName] = useState("");
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { mutate: createSingleColumn, isLoading: isCreateSingleColumnLoading } =
    trpc.createSingleColumn.useMutation({
      onSuccess(data, variables, context) {
        utils.getColumnsOfkanbanBoard.invalidate();
        setIsOpen(false);
      },
    });
  return (
    <div className="mt-1 flex flex-col gap-4">
      <h2 className="mx-auto font-semibold">Column in creation..</h2>
      <Input
        placeholder="Name of column"
        value={columnName}
        onChange={(e) => {
          setColumnName(e.target.value);
        }}
      />
      {isCreateSingleColumnLoading && (
        <div
          className={buttonVariants({
            className: "w-full",
          })}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      {!isCreateSingleColumnLoading && (
        <Button
          onClick={() => {
            //
            if (columnName === "" || columnName.length < 3) {
              return toast({
                title: "Name too short",
                description: "Please provide a name longer than 3 characters",
                variant: "destructive",
              });
            }
            createSingleColumn({
              name: columnName,
              kanbanId: kanbanId,
            });
          }}
        >
          Create
        </Button>
      )}
    </div>
  );
};

const KanbanBoards = ({
  kanbanColumns,
}: {
  kanbanColumns: {
    id: string;
    name: string;
    kanbanId: string | null;
  }[];
}) => {
  return (
    <div className=" flex flex-wrap gap-4 ">
      {kanbanColumns.map((eachKanbanColumn) => (
        <KanbanColumns
          key={eachKanbanColumn.id}
          id={eachKanbanColumn.id}
          name={eachKanbanColumn.name}
          kanbanId={eachKanbanColumn.kanbanId!}
        />
      ))}
    </div>
  );
};

const KanbanColumns = ({
  id,
  name,
  kanbanId,
}: {
  id: string;
  name: string;
  kanbanId: string;
}) => {
  const [deletingId, setDeletingId] = useState("");
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { mutate: deleteSingleColumn, isLoading: isLoadingDeleteSingleColumn } =
    trpc.deleteSingleColumn.useMutation({
      onSuccess(data, variables, context) {
        utils.getColumnsOfkanbanBoard.invalidate();
        return toast({
          title: "Deletion Success",
        });
      },
      onSettled(data, error, variables, context) {
        setDeletingId("");
      },
    });
  return (
    <div className="bg-zinc-200 w-96 h-[40rem] rounded-sm">
      <div className="flex justify-between items-center px-2 py-2 bg-zinc-400 rounded-tr-sm rounded-tl-sm">
        <p className=" font-semibold text-lg pl-2">{name}</p>
        <div className="flex gap-2">
          <EditKanbanColumn columnId={id} name={name} kanbanId={kanbanId} />
          {deletingId !== id && (
            <Button
              onClick={() => {
                setDeletingId(id);
                deleteSingleColumn({
                  columnId: id,
                });
              }}
              variant={"destructive"}
            >
              Delete
            </Button>
          )}
          {isLoadingDeleteSingleColumn && deletingId === id && (
            <Button
              onClick={() => {
                //
                // deleteSingleKanbanBoard({
                //   id: each.id,
                // });
              }}
              variant={"destructive"}
            >
              <Loader2 className="h-4 w-14 animate-spin" />
            </Button>
          )}
        </div>
      </div>

      <div className=" w-full mt-2"></div>
    </div>
  );
};

const EditKanbanColumn = ({
  columnId,
  name,
  kanbanId,
}: {
  columnId: string;
  name: string;
  kanbanId: string;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger
        onClick={() => {
          setIsOpen(true);
        }}
        asChild
      >
        <Button>Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <EditKanbanColumnDialog
          setIsOpen={setIsOpen}
          columnId={columnId}
          name={name}
        />
      </DialogContent>
    </Dialog>
  );
};

const EditKanbanColumnDialog = ({
  setIsOpen,
  columnId,
  name,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  columnId: string;
  name: string;
}) => {
  const [columnName, setColumnName] = useState(name);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const {
    mutate: editSingleColumnName,
    isLoading: isLoadingEditSingleColumnName,
  } = trpc.editSingleColumnName.useMutation({
    onSuccess(data, variables, context) {
      setIsOpen(false);
      utils.getColumnsOfkanbanBoard.invalidate();
      return toast({
        title: "Name Changed Success",
      });
    },
  });
  return (
    <div className="mt-1 flex flex-col gap-4">
      <h2 className="mx-auto font-semibold">Editing {name} column name..</h2>
      <Input
        placeholder={name}
        value={columnName}
        onChange={(e) => {
          setColumnName(e.target.value);
        }}
      />
      {isLoadingEditSingleColumnName && (
        <div
          className={buttonVariants({
            className: "w-full",
          })}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      {!isLoadingEditSingleColumnName && (
        <Button
          onClick={() => {
            //
            if (columnName === "" || columnName.length < 3) {
              return toast({
                title: "Name too short",
                description: "Please provide a name longer than 3 characters",
                variant: "destructive",
              });
            }
            editSingleColumnName({
              name: columnName,
              columnId: columnId,
            });
          }}
        >
          Done
        </Button>
      )}
    </div>
  );
};
