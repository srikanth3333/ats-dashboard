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

  useEffect(() => {
    async function fetchCounts() {
      if (countCards.length === 0) {
        setError("No count cards provided");
        return;
      }

      // setLoading(true);
      setError(null);

      try {
        // Fetch counts for all cards
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
                throw new Error(
                  `Missing profileId or assignId for ${tableName}`
                );
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
          ({ title, color }, index) => ({
            title,
            value: counts[index],
            percentChange: 0,
            trend: "0",
            color,
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

    fetchCounts();
  }, [countCards?.length]);

  return { dashboardData, loading, error };
}
