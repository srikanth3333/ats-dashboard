import { fetchTableDataWithForeignKey } from "@/app/actions/action";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export const useCardList = (
  tableName: string,
  foreignKeys: Record<string, string[]>,
  filters: Record<string, any>,
  searchTerm: string,
  searchColumns: string[],
  applyUserIdFilter?: boolean,
  profileId?: string,
  assignId?: string,
  applyCurrentUser?: boolean,
  includeNestedRelations?: boolean
) => {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const memoizedFilters = useMemo(() => JSON.stringify(filters), [filters]);

  const loadData = async (page: number) => {
    // setLoading(true);
    try {
      const response = await fetchTableDataWithForeignKey<any>({
        tableName,
        page,
        pageSize,
        columnToSort: "created_at",
        sortDirection: "desc",
        foreignKeys,
        filters,
        searchTerm,
        searchColumns,
        applyUserIdFilter,
        profileId,
        assignId,
        applyCurrentUser,
        includeNestedRelations,
      });

      setData(response.data);
      setTotalCount(response.totalCount);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to fetch data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, searchTerm, memoizedFilters, pageSize]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", currentPage.toString());
    router.push(url.pathname + url.search, { scroll: false });
  }, [currentPage, router, pageSize]);

  return {
    loading,
    totalCount,
    data,
    currentPage,
    setCurrentPage,
    error,
    setPageSize,
    pageSize,
    loadData,
  };
};
