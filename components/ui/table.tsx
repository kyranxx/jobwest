import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ref, ...props }: React.ComponentPropsWithRef<"table">) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}
Table.displayName = "Table"

function TableHeader({ className, ref, ...props }: React.ComponentPropsWithRef<"thead">) {
  return <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
}
TableHeader.displayName = "TableHeader"

function TableBody({ className, ref, ...props }: React.ComponentPropsWithRef<"tbody">) {
  return (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}
TableBody.displayName = "TableBody"

function TableRow({ className, ref, ...props }: React.ComponentPropsWithRef<"tr">) {
  return (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}
TableRow.displayName = "TableRow"

function TableHead({ className, ref, ...props }: React.ComponentPropsWithRef<"th">) {
  return (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}
TableHead.displayName = "TableHead"

function TableCell({ className, ref, ...props }: React.ComponentPropsWithRef<"td">) {
  return (
    <td
      ref={ref}
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
}
TableCell.displayName = "TableCell"

export {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
}
