import { fetchTableDataWithForeignKey } from "@/app/actions/action";
import { useState } from "react";

export const useFilter = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const applyFilters = async (
    filters: Record<string, any> = {},
    searchTerm: string = ""
  ) => {
    setLoading(true);
    try {
      const filteredData = await fetchTableDataWithForeignKey<any>({
        tableName: "job_posting",
        page: 1,
        pageSize: 10,
        filters,
        columnToSort: "created_at",
        sortDirection: "desc",
        foreignKeys: {
          client: ["id", "name", "contract_type"],
          user_profile: ["name", "role"],
        },
        searchTerm,
        searchColumns: searchTerm
          ? ["role", "job_status", "position", "mode_of_job", "name"]
          : [],
      });
      setTotalCount(0);
      setCurrentPage(1);
      setData(filteredData?.data || []);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    applyFilters({}, searchTerm);
  };

  return { loading, data };
};
