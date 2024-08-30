"use client"

import { useState } from "react"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { DataTableViewOptions } from "./data-table-view-options"
import { RotateCw } from "lucide-react"
import { facetedFilter } from "@/constants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKeys: { accessorKey: string; label: string }[]
  facetedFilter?: facetedFilter
}

export function DataTableToolbar<TData>({
  table,
  searchKeys,
  facetedFilter
}: DataTableToolbarProps<TData>) {
  const [selectedSearchKey, setSelectedSearchKey] = useState(searchKeys[0])
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center px-1.5 md:p-0 justify-between">
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 flex-1 md:items-center space-x-2">
        <div className="flex flex-col sm:flex-row gap-2 grow">
          <Select
            value={`${selectedSearchKey.accessorKey}`}
            onValueChange={(value) => {
              table.getColumn(selectedSearchKey.accessorKey)?.setFilterValue('')
              setSelectedSearchKey(
                searchKeys.find((searchKey) => searchKey.accessorKey === value) ?? searchKeys[0]
              )
            }}
          >
            <SelectTrigger className="w-full sm:w-[150px] h-9 capitalize space-x-2">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent side="bottom">
              <SelectItem disabled value="null">
              Search by
              </SelectItem>
              {searchKeys.map((searchKey) => (
                <SelectItem
                  key={searchKey.accessorKey}
                  value={`${searchKey.accessorKey}`}
                  className="capitalize"
                >
                  {searchKey.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder={`Search by ${selectedSearchKey.label}`}
            value={(table.getColumn(selectedSearchKey.accessorKey)?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn(selectedSearchKey.accessorKey)?.setFilterValue(event.target.value)
            }
            className="sm:max-w-sm h-9"
          />
          {facetedFilter && table.getColumn(facetedFilter.accessorKey) && (
            <DataTableFacetedFilter
              column={table.getColumn(facetedFilter.accessorKey)}
              title={facetedFilter.label}
              options={facetedFilter.options}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <RotateCw className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex flex-1 md:justify-end md:gap-x-2">
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </div >
  )
}