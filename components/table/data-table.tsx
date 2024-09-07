"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

import { DataTablePagination } from "./data-table-pagination"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { DataTableToolbar } from "./data-table-toolbar"
import { facetedFilter } from "@/constants"
import { AlertModal } from "../modals/alert-modal"
import { useDeleteManyModal } from "@/hooks/use-delete-many-modal"
import { usePagination } from "@/hooks/use-pagination"
import { FormError } from "../auth/form-error"
import { Spinner } from "../ui/spinner"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  toolbar: {
    searchKeys: { accessorKey: string; label: string }[]
    facetedFilter?: facetedFilter
  }
  defaultColVisibility?: VisibilityState
  deleteManyFn?: (ids: string[]) => void
  isPendingDeleted?: boolean,
  APIPath: string
}

export function DataTable<TData, TValue>({
  columns,
  toolbar,
  deleteManyFn,
  isPendingDeleted,
  defaultColVisibility,
  APIPath
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const { pagination, onPaginationChange, data, loading, error, total } = usePagination(APIPath)
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(defaultColVisibility ?? {})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const { onClose, isOpen } = useDeleteManyModal()

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    onPaginationChange,
    rowCount: total
  })


  return (
    // <div className="space-y-4">
    //   <DataTableToolbar
    //   />
    //   <ScrollArea className="max-sm:w-[320px] overflow-auto">
    //     <div className=" h-fit">
    //       <div className="rounded-md border">
    <div className="space-y-4">
      <AlertModal
        isOpen={isOpen}
        loading={isPendingDeleted || false}
        onClose={onClose}
        onConfirm={() => {
          const rows = table.getFilteredSelectedRowModel().rows
          const ids = rows.map(row => {
            const originalValue = row.original as { id: string }
            return originalValue.id
          }) as string[];
          if (typeof deleteManyFn === 'function') {
            deleteManyFn(ids)
          }
        }}
      />
      {error && <FormError message="somthing want warnog!, Please try agin by refreash page" />}
      <DataTableToolbar
        table={table}
        facetedFilter={toolbar.facetedFilter}
        searchKeys={toolbar.searchKeys}
      />
      <ScrollArea className="overflow-auto">
        <div className="min-w-[700px] h-fit">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="w-full justify-center items-center flex h-full">
                        <Spinner />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No Results.
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <DataTablePagination table={table} />
    </div>
  )
}