/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUser } from "@/app/context/UserContext";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Edit, Eye, Timer, Trash2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Badge } from "../ui/badge";
import EmptyView from "./EmptyView";

interface ColumnData {
  label: string;
  name: string;
  type?: string;
  onChange?: (...event: any[]) => void;
}

interface TableComponentProps {
  jsonData: Record<string, any>[];
  customHeaders?: string[];
  arrayData?: ColumnData[];
  loading?: boolean;
  paginate?: boolean;
  pageSize?: number;
  onchangePageSize?: (value: number) => void;
  pageSizeOptions?: string[];
  pageSizeSelected?: number;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: Record<string, any>) => void;
}

const DataTable: React.FC<TableComponentProps> = ({
  jsonData,
  onRowClick,
  arrayData,
  loading = false,
  paginate = false,
  onchangePageSize,
  pageSizeOptions = ["10", "20", "50", "100"],
  pageSizeSelected = 10,
  totalItems = 0,
  currentPage = 1,
  onPageChange,
}) => {
  const { user } = useUser();

  const columns =
    jsonData.length > 0
      ? Object.keys(jsonData[0]).map((key) => ({
          title: key.charAt(0).toUpperCase() + key.slice(1),
          dataIndex: key,
          sorter: (a: any, b: any) => a[key] - b[key],
          key,
        }))
      : [];

  const finalColumns = !arrayData
    ? columns
    : arrayData.map((data, i) => {
        if (data.type === "date") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            sorter: (a: any, b: any) => a[data.name] - b[data.name],
            render: (val: any) => {
              return (
                <div className="text-md font-medium flex gap-2 items-center">
                  <Timer /> {format(val, "dd MMM yyyy - hh:mm a")}
                </div>
              );
            },
          };
        }

        if (data.type === "link") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            sorter: (a: any, b: any) => a[data.name] - b[data.name],
            render: (val: any) => {
              console.log(val);
              return (
                <Link
                  href={`/dashboard/interviews/response-detail?id=${val?.link}`}
                >
                  {val?.count}
                </Link>
              );
            },
          };
        }

        if (data.type === "foreignkey") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            sorter: (a: any, b: any) => a[data.name] - b[data.name],
            render: (val: any) => {
              return (
                <div className="text-blue-800 underline cursor-pointer">
                  {val?.name}
                </div>
              );
            },
          };
        }

        if (data.type === "array") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            sorter: (a: any, b: any) => a[data.name] - b[data.name],
            render: (val: any) => {
              return (
                <div className="text-md font-medium flex gap-1 flex-wrap items-center">
                  {val?.map((record: string) => (
                    <Badge className="bg-foreground rounded-full px-3 py-1">
                      {record}
                    </Badge>
                  ))}
                </div>
              );
            },
          };
        }

        if (data.type === "action") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            sorter: (a: any, b: any) => a[data.name] - b[data.name],
            render: (val: any) => {
              const findUser = jsonData?.find(
                (record) =>
                  record?.email_id === user?.user?.email && record?.id === val
              );
              return (
                <div className="flex gap-5">
                  {findUser ? (
                    <>
                      <Badge>YOU</Badge>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() =>
                          data?.onChange && data?.onChange(val, data, "edit")
                        }
                        variant="outline"
                        size="icon"
                      >
                        <Edit />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          data?.onChange && data?.onChange(val, data, "delete")
                        }
                      >
                        <Trash2 />
                      </Button>
                    </>
                  )}
                </div>
              );
            },
          };
        }

        if (data.type === "switch") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            sorter: (a: any, b: any) => a[data.name] - b[data.name],
            render: (val: any) => {
              const item = val == true ? true : false;
              return (
                <div className="text-md font-medium">
                  <Switch
                    onCheckedChange={(checked: boolean) =>
                      data?.onChange?.(val, checked)
                    }
                    defaultChecked={item}
                  />
                </div>
              );
            },
          };
        }

        if (data.type === "link") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            sorter: (a: any, b: any) => a[data.name] - b[data.name],
            render: (val: any) => {
              return (
                <span className="text-blue-500 text-md font-medium items-center cursor-pointer">
                  <a
                    target="_blank"
                    href={val}
                    className="flex gap-1 items-center"
                  >
                    <Eye /> View Resume
                  </a>
                </span>
              );
            },
          };
        }

        if (data.type === "status") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            sorter: (a: any, b: any) =>
              a[data.name].localeCompare(b[data.name]),
            render: (val: any) => {
              return (
                <span className="flex items-center text-md font-medium gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      val.toLowerCase() === "completed"
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  ></span>
                  {val}
                </span>
              );
            },
          };
        }

        if (data.type === "badge") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            sorter: (a: any, b: any) => a[data.name] - b[data.name],
            render: (val: any) => {
              return (
                <span
                  className={`px-3 py-1 rounded-full text-md font-medium text-sm font-medium ${
                    val < 50
                      ? "bg-red-100 text-red-600"
                      : val < 75
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                  }`}
                >
                  {val}
                </span>
              );
            },
          };
        }

        if (data.type === "level") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            sorter: (a: any, b: any) =>
              a[data.name].localeCompare(b[data.name]),
            render: (val: any) => {
              return (
                <span
                  className={`px-3 py-1 text-md font-medium rounded-full text-sm font-medium ${
                    val.toLowerCase() === "average"
                      ? "bg-yellow-100 text-yellow-600"
                      : val.toLowerCase() === "good"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  {val}
                </span>
              );
            },
          };
        }

        if (data.type === "fit-level") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            sorter: (a: any, b: any) =>
              a[data.name].localeCompare(b[data.name]),
            render: (val: any) => {
              const bars =
                val.toLowerCase() === "moderate"
                  ? 3
                  : val.toLowerCase() === "high"
                    ? 5
                    : 1;
              return (
                <div className="flex gap-1 text-md font-medium justify-center">
                  {Array.from({ length: bars }).map((_, idx) => (
                    <span
                      key={idx}
                      className="w-2 h-5 rounded bg-orange-400"
                    ></span>
                  ))}
                </div>
              );
            },
          };
        }

        if (data.type === "hiring-stage") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            sorter: (a: any, b: any) =>
              a[data.name].localeCompare(b[data.name]),
            render: (val: any) => {
              return (
                <span
                  className={`px-3 py-1 rounded-full  text-md font-medium flex items-center justify-center gap-2 ${
                    val.toLowerCase() === "rejected"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  <span
                    className={`w-2 h-2  rounded-full ${
                      val.toLowerCase() === "rejected"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  ></span>
                  {val}
                </span>
              );
            },
          };
        }

        return {
          title: `${data.label}`,
          dataIndex: `${data.name}`,
          key: i,
          width: 150,
          textWrap: "word-break",
          ellipsis: true,
          sorter: (a: any, b: any) => a[data.name].localeCompare(b[data.name]),
          render: (val: any) => (
            <span className="flex items-center gap-2 h-12 font-medium text-md">
              {i === 0 && (
                <span className="text-yellow-500">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm1-3.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                  </svg>
                </span>
              )}
              {val}
            </span>
          ),
        };
      });

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSizeSelected);
  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * pageSizeSelected + 1;
  const endItem = Math.min(currentPage * pageSizeSelected, totalItems);

  return (
    <div className="w-full">
      <div className="border border-gray-300 bg-white ">
        <Table className="">
          <TableHeader>
            <TableRow className="bg-white h-16">
              {finalColumns.map((column: any) => (
                <TableHead
                  key={column.key}
                  className="py-3 px-4 border-r-1 font-medium text-gray-600 border-b border-gray-200"
                >
                  <div className="flex items-center gap-2 font-semibold text-base">
                    {column.title === "Fit Level" && (
                      <span className="text-gray-500">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </span>
                    )}
                    {column.title}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={finalColumns.length + 1}
                  className="h-24 text-center border-r-1"
                >
                  <div className="space-y-2">
                    {Array.from({ length: pageSizeSelected || 10 }).map(
                      (_, index) => (
                        <Skeleton
                          key={index}
                          className="h-8 w-full rounded-md bg-gray-200"
                        />
                      )
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : jsonData.length > 0 ? (
              jsonData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {finalColumns.map((column: any, colIndex: number) => (
                    <TableCell
                      key={`${rowIndex}-${colIndex}`}
                      className={`border-r-1
                        ${column.textWrap === "word-break" ? "break-words" : ""}
                        ${column.ellipsis ? "truncate" : ""}
                        py-3 px-4 text-gray-600 border-b border-gray-200
                      `}
                    >
                      {column.render
                        ? column.render(row[column.dataIndex])
                        : row[column.dataIndex]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={finalColumns.length + 1}
                  className="h-24 text-center text-gray-500 border-b border-gray-200"
                >
                  <EmptyView />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600 font-semibold">
          {totalItems > 0 ? (
            <>
              Showing {startItem} to {endItem} of {totalItems} entries
            </>
          ) : (
            <>No entries found</>
          )}
        </div>
        <div className="flex gap-5">
          {paginate && (
            <div className="flex items-center space-x-3 font-semibold">
              <span className="text-sm flex text-gray-600">Rows per page:</span>
              <div>
                <Select
                  value={pageSizeSelected.toString()}
                  onValueChange={(value) =>
                    onchangePageSize && onchangePageSize(parseInt(value))
                  }
                >
                  <SelectTrigger className="w-20 bg-white border-gray-200 text-gray-700 focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
                    <SelectValue placeholder={pageSizeSelected.toString()} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-gray-700">
                    {pageSizeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-6 ">
            {totalPages > 0 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        currentPage > 1 && handlePageChange(currentPage - 1)
                      }
                      className={`font-semibold cursor-pointer
                      ${
                        currentPage <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      text-gray-600 hover:bg-gray-100
                      transition-colors duration-150 rounded-md
                    `}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;

                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={pageNum === currentPage}
                          className={`font-semibold cursor-pointer
                          ${
                            pageNum === currentPage
                              ? "bg-primary text-white"
                              : "text-gray-600"
                          }
                          hover:bg-gray-100
                          transition-colors duration-150 rounded-md
                        `}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis className="text-gray-600" />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        currentPage < totalPages &&
                        handlePageChange(currentPage + 1)
                      }
                      className={`font-semibold cursor-pointer
                      ${
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      text-gray-600 hover:bg-gray-100
                      transition-colors duration-150 rounded-md
                    `}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
