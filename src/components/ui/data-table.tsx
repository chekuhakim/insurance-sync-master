
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

interface DataTableColumn<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  enableSorting?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyField: keyof T;
  searchPlaceholder?: string;
  searchFields?: Array<keyof T>;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  searchPlaceholder = "Search...",
  searchFields = [],
  onRowClick,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter data based on search query
  const filteredData = data.filter((row) => {
    if (!searchQuery || searchFields.length === 0) return true;
    
    return searchFields.some((field) => {
      const value = row[field];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  // Sort data if a sort column is selected
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue === bValue) return 0;
    
    // Handle different types
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc" 
        ? aValue.getTime() - bValue.getTime() 
        : bValue.getTime() - aValue.getTime();
    }
    
    // Convert to strings for comparison
    const aString = String(aValue || "");
    const bString = String(bValue || "");
    
    return sortDirection === "asc" 
      ? aString.localeCompare(bString) 
      : bString.localeCompare(aString);
  });

  const handleSort = (column: DataTableColumn<T>) => {
    if (typeof column.accessorKey !== "string" || !column.enableSorting) return;
    
    if (sortColumn === column.accessorKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column.accessorKey as keyof T);
      setSortDirection("asc");
    }
  };

  return (
    <Card className="overflow-hidden border border-border/50 bg-white/50 backdrop-blur-sm animate-fade-in">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/70 border-border/50 focus:border-primary/50 focus:ring-primary/30"
          />
        </div>
      </div>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card border-b">
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead 
                    key={index} 
                    className={column.className}
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.enableSorting && sortColumn === column.accessorKey && (
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((row) => (
                  <TableRow 
                    key={String(row[keyField])} 
                    className={`
                      transition-colors hover:bg-muted/50
                      ${onRowClick ? "cursor-pointer" : ""}
                    `}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((column, index) => (
                      <TableCell key={index} className={column.className}>
                        {typeof column.accessorKey === "function" 
                          ? column.accessorKey(row)
                          : row[column.accessorKey] !== undefined 
                            ? String(row[column.accessorKey])
                            : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
