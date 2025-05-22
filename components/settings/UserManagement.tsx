"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  Chip,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Tooltip,
  Listbox,
  ListboxItem,
  ScrollShadow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import {
  Mail,
  Lock,
  UserPlus,
  Search,
  ShieldCheck,
  User,
  Phone,
  Briefcase,
  RefreshCw,
  Eye,
  Edit,
  Shield,
  X,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/api/firebaseConfig";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

interface UserFormData {
  aimsNumber: string;
  name: string;
  phoneNumber: string;
  jamatKhidmat?: string;
  email: string;
  password: string;
  role: string;
}

interface Member {
  aimsNumber: string;
  name: string;
  phoneNumber: string;
  jamatKhidmat?: string;
}

type FormErrors = {
  [K in keyof UserFormData]?: string;
};

export default function UserManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<UserFormData>({
    aimsNumber: "",
    name: "",
    phoneNumber: "",
    jamatKhidmat: "",
    email: "",
    password: "",
    role: "viewer",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("admin"); // Replace with actual auth logic
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Handle clicks outside the search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch members and users on component mount
  useEffect(() => {
    fetchMembers();
    fetchUsers();
  }, []);

  // Fetch all members from formSubmissions collection
  const fetchMembers = async () => {
    setIsRefreshing(true);
    try {
      const querySnapshot = await getDocs(collection(db, "formSubmissions"));
      const membersList: Member[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        membersList.push({
          aimsNumber: data.aimsNumber,
          name: data.name,
          phoneNumber: data.phoneNumber || "",
          jamatKhidmat: data.jamatKhidmat || "",
        });
      });

      setMembers(membersList);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch existing users
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList: any[] = [];

      querySnapshot.forEach((doc) => {
        usersList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users data");
    }
  };

  // Handle form input changes
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setFormData((prev) => ({
      ...prev,
      aimsNumber: value,
    }));
    setShowDropdown(true);

    // Clear the error if any
    if (errors.aimsNumber) {
      setErrors((prev) => ({
        ...prev,
        aimsNumber: undefined,
      }));
    }
  };

  // Handle member selection from dropdown
  const handleSelectMember = (member: Member) => {
    setFormData((prev) => ({
      ...prev,
      aimsNumber: member.aimsNumber,
      name: member.name,
      phoneNumber: member.phoneNumber || "",
      jamatKhidmat: member.jamatKhidmat || "",
    }));
    setSearchQuery(member.aimsNumber);
    setShowDropdown(false);
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.aimsNumber) {
      newErrors.aimsNumber = "AIMS Number is required";
      isValid = false;
    }

    if (!formData.name) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const auth = getAuth();

      // Check if user with email already exists
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", formData.email)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        setErrors({ email: "User with this email already exists" });
        setIsLoading(false);
        return;
      }

      // Create authentication user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const uid = userCredential.user.uid;

      // Store user data in Firestore
      await setDoc(doc(db, "users", uid), {
        uid,
        email: formData.email,
        aimsNumber: formData.aimsNumber,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        jamatKhidmat: formData.jamatKhidmat,
        role: formData.role,
        createdAt: new Date().toISOString(),
      });

      toast.success("User created successfully!");

      // Reset form
      setFormData({
        aimsNumber: "",
        name: "",
        phoneNumber: "",
        jamatKhidmat: "",
        email: "",
        password: "",
        role: "viewer",
      });
      setSearchQuery("");

      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);

      if (error.code === "auth/email-already-in-use") {
        setErrors({ email: "Email already in use" });
      } else {
        toast.error("Failed to create user: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter members based on search input
  const filteredMembers = searchQuery
    ? members.filter(
        (member) =>
          member.aimsNumber.includes(searchQuery) ||
          member.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteDoc(doc(db, "users", selectedUser.id));
      toast.success("User deleted successfully!");
      fetchUsers(); // Refresh the users list
      onClose(); // Close the modal
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user: " + error.message);
    }
  };

  // Handle role update
  const handleUpdateRole = async (userId: string, newRole: string) => {
    setIsUpdatingRole(true);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: newRole,
      });
      toast.success("User role updated successfully!");
      fetchUsers(); // Refresh the users list
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role: " + error.message);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8 shadow-md">
        <CardHeader className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/20">
          <div className="flex items-center gap-2">
            <UserPlus className="text-primary" size={24} />
            <h2 className="text-xl font-bold">User Management</h2>
          </div>
          <Tooltip content="Refresh member data">
            <Button
              isIconOnly
              variant="light"
              onPress={fetchMembers}
              isLoading={isRefreshing}
            >
              <RefreshCw size={18} />
            </Button>
          </Tooltip>
        </CardHeader>
        <Divider />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative" ref={searchRef}>
                <Input
                  label="AIMS Number"
                  placeholder="Search by AIMS Number or Name"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  startContent={
                    <Search className="text-default-400" size={16} />
                  }
                  endContent={
                    searchQuery && (
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => {
                          setSearchQuery("");
                          setFormData((prev) => ({
                            ...prev,
                            aimsNumber: "",
                          }));
                        }}
                      >
                        <X size={14} />
                      </Button>
                    )
                  }
                  onFocus={() => setShowDropdown(true)}
                  isInvalid={!!errors.aimsNumber}
                  errorMessage={errors.aimsNumber}
                  autoComplete="off"
                />

                {showDropdown && filteredMembers.length > 0 && (
                  <Card className="absolute z-[10000] w-full mt-1 shadow-lg">
                    <ScrollShadow className="max-h-64">
                      <Listbox
                        aria-label="Member search results"
                        items={filteredMembers}
                        onAction={(key) => {
                          const member = filteredMembers.find(
                            (m) => m.aimsNumber === key
                          );
                          if (member) {
                            handleSelectMember(member);
                          }
                        }}
                      >
                        {(member) => (
                          <ListboxItem
                            key={member.aimsNumber}
                            textValue={member.aimsNumber}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {member.aimsNumber}
                              </span>
                              <span className="text-xs text-default-500">
                                {member.name}
                              </span>
                            </div>
                          </ListboxItem>
                        )}
                      </Listbox>
                    </ScrollShadow>
                  </Card>
                )}
              </div>

              <Input
                label="Name"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                startContent={<User className="text-default-400" size={16} />}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                startContent={<Phone className="text-default-400" size={16} />}
              />

              <Input
                label="Jamati Khidmat"
                placeholder="Jamati Khidmat"
                value={formData.jamatKhidmat || ""}
                onChange={(e) => handleChange("jamatKhidmat", e.target.value)}
                startContent={
                  <Briefcase className="text-default-400" size={16} />
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Email"
                placeholder="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                startContent={<Mail className="text-default-400" size={16} />}
              />

              <Input
                label="Password"
                placeholder="Password (min. 6 characters)"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                isInvalid={!!errors.password}
                errorMessage={errors.password}
                startContent={<Lock className="text-default-400" size={16} />}
              />
            </div>

            <div>
              <Select
                label="User Role"
                placeholder="Select role"
                selectedKeys={[formData.role]}
                onChange={(e) => handleChange("role", e.target.value)}
                isInvalid={!!errors.role}
                errorMessage={errors.role}
                startContent={
                  <ShieldCheck className="text-default-400" size={16} />
                }
              >
                <SelectItem
                  key="admin"
                  value="admin"
                  startContent={<Shield className="text-danger" size={16} />}
                >
                  Admin
                </SelectItem>
                <SelectItem
                  key="editor"
                  value="editor"
                  startContent={<Edit className="text-warning" size={16} />}
                >
                  Editor
                </SelectItem>
                <SelectItem
                  key="viewer"
                  value="viewer"
                  startContent={<Eye className="text-success" size={16} />}
                >
                  Viewer
                </SelectItem>
              </Select>
            </div>

            <Button
              type="submit"
              color="primary"
              startContent={<UserPlus size={18} />}
              isLoading={isLoading}
              className="w-full md:w-auto"
              size="lg"
            >
              Add User
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="bg-primary-50 dark:bg-primary-900/20">
          <div className="flex items-center gap-2">
            <User className="text-primary" size={24} />
            <h2 className="text-xl font-bold">Existing Users</h2>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner color="primary" size="lg" className="mb-4" />
              <p className="text-default-500">Loading users...</p>
            </div>
          ) : (
            <Table aria-label="Users table" className="mt-2">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>AIMS NUMBER</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>JAMATI KHIDMAT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No users found">
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-default-400" />
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.aimsNumber}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        color={
                          user.role === "admin"
                            ? "danger"
                            : user.role === "editor"
                            ? "warning"
                            : "success"
                        }
                        variant="flat"
                        size="sm"
                        startContent={
                          user.role === "admin" ? (
                            <Shield size={12} />
                          ) : user.role === "editor" ? (
                            <Edit size={12} />
                          ) : (
                            <Eye size={12} />
                          )
                        }
                      >
                        {user.role}
                      </Chip>
                    </TableCell>
                    <TableCell>{user.jamatKhidmat || "-"}</TableCell>
                    <TableCell>
                      {currentUserRole === "admin" ? (
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly variant="light" size="sm">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="User Actions">
                            <DropdownItem
                              key="change-role"
                              textValue="Change Role"
                              className="text-primary"
                              startContent={<Edit size={16} />}
                            >
                              <div className="font-medium">Change Role</div>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant={
                                    user.role === "admin" ? "solid" : "flat"
                                  }
                                  onPress={() =>
                                    handleUpdateRole(user.id, "admin")
                                  }
                                  isLoading={
                                    isUpdatingRole &&
                                    selectedUser?.id === user.id
                                  }
                                  isDisabled={user.role === "admin"}
                                >
                                  Admin
                                </Button>
                                <Button
                                  size="sm"
                                  color="warning"
                                  variant={
                                    user.role === "editor" ? "solid" : "flat"
                                  }
                                  onPress={() =>
                                    handleUpdateRole(user.id, "editor")
                                  }
                                  isLoading={
                                    isUpdatingRole &&
                                    selectedUser?.id === user.id
                                  }
                                  isDisabled={user.role === "editor"}
                                >
                                  Editor
                                </Button>
                                <Button
                                  size="sm"
                                  color="success"
                                  variant={
                                    user.role === "viewer" ? "solid" : "flat"
                                  }
                                  onPress={() =>
                                    handleUpdateRole(user.id, "viewer")
                                  }
                                  isLoading={
                                    isUpdatingRole &&
                                    selectedUser?.id === user.id
                                  }
                                  isDisabled={user.role === "viewer"}
                                >
                                  Viewer
                                </Button>
                              </div>
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<Trash2 size={16} />}
                              onPress={() => {
                                setSelectedUser(user);
                                onOpen();
                              }}
                            >
                              Delete User
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirm Deletion
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete user{" "}
              <strong>{selectedUser?.name}</strong>?
            </p>
            <p className="text-danger">This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDeleteUser}>
              Delete User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
