import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "../ui/card";

export function SkeletonCard({
  width,
  grids,
  title,
}: {
  width: string;
  grids: number;
  title?: string;
}) {
  const array = Array.from({ length: grids }, (_, i) => i);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <div className={`${width}`}>
        {array?.map((_) => (
          <Card
            key={_}
            className={`bg-white shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <CardContent className="p-3">
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
