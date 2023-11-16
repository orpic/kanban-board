"use client";

import { trpc } from "@/app/_trpc/client";
import { Button, buttonVariants } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { Textarea } from "../ui/textarea";
import Link from "next/link";

const ListOfKanbanBoards = () => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState("");

  const utils = trpc.useUtils();
  const { data: kanbanBoardList, isLoading: isKnabanBoardListLoading } =
    trpc.getKanbanBoardsList.useQuery();

  const {
    mutate: deleteSingleKanbanBoard,
    isLoading: isDeleteSingleKanbanBoardLoading,
  } = trpc.deleteSingleKanbanBoard.useMutation({
    onSuccess(data, variables, context) {
      utils.getKanbanBoardsList.invalidate();
      return toast({
        title: "Deleted",
      });
    },
    onSettled(data, error, variables, context) {
      setDeletingId("");
    },
  });
  return (
    <div className="w-full mt-4">
      <h2 className="text-lg font-semibold underline-offset-2  underline my-4 mb-8">
        Your Boards
      </h2>
      <div className="w-full">
        {isKnabanBoardListLoading && (
          <div className="w-full flex justify-center items-center ">
            <Loader2 className="h-16 w-16 animate-spin" />
          </div>
        )}
        {!isKnabanBoardListLoading &&
          Array.isArray(kanbanBoardList) &&
          kanbanBoardList?.length > 0 && (
            <ul className="flex flex-col gap-4">
              {kanbanBoardList.map((each) => (
                <li
                  key={each.id}
                  className="mx-auto w-[48rem] flex justify-between items-center ring-1 ring-zinc-600 p-1 rounded-md"
                >
                  <p className="truncate pl-2 font-semibold w-40 text-left ">
                    {each.name}
                  </p>

                  <p className="truncate pl-2 font-semibold text-left  flex-1">
                    |&nbsp;{each.description}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/kanbanid/${encodeURIComponent(each.id)}`}>
                      <Button
                        onClick={() => {
                          //open the kanban board page
                        }}
                      >
                        Open
                      </Button>
                    </Link>
                    <EditButton
                      id={each.id}
                      name={each.name}
                      description={each.description}
                    />
                    {deletingId !== each.id && (
                      <Button
                        onClick={() => {
                          //
                          setDeletingId(each.id);
                          deleteSingleKanbanBoard({
                            id: each.id,
                          });
                        }}
                        variant={"destructive"}
                      >
                        Delete
                      </Button>
                    )}
                    {isDeleteSingleKanbanBoardLoading &&
                      deletingId === each.id && (
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
                </li>
              ))}
            </ul>
          )}
        {!isKnabanBoardListLoading && kanbanBoardList?.length === 0 && (
          <div className="text-black text-lg font-semibold">
            No boards yet, perfect time to create one
          </div>
        )}
      </div>
    </div>
  );
};

export default ListOfKanbanBoards;

const EditButton = ({
  id,
  name,
  description,
}: {
  id: string;
  name: string;
  description: string;
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
        <Button variant={"outline"} className="border-2 border-black">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <EditKanbabProperties
          setIsOpen={setIsOpen}
          prevKanbanName={name}
          prevKnabanDescription={description}
          id={id}
        />
      </DialogContent>
    </Dialog>
  );
};

const EditKanbabProperties = ({
  setIsOpen,
  prevKanbanName,
  prevKnabanDescription,
  id,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  prevKanbanName: string;
  prevKnabanDescription: string;
  id: string;
}) => {
  const [kanbanName, setKanbanName] = useState(prevKanbanName);
  const [kanbanDescription, setKanbanDescription] = useState(
    prevKnabanDescription
  );
  const { toast } = useToast();

  const utils = trpc.useUtils();

  const { mutate: editKanbanData, isLoading: isEditKanbanDataLoading } =
    trpc.editKanbanData.useMutation({
      onSuccess(data, variables, context) {
        // console.log(data);
        utils.getKanbanBoardsList.invalidate();
        setIsOpen(false);
        return toast({
          title: "Updated",
        });
      },
    });

  return (
    <div className="mt-1 flex flex-col gap-4">
      <h2 className="mx-auto font-semibold">Edit your kanban board</h2>
      <Input
        placeholder={prevKanbanName}
        value={kanbanName}
        onChange={(e) => {
          setKanbanName(e.target.value);
        }}
      />
      <DescriptionInput
        value={kanbanDescription}
        setKanbanDescription={setKanbanDescription}
        placeholder={prevKnabanDescription}
      />

      <div className="w-full flex gap-2 justify-end">
        {
          <>
            {!isEditKanbanDataLoading && (
              <Button
                variant={"outline"}
                onClick={() => {
                  //
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
            )}
            {!isEditKanbanDataLoading && (
              <Button
                onClick={() => {
                  //
                  if (kanbanName === "" || kanbanName.length < 3) {
                    return toast({
                      title: "Name too short",
                      description:
                        "Please provide a name longer than 3 characters",
                      variant: "destructive",
                    });
                  }
                  if (
                    kanbanDescription === "" ||
                    kanbanDescription.length < 5
                  ) {
                    return toast({
                      title: "Description too short",
                      description:
                        "Please provide a description longer than 5 characters",
                      variant: "destructive",
                    });
                  }

                  editKanbanData({
                    id: id,
                    name: kanbanName,
                    description: kanbanDescription,
                  });
                }}
              >
                Save
              </Button>
            )}
            {isEditKanbanDataLoading && (
              <div
                className={buttonVariants({
                  className: "",
                })}
              >
                <Loader2 className=" w-16 h-4  animate-spin" />
              </div>
            )}
          </>
        }
      </div>
    </div>
  );
};

const DescriptionInput = ({
  value,
  setKanbanDescription,
  placeholder,
}: {
  value: string;
  setKanbanDescription: Dispatch<SetStateAction<string>>;
  placeholder: string;
}) => {
  return (
    <Textarea
      value={value}
      onChange={(e) => {
        setKanbanDescription(e.target.value);
      }}
      minRows={4}
      maxRows={8}
      placeholder={placeholder}
    ></Textarea>
  );
};
