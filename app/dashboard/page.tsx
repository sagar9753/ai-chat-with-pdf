import ChatHistoryTable from "@/components/ChatHistoryTable";
import FileUploader from "@/components/FileUploader";

const page = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">
      <FileUploader />
      <ChatHistoryTable />
    </div>
  );
};

export default page;
