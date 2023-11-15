import Kanban from "@/components/Kanban";

interface PageProps {
  params: {
    kanbanid: string;
  };
}

const Page = ({ params }: PageProps) => {
  // retrieve kanbanid

  const { kanbanid } = params;
  return <Kanban kanbanid={kanbanid} />;
};

export default Page;
