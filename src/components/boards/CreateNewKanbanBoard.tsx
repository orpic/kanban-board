"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

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

  return (
    <div className="mt-4 flex flex-col gap-4">
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
      <Button
        onClick={() => {
          //
        }}
      >
        Create
      </Button>
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
