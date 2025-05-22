import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { db } from "@/app/api/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { FaSearch, FaChevronDown } from "react-icons/fa";

interface MemberData {
  id: string;
  name: string;
  dateOfBirth: any; // Could be string or Firestore timestamp
  age: number;
  tanzeemStatus?: string;
}

export const MemberAgeTable = () => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterValue, setFilterValue] = useState("");
  const [sortDirection, setSortDirection] = useState<
    "ascending" | "descending"
  >("ascending");
  const [tanzeemFilter, setTanzeemFilter] = useState<
    "all" | "khuddam" | "atfal"
  >("all");

  // Calculate age from date of birth
  const calculateAge = (dob: any): number => {
    if (!dob) return 0;

    let birthDate;
    try {
      // Handle different date formats
      if (typeof dob === "string") {
        birthDate = new Date(dob);
      } else if (dob.toDate) {
        // Handle Firestore Timestamp
        birthDate = dob.toDate();
      } else {
        return 0;
      }

      if (birthDate && !isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        // Adjust age if birthday hasn't occurred yet this year
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        return age;
      }
    } catch (error) {
      console.error("Error calculating age:", error);
    }
    return 0;
  };

  // Fetch member data
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "formSubmissions"));

        const membersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const age = calculateAge(data.dateOfBirth);

          return {
            id: doc.id,
            name: data.name || "Unknown",
            dateOfBirth: data.dateOfBirth,
            age: age,
            tanzeemStatus: data.tanzeemStatus?.toLowerCase() || "unknown",
          };
        });

        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching member data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filter members based on search and tanzeem status
  const filteredMembers = useMemo(() => {
    let filtered = [...members];

    // Apply tanzeem filter
    if (tanzeemFilter !== "all") {
      filtered = filtered.filter(
        (member) => member.tanzeemStatus === tanzeemFilter
      );
    }

    // Apply search filter
    if (filterValue) {
      filtered = filtered.filter((member) =>
        member.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // Sort by age
    filtered.sort((a, b) => {
      if (sortDirection === "ascending") {
        return a.age - b.age;
      } else {
        return b.age - a.age;
      }
    });

    return filtered;
  }, [members, filterValue, tanzeemFilter, sortDirection]);

  // Pagination
  const pages = Math.ceil(filteredMembers.length / rowsPerPage);

  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredMembers.slice(start, end);
  }, [filteredMembers, page, rowsPerPage]);

  // Calculated summary statistics
  const stats = useMemo(() => {
    if (filteredMembers.length === 0) return null;

    const ages = filteredMembers.map((member) => member.age);
    const totalMembers = ages.length;
    const avgAge = (
      ages.reduce((sum, age) => sum + age, 0) / totalMembers
    ).toFixed(1);
    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);

    // Calculate most common age (mode)
    const ageFrequency: { [key: number]: number } = {};
    let modeAge = ages[0];
    let maxCount = 0;

    ages.forEach((age) => {
      ageFrequency[age] = (ageFrequency[age] || 0) + 1;
      if (ageFrequency[age] > maxCount) {
        maxCount = ageFrequency[age];
        modeAge = age;
      }
    });

    return { totalMembers, avgAge, minAge, maxAge, modeAge };
  }, [filteredMembers]);

  // Get the current tanzeem label for display
  const currentTanzeemLabel = useMemo(() => {
    switch (tanzeemFilter) {
      case "khuddam":
        return "Khuddam";
      case "atfal":
        return "Atfal";
      default:
        return "All Members";
    }
  }, [tanzeemFilter]);

  return (
    <div className="flex flex-col gap-4">
      <CardHeader className="px-0 pb-0 pt-2 flex-col items-start">
        <h4 className="font-bold text-xl">Tajneed Age Table</h4>
        <p className="text-default-500">
          Detailed age breakdown by individual tajneed
        </p>
      </CardHeader>

      {/* Filters and search */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-3">
        <div className="flex flex-grow gap-3 max-w-md">
          <Input
            className="w-full"
            placeholder="Search by name"
            startContent={<FaSearch className="text-default-300" />}
            value={filterValue}
            onValueChange={setFilterValue}
          />
        </div>

        <div className="flex gap-2">
          <Button
            color={sortDirection === "ascending" ? "primary" : "default"}
            onClick={() => setSortDirection("ascending")}
            size="sm"
          >
            Age ↑
          </Button>
          <Button
            color={sortDirection === "descending" ? "primary" : "default"}
            onClick={() => setSortDirection("descending")}
            size="sm"
          >
            Age ↓
          </Button>
          <Dropdown>
            <DropdownTrigger>
              <Button
                color={
                  tanzeemFilter === "all"
                    ? "default"
                    : tanzeemFilter === "khuddam"
                    ? "primary"
                    : "warning"
                }
                endContent={<FaChevronDown className="text-xs" />}
                size="sm"
              >
                {currentTanzeemLabel}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Tanzeem Filter"
              onAction={(key) => {
                setTanzeemFilter(key as "all" | "khuddam" | "atfal");
                setPage(1);
              }}
            >
              <DropdownItem key="all">All Members</DropdownItem>
              <DropdownItem key="khuddam">Khuddam Only</DropdownItem>
              <DropdownItem key="atfal">Atfal Only</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner color="primary" size="lg" />
        </div>
      ) : (
        <>
          <Table
            aria-label="Member Age Table"
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={pages}
                  onChange={setPage}
                />
              </div>
            }
            classNames={{
              wrapper: "min-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>AGE</TableColumn>
              <TableColumn>TANZEEM</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No members found" items={paginatedMembers}>
              {(member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.age} years</TableCell>
                  <TableCell className="capitalize">
                    {member.tanzeemStatus}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center px-2 py-2">
            <span className="text-default-400 text-small">
              Total {filteredMembers.length} {currentTanzeemLabel}
            </span>
            <div className="flex items-center">
              <span className="text-default-400 text-small mr-2">
                Rows per page:
              </span>
              <select
                className="bg-transparent text-default-400 text-small"
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                value={rowsPerPage}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MemberAgeTable;
