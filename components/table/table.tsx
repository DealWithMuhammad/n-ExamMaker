import React from "react";
import {
  Table as NextUITable,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { Column, User, columns, users } from "./data";

interface TableProps {
  onViewDetails: (userId: number) => void;
}

export const Table: React.FC<TableProps> = ({ onViewDetails }) => {
  return (
    <NextUITable aria-label="Example table with custom cells"></NextUITable>
  );
};
