import React from "react";
import {
  Card,
  CardBody,
  Avatar,
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  Divider,
  Skeleton,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Briefcase,
  Calendar,
  Book,
  User,
  FileText,
  Languages,
  Droplet,
  Award,
} from "lucide-react";

interface UserType {
  id: string;
  name?: string;
  fatherName?: string;
  aimsNumber?: string;
  tanzeemStatus?: string;
  occupation?: string;
  address?: string;
  unhcrId?: string;
  dateOfBirth?: string;
  education?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  [key: string]: any; // Allow dynamic properties to match existing interface
  profilePicture?: string;
}

interface CardLayoutProps {
  users: UserType[];
  openProfileModal: (user: UserType) => void;
  handleDelete: (user: UserType) => void;
  handleExportToPdf: (user: UserType) => void;
  isLoading?: boolean;
}

const getAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const CardLayout: React.FC<CardLayoutProps> = ({
  users,
  openProfileModal,
  handleDelete,
  handleExportToPdf,
  isLoading = false, // Default to false
}) => {
  const router = useRouter();

  const getStatusColor = (status?: string) => {
    if (!status) return "default";
    switch (status.toLowerCase()) {
      case "khuddam":
        return "primary";
      case "atfal":
        return "warning";
      default:
        return "default";
    }
  };

  // Skeleton loading for cards
  const renderSkeletonCards = () => {
    return Array(6)
      .fill(null)
      .map((_, index) => (
        <Card
          key={index}
          className="hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
        >
          <CardBody className="p-0">
            <div className="relative">
              <div className="h-8 rounded-t-xl"></div>
              <div className="absolute -bottom-12 left-6">
                <Skeleton className="rounded-full w-16 h-16" />
              </div>
              <div className="absolute top-4 right-4">
                <Skeleton className="rounded-full w-8 h-8" />
              </div>
            </div>

            {/* Card Content */}
            <div className="pt-14 px-6 pb-4">
              <div className="mb-2">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg mt-2" />
              </div>

              {/* Status & AIMS Tags */}
              <div className="flex flex-wrap gap-2 my-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              <Divider className="my-3" />

              {/* Personal Information */}
              <div className="space-y-2 text-sm">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
              </div>
            </div>
          </CardBody>
        </Card>
      ));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      {isLoading
        ? renderSkeletonCards() // Show skeleton loading if isLoading is true
        : users.map((user) => (
            <Card
              key={user.id}
              className="hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              isPressable
              onPress={() => openProfileModal(user)}
            >
              <CardBody className="p-0">
                <div className="relative">
                  <div className="h-8 rounded-t-xl"></div>
                  <div className="absolute -bottom-12 left-6">
                    <Avatar
                      src={user.profilePicture}
                      className="ring-4 ring-white dark:ring-emerald-500 w-16 h-16"
                      fallback={<User size={36} />}
                    />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="flat">
                          <MoreVertical size={18} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="User actions">
                        <DropdownItem onPress={() => openProfileModal(user)}>
                          <div className="flex items-center gap-2">
                            <Eye size={16} />
                            View
                          </div>
                        </DropdownItem>
                        <DropdownItem
                          onPress={() => router.push(`/edit/${user.id}`)}
                        >
                          <div className="flex items-center gap-2">
                            <Edit2 size={16} />
                            Edit
                          </div>
                        </DropdownItem>
                        <DropdownItem onPress={() => handleExportToPdf(user)}>
                          <div className="flex items-center gap-2">
                            <FileText size={16} />
                            Export to PDF
                          </div>
                        </DropdownItem>
                        <DropdownItem
                          onPress={() => handleDelete(user)}
                          className="text-danger"
                        >
                          <div className="flex items-center gap-2">
                            <Trash2 size={16} />
                            Delete
                          </div>
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-14 px-6 pb-4">
                  <div className="mb-2">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <User size={14} />
                      <span>s/o {user.fatherName}</span>
                    </p>
                  </div>

                  {/* Status & AIMS Tags */}
                  <div className="flex flex-wrap gap-2 my-3">
                    {user.tanzeemStatus && (
                      <Chip
                        color={getStatusColor(user.tanzeemStatus)}
                        variant="flat"
                        size="sm"
                        startContent={<Award size={14} />}
                      >
                        {user.tanzeemStatus}
                      </Chip>
                    )}

                    <Tooltip content="AIMS Number">
                      <Chip
                        color="default"
                        variant="flat"
                        size="sm"
                        startContent={<FileText size={14} />}
                      >
                        {user.aimsNumber}
                      </Chip>
                    </Tooltip>

                    <Tooltip content="Blood Group">
                      <Chip
                        color="danger"
                        variant="flat"
                        size="sm"
                        startContent={<Droplet size={14} />}
                      >
                        {user.bloodGroup}
                      </Chip>
                    </Tooltip>
                  </div>

                  <Divider className="my-3" />

                  {/* Personal Information */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {user.dateOfBirth
                          ? `${getAge(user.dateOfBirth)} years (${new Date(
                              user.dateOfBirth
                            ).toLocaleDateString()})`
                          : "N/A"}
                      </span>
                    </div>

                    {user.occupation && (
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {user.occupation}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Book size={16} className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {user.education}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-500 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {user.address}
                      </span>
                    </div>

                    {user.unhcrId && (
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          UNHCR ID: {user.unhcrId}
                        </span>
                      </div>
                    )}

                    {user.languages && user.languages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Languages size={16} className="text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {Array.isArray(user.languages)
                            ? user.languages.join(", ")
                            : "N/A"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
    </div>
  );
};

export default CardLayout;
