import { Button } from "@/components/ui/button";
import { useCardList } from "@/hooks/use-card-list";
import { format } from "date-fns";
import { ArrowRight, CircleUserRound } from "lucide-react";
import { SkeletonCard } from "../Loader";

interface ClientDetailProps {
  selectedItem: {
    applyCurrentUser?: boolean;
    assignId?: string;
    profileId?: string;
  };
}

export function ClientDetail({ selectedItem }: ClientDetailProps) {
  const { applyCurrentUser, assignId, profileId } = selectedItem;

  const {
    pageSize,
    data,
    loading,
    error,
    totalCount,
    currentPage,
    setCurrentPage,
  } = useCardList(
    "clients",
    {},
    {},
    "",
    ["name", "contract_type"],
    applyCurrentUser,
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

  return (
    <div className="">
      <div className="flex justify-between items-center my-6">
        <h1 className="text-3xl font-bold">Client Details</h1>
      </div>

      {loading && (
        <p className="text-muted-foreground text-center">Loading...</p>
      )}
      {error && <p className="text-destructive text-center">Error: {error}</p>}
      {!loading && !error && data?.length === 0 && (
        <p className="text-muted-foreground text-center">No clients found.</p>
      )}

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
                  <h3 className="text-lg font-medium">{record?.name}</h3>
                  <span className="text-muted-foreground text-sm">
                    {record?.contract_type} /
                    <span className="ml-1">
                      {record?.start_date
                        ? format(new Date(record.start_date), "dd-MM-yyyy")
                        : "N/A"}
                    </span>
                  </span>
                </div>
              </div>
              <ArrowRight className="text-muted-foreground" />
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
