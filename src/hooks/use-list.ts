import { getListData } from "@/app/actions/action";
import { useEffect, useState } from "react";

export const useList = (
  dbName: string,
  selectItems: string,
  label: string,
  value: string,
  listFilters?: any
) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result: any = await getListData(dbName, selectItems, listFilters);
      if (result.error || !result.data) {
        throw new Error(result.error || "Failed to fetch data");
      }

      const mappedData = result.data.map((record: any) => ({
        label: String(record[label]),
        value: String(record[value]),
      }));

      setData(mappedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dbName, selectItems, label, value]); // Add dependencies to refresh if params change

  return {
    data,
    isLoading,
    error,
    refetch: fetchData, // Expose refetch function for manual refresh
  };
};
