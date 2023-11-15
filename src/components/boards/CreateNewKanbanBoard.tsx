"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Button, buttonVariants } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CreateNewKanbanBoard = () => {
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
        <Button className=" text-lg font-bold">Create new kanban board</Button>
      </DialogTrigger>
      <DialogContent>
        <CreateNewKanban setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewKanbanBoard;

const CreateNewKanban = ({
  setIsOpen,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [kanbanName, setKanbanName] = useState("");
  const [kanbanDescription, setKanbanDescription] = useState("");
  const { toast } = useToast();

  const utils = trpc.useUtils();

  const { mutate: createNewKanban, isLoading: isCreateNewKanbanLoading } =
    trpc.createNewKanban.useMutation({
      onSuccess(data, variables, context) {
        // console.log(data);
        setIsOpen(false);
        utils.getKanbanBoardsList.invalidate();
      },
      onError(error, variables, context) {
        return toast({
          title: "An error occured",
          description: error.message,
        });
      },
    });

  return (
    <div className="mt-1 flex flex-col gap-4">
      <h2 className="mx-auto font-semibold">Kanban board in creation..</h2>
      <Input
        placeholder="Name of kanban board"
        value={kanbanName}
        onChange={(e) => {
          setKanbanName(e.target.value);
        }}
      />
      <DescriptionInput
        value={kanbanDescription}
        setKanbanDescription={setKanbanDescription}
      />
      {isCreateNewKanbanLoading && (
        <div
          className={buttonVariants({
            className: "w-full",
          })}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      {!isCreateNewKanbanLoading && (
        <Button
          onClick={() => {
            //
            if (kanbanName === "" || kanbanName.length < 3) {
              return toast({
                title: "Name too short",
                description: "Please provide a name longer than 3 characters",
                variant: "destructive",
              });
            }
            if (kanbanDescription === "" || kanbanDescription.length < 5) {
              return toast({
                title: "Description too short",
                description:
                  "Please provide a description longer than 5 characters",
                variant: "destructive",
              });
            }
            createNewKanban({
              name: kanbanName,
              description: kanbanDescription,
            });
          }}
        >
          Create
        </Button>
      )}
    </div>
  );
};

const DescriptionInput = ({
  value,
  setKanbanDescription,
}: {
  value: string;
  setKanbanDescription: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <Textarea
      value={value}
      onChange={(e) => {
        setKanbanDescription(e.target.value);
      }}
      minRows={4}
      maxRows={8}
      placeholder="Add a description"
    ></Textarea>
  );
};
