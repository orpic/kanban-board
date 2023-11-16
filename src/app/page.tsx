import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { CreateNewKanbanBoard, ListOfKanbanBoards } from "@/components/boards";

export default function Home() {
  return (
    <MaxWidthWrapper className="mb-12 flex flex-col items-center justify-center text-center ">
      <div className="flex  items-center justify-between gap-4 border-b border-gray-200 py-2 bg-zinc-200  px-3 rounded-br-md rounded-bl-md font-semibold sticky top-0">
        <h1 className="text-xl">The Kanban Board App</h1>
        <CreateNewKanbanBoard />
      </div>
      <div className="mx-auto w-full">
        <ListOfKanbanBoards />
      </div>
    </MaxWidthWrapper>
  );
}
