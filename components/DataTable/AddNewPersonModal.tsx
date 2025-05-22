import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { User, statusOptions } from "./data";
import {
  FaUser,
  FaAddressCard,
  FaIdCard,
  FaCalendarAlt,
  FaImage,
  FaChevronDown,
} from "react-icons/fa";

interface AddNewPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPerson: (newPerson: Omit<User, "id">) => void;
}

export default function AddNewPersonModal({
  isOpen,
  onClose,
  onAddPerson,
}: AddNewPersonModalProps) {
  const [newPerson, setNewPerson] = useState<Omit<User, "id">>({
    name: "",
    fatherName: "",
    aimsNumber: "",
    address: "",
    unhcrId: "",
    dateOfBirth: "",
    profilePicture: "",
    status: "active",
  });

  const handleInputChange = (key: keyof Omit<User, "id">, value: string) => {
    setNewPerson((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onAddPerson(newPerson);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Add New Person</ModalHeader>
        <ModalBody>
          <Input
            label="Name"
            placeholder="Enter name"
            value={newPerson.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            startContent={<FaUser />}
          />
          <Input
            label="Father's Name"
            placeholder="Enter father's name"
            value={newPerson.fatherName}
            onChange={(e) => handleInputChange("fatherName", e.target.value)}
            startContent={<FaUser />}
          />
          <Input
            label="AIMS Number"
            placeholder="Enter AIMS number"
            value={newPerson.aimsNumber}
            onChange={(e) => handleInputChange("aimsNumber", e.target.value)}
            startContent={<FaIdCard />}
          />
          <Input
            label="Address"
            placeholder="Enter address"
            value={newPerson.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            startContent={<FaAddressCard />}
          />
          <Input
            label="UNHCR ID"
            placeholder="Enter UNHCR ID"
            value={newPerson.unhcrId}
            onChange={(e) => handleInputChange("unhcrId", e.target.value)}
            startContent={<FaIdCard />}
          />
          <Input
            label="Date of Birth"
            placeholder="Enter date of birth"
            value={newPerson.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            startContent={<FaCalendarAlt />}
          />
          <Input
            label="Profile Picture URL"
            placeholder="Enter profile picture URL"
            value={newPerson.profilePicture}
            onChange={(e) =>
              handleInputChange("profilePicture", e.target.value)
            }
            startContent={<FaImage />}
          />
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                endContent={<FaChevronDown className="text-small" />}
              >
                {newPerson.status === "active" ? "Active" : "Inactive"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Status selection"
              onAction={(key) => handleInputChange("status", key as string)}
            >
              {statusOptions.map((status) => (
                <DropdownItem key={status.uid}>{status.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            Add Person
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
