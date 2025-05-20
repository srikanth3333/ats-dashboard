import { Button } from "@/components/ui/button";
import { useCardList } from "@/hooks/use-card-list";
import { format } from "date-fns";
import { User } from "lucide-react";
import { SkeletonCard } from "../Loader";
import CountdownTimer from "../Timer";

export function JobPostingDetail({ selectedItem }: any) {
  const { filters, applyUserIdFilter, assignId, profileId } = selectedItem;
  const foreignKeys = {
    assign: ["*"],
    client: ["*"],
  };

  const {
    pageSize,
    data,
    loading,
    error,
    totalCount,
    currentPage,
    setCurrentPage,
  } = useCardList(
    "job_posting",
    foreignKeys,
    filters,
    "",
    ["name"],
    applyUserIdFilter,
    profileId,
    assignId
  );

  const totalPages = Math.ceil(totalCount / pageSize);
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div>
        <SkeletonCard grids={2} width="grid grid-cols-1 gap-2" />
      </div>
    );
  }

  if (error) {
    return "Error Loading try again later...";
  }

  return (
    <div className="">
      <div className="flex justify-between items-center my-6">
        <h1 className="text-3xl font-bold">Job Posting Details</h1>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {data?.map((record) => (
          <div className="bg-background rounded-2xl px-5 pt-1 pb-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="my-4" key={record?.id}>
              <h2 className="font-medium capitalize text-xl flex gap-2 items-center">
                {record?.role}
                <span
                  className={`${record?.job_status === "active" ? "bg-green-500 text-white" : "bg-red-500 text-white"} px-2 py-1 rounded-full text-xs`}
                >
                  {record?.job_status}
                </span>
              </h2>
            </div>
            <hr />
            <div className="my-4">
              <h2 className="font-medium text-lg ">Skills</h2>
              <div className="flex gap-2 flex-wrap my-4">
                {record?.skills?.map((record: any) => (
                  <div className="py-1 px-4 text-sm font-medium rounded-full bg-gray-200">
                    {record}
                  </div>
                ))}
              </div>
            </div>
            <hr />
            <div className="my-4">
              <h2 className="font-medium text-lg ">Location</h2>
              <div className="flex gap-2 flex-wrap my-4">
                {record?.location?.map((record: any) => (
                  <div className="py-1 px-4 text-sm font-medium rounded-full bg-gray-200">
                    {record}
                  </div>
                ))}
              </div>
            </div>
            <hr />
            <div className="flex flex-wrap gap-4 my-4">
              <span className="px-4 py-1 rounded-lg bg-gray-300 text-sm font-medium">
                Client:{" "}
                <span className="font-semibold">{record?.client?.name}</span>
              </span>
              <span className="px-4 py-1 rounded-lg bg-gray-300 text-sm font-medium">
                Experience Max: {record?.exp_max}
              </span>
              <span className="px-4 py-1 rounded-lg bg-gray-300 text-sm font-medium">
                Experience Min: {record?.exp_min}
              </span>
              <span className="px-4 py-1 rounded-lg bg-gray-300 text-sm font-medium">
                Budget Max: {record?.budget_max}
              </span>
              <span className="px-4 py-1 rounded-lg bg-gray-300 text-sm font-medium">
                Budget Min: {record?.budget_min}
              </span>
              <span className="px-4 py-1 rounded-lg bg-gray-300 text-sm font-medium">
                Mode Of Job: {record?.mode_of_job}
              </span>
            </div>
            <hr />
            <div className="my-4">
              <h2 className="font-medium text-lg ">Job Description</h2>
              <span className="text-gray-500 text-base">
                {record?.job_description}
              </span>
            </div>
            <hr />
            <div className="mt-4">
              <h5 className="text-md font-semibold">Assigned To</h5>
              <div className="flex flex-wrap justify-between gap-4 mt-3">
                <div className="text-center">
                  <div
                    className={`mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center`}
                  >
                    <User className="h-6 w-6" />
                  </div>
                  <span className="text-gray-700 text-xs font-medium">
                    {record?.assign?.email_id}
                  </span>
                  <div className="text-gray-500 text-xs mt-1">
                    Date: (
                    {record?.assign?.created_at &&
                      format(
                        new Date(record?.assign?.created_at),
                        "dd-MM-yyyy"
                      )}
                    )
                  </div>
                </div>
                <CountdownTimer
                  fromDateTime={record?.date_of_posting}
                  hours={record?.timer}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} | Total Items: {totalCount}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant={currentPage === 1 ? "outline" : "default"}
              size="sm"
            >
              Previous
            </Button>

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant={currentPage === totalPages ? "outline" : "default"}
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
