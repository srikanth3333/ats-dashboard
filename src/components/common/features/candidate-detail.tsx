import { Button } from "@/components/ui/button";
import { useCardList } from "@/hooks/use-card-list";
import { format } from "date-fns";
import { CircleUserRound, User } from "lucide-react";
import { useState } from "react";
import { SkeletonCard } from "../Loader";
import { SheetModal } from "../SheetModal";

export function CandidateDetail({ selectedItem }: any) {
  const { applyCurrentUser, applyUserIdFilter, assignId, profileId, filters } =
    selectedItem;
  const [isModalOpenJob, setIsModalOpenJob] = useState(false);
  const [currentJob, setCurrentJob] = useState<any>({});
  const foreignKeys = {
    job_posting: ["*, clients:clients(*), assigned:assign(*)"],
    "user_profile!inner(*)": ["id", "designation"],
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
    "candidates",
    foreignKeys,
    filters,
    "",
    ["name"],
    applyUserIdFilter,
    profileId,
    assignId,
    applyCurrentUser
  );

  const onOpenChangeJob = () => {
    setIsModalOpenJob(!isModalOpenJob);
  };

  const getCurrentJob = (job: any) => {
    setCurrentJob(job);
    onOpenChangeJob();
  };

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
        <h1 className="text-3xl font-bold">Candidate Details</h1>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {data?.map((record) => (
          <div
            key={record.id}
            className="bg-background rounded-2xl px-5 py-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex gap-3 items-center">
                <CircleUserRound size={40} className="text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">
                    {record?.name}
                    {"  "}
                    <span className="text-gray-400 text-sm">
                      ({record?.job_posting?.clients?.name})
                    </span>
                  </h3>
                  <span className="text-muted-foreground text-sm">
                    {record?.email} -
                    <span className="ml-1">
                      (
                      {record?.created_at
                        ? format(new Date(record.created_at), "dd-MM-yyyy")
                        : "N/A"}
                      )
                    </span>
                  </span>
                </div>
              </div>
              <div>
                <div>
                  <span className="text-gray-500 text-sm">
                    For Job Post:{" "}
                    <span
                      onClick={() => getCurrentJob(record?.job_posting)}
                      className="underline text-blue-700"
                    >
                      {record?.job_posting?.role}
                    </span>
                  </span>
                </div>
                <div
                  className={`${
                    record?.job_status === "offered"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  } px-2 py-1 rounded-full text-xs text-center`}
                >
                  {record?.job_status}
                </div>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-3 my-4">
              <span className="text-sm px-3 py-1 border bg-gray-100 rounded-full">
                Current Company :{" "}
                <span className="font-semibold">{record?.current_company}</span>
              </span>
              <span className="text-sm px-3 py-1 border bg-gray-100 rounded-full">
                Current Location :{" "}
                <span className="font-semibold">
                  {record?.current_location}
                </span>
              </span>
              <span className="text-sm px-3 py-1 border bg-gray-100 rounded-full">
                Preferred Location :{" "}
                <span className="font-semibold">
                  {record?.preferred_location}
                </span>
              </span>
            </div>
            <hr />
            <div className="mt-4">
              <h5 className="text-md font-semibold">Created By</h5>
              <div className="flex flex-wrap justify-start gap-4 mt-3">
                <div className="">
                  <div
                    className={`mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center`}
                  >
                    <User className="h-6 w-6" />
                  </div>
                  <span className="text-gray-700 text-xs font-medium">
                    {record?.user_profile?.email_id}
                  </span>
                </div>
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

      <div>
        <SheetModal
          onOpenChange={onOpenChangeJob}
          isSheetOpen={isModalOpenJob}
          title="Details"
          className="w-full lg:max-w-2xl"
        >
          <div className="px-6 bg-white h-full overflow-y-scroll pb-10">
            <div className="my-4">
              <h2 className="font-medium capitalize text-xl flex gap-2 items-center">
                {currentJob?.role}
                <span
                  className={`${currentJob?.job_status === "active" ? "bg-green-500 text-white" : "bg-red-500 text-white"} px-2 py-1 rounded-full text-xs`}
                >
                  {currentJob?.job_status}
                </span>
              </h2>
            </div>
            <hr />
            <div className="my-4">
              <h2 className="font-medium text-lg ">Skills</h2>
              <div className="flex gap-2 flex-wrap my-4">
                {currentJob?.skills?.map((record: any) => (
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
                {currentJob?.location?.map((record: any) => (
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
                <span className="font-semibold">
                  {currentJob?.clients?.name}
                </span>
              </span>
              <span className="px-4 py-1 rounded-lg bg-gray-300 text-sm font-medium">
                Experience Max: {currentJob?.exp_max}
              </span>
              <span className="px-4 py-1 rounded-lg bg-gray-300 text-sm font-medium">
                Experience Min: {currentJob?.exp_min}
              </span>
              <span className="px-4 py-1 rounded-lg bg-gray-300 text-sm font-medium">
                Budget Max: {currentJob?.budget_max}
              </span>
              <span className="px-4 py-1 rounded-lg bg-gray-300 text-sm font-medium">
                Budget Min: {currentJob?.budget_min}
              </span>
              <span className="px-4 py-1 rounded-lg bg-gray-300 text-sm font-medium">
                Mode Of Job: {currentJob?.mode_of_job}
              </span>
            </div>
            <hr />
            <div className="my-4">
              <h2 className="font-medium text-lg ">Job Description</h2>
              <span className="text-gray-500 text-base">
                {currentJob?.job_description}
              </span>
            </div>
            <hr />
            <div className="mt-4">
              <h5 className="text-md font-semibold">Assigned To</h5>
              <div className="flex flex-wrap justify-start gap-4 mt-3">
                <div className="text-center">
                  <div
                    className={`mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center`}
                  >
                    <User className="h-6 w-6" />
                  </div>
                  <span className="text-gray-700 text-xs font-medium">
                    {currentJob?.assigned?.email_id}
                  </span>
                  <div className="text-gray-500 text-xs mt-1">
                    Date: (
                    {currentJob?.assigned?.created_at &&
                      format(
                        new Date(currentJob?.assigned?.created_at),
                        "dd-MM-yyyy"
                      )}
                    )
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SheetModal>
      </div>
    </div>
  );
}
