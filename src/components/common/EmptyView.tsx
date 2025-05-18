import { FileX } from "lucide-react";

function EmptyView() {
  return (
    <div className="flex justify-center">
      <div>
        <FileX className="animate-pulse" size={240} />
        <h1 className="text-center text-xl font-semibold animate-pulse">
          Not Records Found
        </h1>
      </div>
    </div>
  );
}

export default EmptyView;
