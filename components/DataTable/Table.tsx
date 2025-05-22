import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  User,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
  useDisclosure,
  Link,
  CardBody,
  Avatar,
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { FaPlus, FaEllipsisV, FaChevronDown, FaSearch } from "react-icons/fa";
import { capitalize } from "./utlis";
import { db } from "@/app/api/firebaseConfig";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { LuTableProperties } from "react-icons/lu";
import CardLayout from "./CardLayout";
import { useRouter } from "next/navigation";
import { PiExportFill } from "react-icons/pi";
import * as XLSX from "xlsx";
// Import jsPDF and html2canvas for PDF generation
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface UserType {
  id: string;
  [key: string]: any;
  profilePicture?: string;
  tanzeemStatus?: string;
}

type TanzeemFilter = "all" | "khuddam" | "atfal";

const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "unhcrId",
  "aimsNumber",
  "address",
  "actions",
];

const EXCLUDED_COLUMNS = new Set(["id", "profilePictureUrl", "profilePicture"]);

const formatLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
};

export default function TableApp() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const [searchColumn, setSearchColumn] = useState("name");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [isCardLayout, setIsCardLayout] = useState(true);
  const [tanzeemFilter, setTanzeemFilter] = useState<TanzeemFilter>("all");
  const router = useRouter();
  // Add a ref for the PDF export content
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [userToExport, setUserToExport] = useState<UserType | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  const searchableColumns = Object.keys(users[0] || {});
  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "formSubmissions"));
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        profilePicture: doc.data().profilePictureUrl || null,
      }));
      setUsers(userData);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search and tanzeem status
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // First apply tanzeem filter
    if (tanzeemFilter !== "all") {
      filtered = filtered.filter(
        (user) => user.tanzeemStatus?.toLowerCase() === tanzeemFilter
      );
    }

    // Then apply search filter
    if (filterValue) {
      filtered = filtered.filter((user) =>
        String(user[searchColumn]?.toString() || "")
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }

    return filtered;
  }, [users, filterValue, searchColumn, tanzeemFilter]);

  // Calculate total pages
  const pages = Math.ceil(filteredUsers.length / rowsPerPage);

  // Get paginated data
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [page, filteredUsers, rowsPerPage]);

  // Sort paginated data
  const sortedUsers = useMemo(() => {
    return [...paginatedUsers].sort((a, b) => {
      const aValue = (a[sortDescriptor.column as string] || "").toString();
      const bValue = (b[sortDescriptor.column as string] || "").toString();
      return sortDescriptor.direction === "descending"
        ? bValue.localeCompare(aValue)
        : aValue.localeCompare(bValue);
    });
  }, [paginatedUsers, sortDescriptor]);

  // Get the current tanzeem label for display
  const currentTanzeemLabel = useMemo(() => {
    switch (tanzeemFilter) {
      case "khuddam":
        return "Khuddam";
      case "atfal":
        return "Atfal";
      default:
        return "Total";
    }
  }, [tanzeemFilter]);

  // Handle delete
  const handleDelete = async (user: UserType) => {
    setUserToDelete(user);
    onDeleteModalOpen();
  };

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleExport = useCallback(() => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Get filtered data based on current tanzeem filter for export
    let dataToExport = users;
    if (tanzeemFilter !== "all") {
      dataToExport = users.filter(
        (user) => user.tanzeemStatus?.toLowerCase() === tanzeemFilter
      );
    }

    // Filter out excluded columns and prepare data for export
    const exportData = dataToExport.map((user) => {
      const filteredUser: { [key: string]: any } = {};
      Object.entries(user).forEach(([key, value]) => {
        if (!EXCLUDED_COLUMNS.has(key)) {
          // Format arrays to strings if needed
          filteredUser[formatLabel(key)] = Array.isArray(value)
            ? value.join(", ")
            : value;
        }
      });
      return filteredUser;
    });

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, currentTanzeemLabel);

    // Generate timestamp for filename
    const timestamp = new Date().toISOString().split("T")[0];

    // Save the file
    XLSX.writeFile(
      wb,
      `${currentTanzeemLabel.toLowerCase()}_export_${timestamp}.xlsx`
    );
  }, [users, tanzeemFilter, currentTanzeemLabel]);

  // New function to export a single user to PDF
  const handleExportToPdf = useCallback((user: UserType) => {
    setUserToExport(user);
    setIsPdfModalOpen(true);
  }, []);

  // Function to generate and download PDF
  const generatePdf = useCallback(async () => {
    if (!userToExport) return;

    const pdfContent = document.getElementById("pdf-export-content");
    if (!pdfContent) return;

    try {
      // Showing loading toast
      const loadingToast = toast.loading("Generating PDF...");

      const canvas = await html2canvas(pdfContent, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // To handle cross-origin images
        logging: false,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");

      // A4 size: 210 x 297 mm
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210 - 20; // A4 width minus margins
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10; // Starting position

      // First page
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      // Add new pages if content is longer than one page
      while (heightLeft > 0) {
        position = 10;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          10,
          position - (pageHeight - 20),
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight - 20;
      }

      // Generate filename with user's name and current date
      const userName = userToExport.name?.replace(/\s+/g, "_") || "user";
      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `${userName}_profile_${timestamp}.pdf`;

      pdf.save(fileName);

      // Close the modal after successful export
      setIsPdfModalOpen(false);
      setUserToExport(null);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  }, [userToExport]);

  const executeDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteDoc(doc(db, "formSubmissions", userToDelete.id));
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userToDelete.id)
      );
      toast.success("User deleted successfully");
      onDeleteModalClose();
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user: ", error);
      toast.error("Failed to delete user");
    }
  };

  // Handle tab change for tanzeem filter
  const handleTanzeemFilterChange = (key: React.Key) => {
    setTanzeemFilter(key as TanzeemFilter);
    setPage(1); // Reset to first page when filter changes
  };

  // Render cell content
  const renderCell = useCallback(
    (user: UserType, columnKey: React.Key) => {
      const cellValue = user[columnKey as keyof UserType];

      switch (columnKey) {
        case "name":
          return (
            <User
              avatarProps={{ radius: "lg", src: user.profilePicture || "" }}
              description={user.aimsNumber}
              name={cellValue}
            >
              {user.aimsNumber}
            </User>
          );
        case "actions":
          return (
            <div className="relative flex items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <FaEllipsisV className="text-default-300" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem onPress={() => openProfileModal(user)}>
                    View
                  </DropdownItem>
                  <DropdownItem onPress={() => router.push(`/edit/${user.id}`)}>
                    Edit
                  </DropdownItem>
                  <DropdownItem onPress={() => handleExportToPdf(user)}>
                    Export to PDF
                  </DropdownItem>
                  <DropdownItem
                    className="text-danger"
                    color="danger"
                    onPress={() => handleDelete(user)}
                  >
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [handleExportToPdf]
  );

  // Pagination handlers
  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  // Search handlers
  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const openProfileModal = useCallback(
    (user: UserType) => {
      setSelectedUser(user);
      onOpen();
    },
    [onOpen]
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-end mb-3">
          <div className="flex gap-3 w-full">
            <Input
              // isClearable
              className="w-full"
              placeholder={`Search`}
              startContent={<FaSearch className="text-default-300" />}
              value={filterValue}
              onValueChange={onSearchChange}
            />
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  className="absolute right-[210px] top-[85px] italic text-default-600"
                  variant="light"
                  endContent={<FaChevronDown className="text-xs" />}
                >
                  <span className="hidden relative left-1 md:flex">
                    Search by
                  </span>
                  {formatLabel(searchColumn)}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                className="overflow-y-scroll h-[200px]"
                aria-label="Search column selection"
                onAction={(key) => setSearchColumn(key as string)}
              >
                {searchableColumns.map((column) => (
                  <DropdownItem key={column}>
                    {formatLabel(column)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <Button
            color={
              tanzeemFilter === "all"
                ? "default"
                : tanzeemFilter === "khuddam"
                ? "primary"
                : "warning"
            }
            onClick={() => {
              // Cycle through the three states
              if (tanzeemFilter === "all") {
                setTanzeemFilter("khuddam");
              } else if (tanzeemFilter === "khuddam") {
                setTanzeemFilter("atfal");
              } else {
                setTanzeemFilter("all");
              }
              setPage(1); // Reset to first page when filter changes
            }}
          >
            {currentTanzeemLabel}
          </Button>
          <Button isIconOnly onPress={handleExport}>
            <PiExportFill className="h-5 w-5" />
          </Button>
          <Button
            isIconOnly
            onPress={() => setIsCardLayout(!isCardLayout)}
            color={isCardLayout ? "primary" : "default"}
          >
            <LuTableProperties className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }, [
    filterValue,
    searchColumn,
    onSearchChange,
    onRowsPerPageChange,
    filteredUsers.length,
    onClear,
    isCardLayout,
    tanzeemFilter,
    currentTanzeemLabel,
  ]);

  // Bottom content with pagination
  const bottomContent = useMemo(() => {
    return (
      <div className=" px-2 flex justify-between items-center">
        <span className="text-default-400 text-small">
          Total {filteredUsers.length} {currentTanzeemLabel}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          radius="full"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div></div>
      </div>
    );
  }, [
    selectedKeys,
    filteredUsers.length,
    page,
    pages,
    onPreviousPage,
    onNextPage,
  ]);

  // Render table content
  const renderContent = () => {
    if (isLoading) {
      return (
        <TableBody emptyContent={" "}>
          {Array(rowsPerPage)
            .fill(null)
            .map((_, index) => (
              <TableRow key={index}>
                {INITIAL_VISIBLE_COLUMNS.map((columnKey) => (
                  <TableCell key={columnKey}>
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      );
    }

    return (
      <TableBody items={sortedUsers}>
        {(user) => (
          <TableRow key={user.id}>
            {(columnKey) => (
              <TableCell>{renderCell(user, columnKey.toString())}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    );
  };

  return (
    <>
      <div className="w-full">
        {/* {topContent} */}
        {topContent}

        {isCardLayout ? (
          <div>
            <CardLayout
              users={sortedUsers}
              openProfileModal={openProfileModal}
              handleDelete={handleDelete}
              isLoading={isLoading}
              handleExportToPdf={handleExportToPdf}
            />

            {bottomContent}
          </div>
        ) : (
          <Table
            aria-label="Example table with Firestore data"
            isHeaderSticky
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{
              wrapper: "max-h-[455px]",
            }}
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            sortDescriptor={sortDescriptor}
            // topContent={topContent}
            topContentPlacement="outside"
            onSelectionChange={setSelectedKeys}
            onSortChange={setSortDescriptor}
          >
            <TableHeader>
              {INITIAL_VISIBLE_COLUMNS.map((col) => (
                <TableColumn className="uppercase" key={col} allowsSorting>
                  {formatLabel(col)}
                </TableColumn>
              ))}
            </TableHeader>
            {renderContent()}
          </Table>
        )}
      </div>
      {/* View Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>
            {selectedUser?.tanzeemStatus || "Member"} Details
          </ModalHeader>
          <ModalBody>
            {selectedUser && (
              <Card>
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-full flex items-center gap-4 mb-4">
                    <Avatar
                      src={selectedUser.profilePicture}
                      size="lg"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        if (selectedUser.profilePicture) {
                          setSelectedImage(selectedUser.profilePicture);
                          setIsImageModalOpen(true);
                        }
                      }}
                    />
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedUser.name}
                      </h2>
                      <p className="text-default-500">
                        {selectedUser.aimsNumber}
                      </p>
                    </div>
                  </div>

                  {Object.entries(selectedUser).map(
                    ([key, value]) =>
                      !EXCLUDED_COLUMNS.has(key) && (
                        <div key={key}>
                          <p className="font-semibold text-sm">
                            {formatLabel(key)}
                          </p>
                          <p className="text-default-600">
                            {Array.isArray(value)
                              ? value.join(", ")
                              : value || (
                                  <span className="text-default-400">N/A</span>
                                )}
                          </p>
                        </div>
                      )
                  )}
                </CardBody>
              </Card>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Full Screen Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        size="full"
        classNames={{
          closeButton: "absolute right-4 top-4 bg-white/30 backdrop-blur-sm",
        }}
      >
        <ModalContent>
          <ModalBody className="p-0 flex items-center justify-center">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full screen"
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* PDF Export Preview Modal */}
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          setUserToExport(null);
        }}
        scrollBehavior="inside"
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Export User Profile to PDF
          </ModalHeader>
          <ModalBody>
            {userToExport && (
              <div id="pdf-export-content" className="p-4 bg-white">
                {/* Header with logo and organization name */}
                {/* <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <p className="text-right text-sm text-gray-500">
                    Generated on: {new Date().toLocaleDateString()}
                  </p>
                </div> */}

                {/* Profile header section */}
                <div className="flex items-center gap-6">
                  {userToExport.profilePicture ? (
                    <img
                      src={userToExport.profilePicture}
                      alt="Profile"
                      className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-black">No Photo</span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-black">
                      {userToExport.name}
                    </h2>
                    <p className="text-xl text-gray-600">
                      {userToExport.tanzeemStatus || "Member"}
                    </p>
                    {userToExport.aimsNumber && (
                      <p className="text-gray-600">
                        AIMS: {userToExport.aimsNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Main content - user details */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <h3 className="text-lg font-semibold text-black mb-3 border-b pb-2">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      {Object.entries(userToExport)
                        .filter(
                          ([key]) =>
                            !EXCLUDED_COLUMNS.has(key) &&
                            !["tanzeemStatus", "name", "aimsNumber"].includes(
                              key
                            )
                        )
                        .map(([key, value]) => (
                          <div key={key} className="mb-2">
                            <p className="font-semibold text-sm text-gray-700">
                              {formatLabel(key)}
                            </p>
                            <p className="text-gray-900">
                              {Array.isArray(value)
                                ? value.join(", ")
                                : value || (
                                    <span className="text-gray-400">N/A</span>
                                  )}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className=" text-center text-xs text-gray-500">
                  <p>Khuddam Tajneed G.V Klang</p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={() => setIsPdfModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="primary" onPress={generatePdf}>
              Download PDF
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onOpenChange={onDeleteModalClose}
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm Delete
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete {userToDelete?.name}? This
                  action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={executeDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
