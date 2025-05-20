import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number;
  percentChange: number;
  trend: string;
  color: "purple" | "yellow" | "orange";
  onClick?: (val: any) => void;
  tableName: string;
  profileId: string;
  assignId: string;
  applyUserIdFilter: boolean;
  applyCurrentUser: boolean;
  filters: any;
}

export default function CountsCard({
  title,
  data,
  onClick,
}: {
  title: string;
  data: any;
  onClick?: (val: any) => void;
}) {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {data?.map((record: any) => (
          <StatsCard
            title={record?.title}
            value={record?.value}
            percentChange={record?.percentChange}
            trend={record?.trend}
            color={record?.color}
            tableName={record?.tableName}
            onClick={onClick}
            profileId={record?.profileId}
            assignId={record?.assignId}
            applyUserIdFilter={record?.applyUserIdFilter}
            applyCurrentUser={record?.applyCurrentUser}
            filters={record?.filters}
          />
        ))}
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  percentChange,
  trend,
  color,
  tableName,
  profileId,
  assignId,
  applyUserIdFilter,
  applyCurrentUser,
  onClick,
  filters,
}: StatsCardProps) {
  const textColorMap = {
    purple: "text-purple-600",
    yellow: "text-yellow-500",
    orange: "text-orange-500",
  };
  return (
    <Card
      className="shadow-sm py-4 cursor-pointer"
      onClick={() => {
        if (onClick) {
          onClick({
            tableName,
            profileId,
            assignId,
            applyUserIdFilter,
            applyCurrentUser,
            filters,
          });
        }
      }}
    >
      <CardContent className="px-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`font-medium mb-1 ${color}`}>{title}</h3>
            <p className="text-4xl font-bold">{value.toLocaleString()}</p>
            <p className="text-sm mt-2 text-gray-600">{trend}</p>
          </div>
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
            <div
              className={`absolute border rounded-full border-8 border-${textColorMap[color]} inset-0 flex items-center justify-center`}
            >
              <span className={`text-xl font-medium ${color}`}>
                +{percentChange}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
