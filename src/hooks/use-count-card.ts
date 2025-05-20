"use client";
import { fetchTableDataTotalCount } from "@/app/actions/action";
import { formatISO, startOfDay } from "date-fns";
import { useEffect, useState } from "react";

interface DashboardData {
  title: string;
  value: number;
  percentChange: number;
  trend: string;
  color: string;
}

export function useCountCard(countCards: any[], filters: any) {
  const [dashboardData, setDashboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchCounts() {
    if (countCards.length === 0) {
      setError("No count cards provided");
      return;
    }
    setError(null);

    try {
      const counts = await Promise.all(
        countCards.map(
          ({
            tableName,
            profileId,
            assignId,
            applyUserIdFilter,
            applyCurrentUser,
            filters: cardFilters,
          }) => {
            const effectiveProfileId = profileId;
            const effectiveAssignId = assignId;

            if (!effectiveProfileId || !effectiveAssignId) {
              throw new Error(`Missing profileId or assignId for ${tableName}`);
            }

            let mergedFilters: Record<string, any> = { ...cardFilters };

            if (filters && filters.created_at) {
              const dateValue =
                typeof filters.created_at === "string"
                  ? new Date(filters.created_at)
                  : filters.created_at;

              const start = startOfDay(dateValue);
              mergedFilters.created_at = {
                operator: "gte",
                value: formatISO(start),
              };
            }

            return fetchTableDataTotalCount({
              tableName,
              profileId: effectiveProfileId,
              assignId: effectiveAssignId,
              applyUserIdFilter,
              applyCurrentUser,
              filters: mergedFilters,
            });
          }
        )
      );
      const data: DashboardData[] = countCards.map(
        (
          {
            title,
            color,
            tableName,
            profileId,
            assignId,
            applyUserIdFilter,
            applyCurrentUser,
            filters,
          },
          index
        ) => ({
          title,
          value: counts[index],
          percentChange: 0,
          trend: "0",
          color,
          tableName,
          profileId,
          assignId,
          applyUserIdFilter,
          applyCurrentUser,
          filters,
        })
      );

      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching count card data:", err);
      setError("Failed to load count card data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCounts();
  }, [countCards?.length]);

  return { dashboardData, loading, error, fetchCounts };
}
