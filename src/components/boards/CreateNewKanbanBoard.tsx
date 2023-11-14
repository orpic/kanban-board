"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

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
  return <div>CreateNewKanban</div>;
};
