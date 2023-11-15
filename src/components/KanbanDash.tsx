"use client";

import { Dispatch, SetStateAction, useState } from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button, buttonVariants } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { Input } from "./ui/input";
import { Loader2, LucidePlus, Calendar as CalendarIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";

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

  const { data: allItemsOfAColumn, isLoading: isLoadingAllItemsOfAColumn } =
    trpc.getAllItemsOfAColumn.useQuery({
      columnId: id,
    });

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
    <div className="relative">
      <div className="bg-zinc-200 w-96 h-[40rem] rounded-sm overflow-y-auto no-scrollbar pb-2">
        <div className="flex justify-between items-center px-2 py-2 bg-zinc-400 rounded-tr-sm rounded-tl-sm sticky top-0 mb-2">
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
        <div className="flex flex-col gap-2">
          {Array.isArray(allItemsOfAColumn) &&
            allItemsOfAColumn.length > 0 &&
            allItemsOfAColumn.map((eachItem) => (
              <ItemsOfColumn
                key={eachItem.id}
                itemId={eachItem.id}
                itemName={eachItem.name}
                itemDescription={eachItem.description}
                dueDate={eachItem.dueDate ? new Date(eachItem.dueDate) : null}
              />
            ))}
        </div>
        <AddItemToAColumn columnId={id} />
      </div>
    </div>
  );
};

const AddItemToAColumn = ({ columnId }: { columnId: string }) => {
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
        <div className="absolute bottom-4 right-4 bg-blue-600 h-12 w-12 rounded-full flex items-center justify-center">
          <LucidePlus className="w-8 h-8" />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogContentForItemCreation columnId={columnId} />
      </DialogContent>
    </Dialog>
  );
};

const DialogContentForItemCreation = ({ columnId }: { columnId: string }) => {
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [date, setDate] = useState<Date>();

  const { toast } = useToast();
  const utils = trpc.useUtils();

  const {
    mutate: addSingleItemInColumn,
    isLoading: isLoadingAddSingleItemInColumn,
  } = trpc.addSingleItemInColumn.useMutation({
    onSuccess(data, variables, context) {
      utils.getAllItemsOfAColumn.invalidate();
      return toast({
        title: "Item Added",
      });
    },
  });

  return (
    <div className="mt-1 flex flex-col gap-4">
      <h2 className="mx-auto font-semibold">Column in creation..</h2>
      <Input
        placeholder="Name of item"
        value={itemName}
        onChange={(e) => {
          setItemName(e.target.value);
        }}
      />
      <Textarea
        value={itemDescription}
        onChange={(e) => {
          setItemDescription(e.target.value);
        }}
        minRows={4}
        maxRows={8}
        placeholder="Add a description"
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {isLoadingAddSingleItemInColumn && (
        <div
          className={buttonVariants({
            className: "w-full",
          })}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      {!isLoadingAddSingleItemInColumn && (
        <Button
          onClick={() => {
            //
            if (itemName === "" || itemName.length < 3) {
              return toast({
                title: "Name too short",
                description: "Please provide a name longer than 3 characters",
                variant: "destructive",
              });
            }
            if (itemDescription === "" || itemDescription.length < 5) {
              return toast({
                title: "Name too short",
                description: "Please provide a name longer than 3 characters",
                variant: "destructive",
              });
            }
            // console.log(date);
            addSingleItemInColumn({
              name: itemName,
              description: itemDescription,
              columnId: columnId,
              dueDate: date ? date.toLocaleDateString() : undefined,
            });
          }}
        >
          Create
        </Button>
      )}
    </div>
  );
};

const ItemsOfColumn = ({
  itemId,
  itemName,
  itemDescription,
  dueDate,
}: {
  itemId: string;
  itemName: string;
  itemDescription: string;
  dueDate: Date | null;
}) => {
  return (
    <div className="w-full bg-zinc-300 p-2">
      <div className="flex justify-between items-center border-b pb-1 border-zinc-700">
        <p className="text-lg font-semibold">{itemName}</p>
        <div className="flex gap-2">
          <Button>Edit</Button>
          <Button variant={"destructive"}>Delete</Button>
        </div>
      </div>
      <div className="">{itemDescription}</div>
      <div className=" ">
        <p className="text-center bg-zinc-800 w-max mx-auto mt-2 px-2 rounded-md text-zinc-200">
          {dueDate
            ? `Due date: ${dueDate.toLocaleDateString()}`
            : "No due date"}
        </p>
      </div>
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
