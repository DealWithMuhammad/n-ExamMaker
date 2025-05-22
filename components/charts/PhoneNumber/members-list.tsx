"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Chip,
  Button,
  Input,
  User,
  Pagination,
} from "@nextui-org/react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { RiEditFill } from "react-icons/ri";
import { IoLogoWhatsapp } from "react-icons/io";
import {
  type Member,
  type MembersListState,
  getStatusColor,
  getStatusName,
  isValidPhoneNumber,
} from "./types";

interface MembersListProps {
  loading: boolean;
  membersList: MembersListState;
  phoneData: { hasPhone: number; noPhone: number };
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  handleEditMember: (member: Member) => void;
  handleViewProfilePicture: (imageUrl: string) => void;
}

export const MembersList = ({
  loading,
  membersList,
  phoneData,
  selectedTab,
  setSelectedTab,
  handleEditMember,
  handleViewProfilePicture,
}: MembersListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  // Filter members based on search query
  const filteredMembers = membersList[
    selectedTab as keyof MembersListState
  ].filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.aimsNumber &&
        member.aimsNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.phoneNumber &&
        member.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate pagination
  const pages = Math.ceil(filteredMembers.length / rowsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Function to render the appropriate table based on the selected tab
  const renderMembersTable = () => {
    if (paginatedMembers.length === 0) {
      return (
        <TableRow key="no-members">
          <TableCell colSpan={5} className="text-center py-8">
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-default-500">
                No members found in this category
              </p>
              {searchQuery && (
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      );
    }

    // For desktop view
    return paginatedMembers.map((member) => (
      <TableRow
        key={member.id}
        className="hover:bg-default-100 transition-colors md:table-row hidden"
      >
        <TableCell>
          <User
            name={member.name}
            description={member.aimsNumber || "No AIMS Number"}
            avatarProps={{
              src: member.profilePicture || "",
              size: "md",
              radius: "full",
              showFallback: true,
              className: "cursor-pointer transition-transform hover:scale-105",
              onClick: () =>
                member.profilePicture &&
                handleViewProfilePicture(member.profilePicture),
            }}
          />
        </TableCell>
        <TableCell>
          <span className={member.phoneNumber ? "" : "text-default-400 italic"}>
            {member.phoneNumber || "Not provided"}
          </span>
        </TableCell>
        <TableCell>{member.address || "Not provided"}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              size="lg"
              color={selectedTab === "hasPhone" ? "default" : "danger"}
              variant="light"
              isIconOnly
              onPress={() => handleEditMember(member)}
            >
              <RiEditFill className="text-xl" />
            </Button>
            {member.phoneNumber && isValidPhoneNumber(member.phoneNumber) && (
              <Button
                size="lg"
                color="success"
                variant="light"
                as="a"
                isIconOnly
                href={`https://wa.me/${member.phoneNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IoLogoWhatsapp className="text-xl" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  // Function to render mobile card view
  const renderMobileCards = () => {
    if (paginatedMembers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-8 md:hidden">
          <p className="text-default-500">No members found in this category</p>
          {searchQuery && (
            <Button
              size="sm"
              variant="flat"
              color="default"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {paginatedMembers.map((member) => (
          <Card key={member.id} className="w-full">
            <CardBody className="gap-3">
              <div className="flex justify-between items-start">
                <User
                  name={member.name}
                  description={member.aimsNumber || "No AIMS Number"}
                  avatarProps={{
                    src: member.profilePicture || "",
                    size: "md",
                    radius: "full",
                    showFallback: true,
                    className: "cursor-pointer",
                    onClick: () =>
                      member.profilePicture &&
                      handleViewProfilePicture(member.profilePicture),
                  }}
                />
                <Chip
                  color={member.phoneNumber ? "success" : "danger"}
                  size="sm"
                >
                  {member.phoneNumber ? "Has Phone" : "No Phone"}
                </Chip>
              </div>

              <div className="border-t pt-3 mt-1">
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                  <span className="text-default-500 text-sm">Phone:</span>
                  <span
                    className={
                      member.phoneNumber
                        ? "font-medium"
                        : "text-default-400 italic"
                    }
                  >
                    {member.phoneNumber || "Not provided"}
                  </span>

                  <span className="text-default-500 text-sm">Address:</span>
                  <span
                    className={
                      member.address ? "font-medium" : "text-default-400 italic"
                    }
                  >
                    {member.address || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-2 justify-end">
                <Button
                  size="sm"
                  color={selectedTab === "hasPhone" ? "primary" : "success"}
                  variant="flat"
                  onPress={() => handleEditMember(member)}
                >
                  {selectedTab === "hasPhone" ? "Edit" : "Add Phone"}
                </Button>
                {member.phoneNumber &&
                  isValidPhoneNumber(member.phoneNumber) && (
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      as="a"
                      href={`https://wa.me/${member.phoneNumber.replace(
                        /\D/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </Button>
                  )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
        <h4 className="font-bold text-xl">Phone Number Status Details</h4>
        <p className="text-default-500">
          Detailed information about members' phone number status
        </p>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner color="primary" size="lg" />
          </div>
        ) : (
          <div>
            <Tabs
              aria-label="Phone Number Status"
              color={getStatusColor(selectedTab) as any}
              variant="underlined"
              classNames={{
                tab: "h-10",
                tabList: "gap-2 w-full relative",
                cursor: "w-full",
                panel: "p-0 mt-4",
              }}
              selectedKey={selectedTab}
              onSelectionChange={(key) => {
                setSelectedTab(key as string);
                setPage(1);
                setSearchQuery("");
              }}
            >
              <Tab
                key="hasPhone"
                title={
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-success"></span>
                    <span>Has Phone Number ({phoneData.hasPhone})</span>
                  </div>
                }
              />
              <Tab
                key="noPhone"
                title={
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-danger"></span>
                    <span>Missing Phone Number ({phoneData.noPhone})</span>
                  </div>
                }
              />
            </Tabs>

            <div className="mt-4">
              <Card>
                <CardHeader className="pb-0 pt-4 px-6 flex items-center justify-between flex-col sm:flex-row gap-4">
                  <div>
                    <h4 className="font-bold text-lg">
                      {getStatusName(selectedTab)}
                    </h4>
                    <p className="text-default-500">
                      {
                        membersList[selectedTab as keyof MembersListState]
                          .length
                      }{" "}
                      members
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Input
                      placeholder="Search by name or AIMS..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      startContent={<FaSearch className="text-default-400" />}
                      endContent={
                        searchQuery ? (
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onClick={() => setSearchQuery("")}
                          >
                            <FaTimes className="text-default-400" />
                          </Button>
                        ) : null
                      }
                      className="w-full"
                      size="sm"
                      variant="bordered"
                      radius="full"
                      classNames={{
                        innerWrapper: "bg-transparent",
                      }}
                    />
                  </div>
                </CardHeader>
                <CardBody>
                  <>
                    <Table
                      aria-label={`Tajneed with ${getStatusName(selectedTab)}`}
                      color={getStatusColor(selectedTab) as any}
                      selectionMode="none"
                      shadow="none"
                      className="overflow-hidden hidden md:block" // Hide on mobile, show on md and up
                    >
                      <TableHeader className="hidden md:table-header-group">
                        <TableColumn>MEMBER</TableColumn>
                        <TableColumn>PHONE NUMBER</TableColumn>
                        <TableColumn>ADDRESS</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                      </TableHeader>
                      <TableBody
                        emptyContent="No members found. Try a different search."
                        loadingContent={<Spinner color="primary" />}
                      >
                        {renderMembersTable()}
                      </TableBody>
                    </Table>
                  </>

                  {/* Mobile Card View - Moved outside of the table as requested */}
                  {renderMobileCards()}

                  {/* Pagination */}
                  {filteredMembers.length > 0 && (
                    <div className="flex justify-center mt-4">
                      <Pagination
                        total={pages}
                        page={page}
                        onChange={setPage}
                        color={getStatusColor(selectedTab) as any}
                        showControls
                        variant="light"
                        classNames={{
                          cursor: "bg-gradient-to-br shadow-md",
                        }}
                      />
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
