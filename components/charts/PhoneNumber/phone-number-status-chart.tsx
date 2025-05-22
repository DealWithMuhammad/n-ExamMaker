"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Avatar,
  Input,
} from "@nextui-org/react";
import { db } from "@/app/api/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { ChartSection } from "./chart-section";
import { MembersList } from "./members-list";
import {
  type Member,
  type MembersListState,
  type PhoneDataState,
  getStatusColor,
  isValidPhoneNumber,
} from "./types";

export const PhoneNumberStatusChart = () => {
  const [phoneData, setPhoneData] = useState<PhoneDataState>({
    hasPhone: 0,
    noPhone: 0,
  });

  const [membersList, setMembersList] = useState<MembersListState>({
    hasPhone: [],
    noPhone: [],
  });

  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("hasPhone");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [phoneNumberInput, setPhoneNumberInput] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchPhoneData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "formSubmissions"));

        const results: PhoneDataState = {
          hasPhone: 0,
          noPhone: 0,
        };

        const members: MembersListState = {
          hasPhone: [],
          noPhone: [],
        };

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const phoneNumber = String(data.phoneNumber || "").trim();
          const memberName = data.name || "Unknown";
          const aimsNumber = data.aimsNumber || "";
          const address = data.address || "";
          const profilePicture =
            data.profilePictureUrl || data.profilePicture || "";

          // Check if phone number is valid
          const hasValidPhone = isValidPhoneNumber(phoneNumber);

          // Determine category based on phone number validity
          const category = hasValidPhone ? "hasPhone" : "noPhone";

          // Increment the counter for the category
          results[category as keyof PhoneDataState] += 1;

          // Add to the category members list
          members[category as keyof MembersListState].push({
            name: memberName,
            phoneNumber: phoneNumber,
            id: doc.id,
            address: address,
            aimsNumber: aimsNumber,
            profilePicture: profilePicture,
          });
        });

        setPhoneData(results);
        setMembersList(members);
      } catch (error) {
        console.error("Error fetching phone data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneData();
  }, []);

  // Function to handle editing a member's phone number
  const handleEditMember = (member: Member) => {
    setCurrentMember(member);
    setPhoneNumberInput(member.phoneNumber || "");
    setIsEditMode(true);
    onOpen();
  };

  // Function to view profile picture
  const handleViewProfilePicture = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  // Function to save phone number updates
  const savePhoneNumber = async () => {
    if (!currentMember) return;

    setUpdateLoading(true);
    try {
      const memberRef = doc(db, "formSubmissions", currentMember.id);
      await updateDoc(memberRef, {
        phoneNumber: phoneNumberInput,
      });

      // Update local state
      const hasValidPhone = isValidPhoneNumber(phoneNumberInput);
      const newCategory = hasValidPhone ? "hasPhone" : "noPhone";
      const oldCategory = isValidPhoneNumber(currentMember.phoneNumber)
        ? "hasPhone"
        : "noPhone";

      // Only update if category changed
      if (newCategory !== oldCategory) {
        // Remove from old category
        const updatedOldList = membersList[
          oldCategory as keyof MembersListState
        ].filter((m) => m.id !== currentMember.id);

        // Add to new category with updated phone
        const updatedMember = {
          ...currentMember,
          phoneNumber: phoneNumberInput,
        };

        const updatedNewList = [
          ...membersList[newCategory as keyof MembersListState],
          updatedMember,
        ];

        // Update counts
        const newPhoneData = {
          ...phoneData,
          [oldCategory]: phoneData[oldCategory as keyof PhoneDataState] - 1,
          [newCategory]: phoneData[newCategory as keyof PhoneDataState] + 1,
        };

        setPhoneData(newPhoneData);
        setMembersList({
          ...membersList,
          [oldCategory]: updatedOldList,
          [newCategory]: updatedNewList,
        });

        // Switch to the tab where the member now is
        setSelectedTab(newCategory);
      } else {
        // Just update the phone number without changing categories
        const updatedList = membersList[
          oldCategory as keyof MembersListState
        ].map((m) =>
          m.id === currentMember.id
            ? { ...m, phoneNumber: phoneNumberInput }
            : m
        );

        setMembersList({
          ...membersList,
          [oldCategory]: updatedList,
        });
      }

      onClose();
      setIsEditMode(false);
      setCurrentMember(null);
    } catch (error) {
      console.error("Error updating phone number:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Total counts for summary
  const totalMembers = phoneData.hasPhone + phoneData.noPhone;

  return (
    <div className="flex flex-col gap-6">
      {/* Charts and Summary Cards Section */}
      <ChartSection
        phoneData={phoneData}
        loading={loading}
        totalMembers={totalMembers}
      />

      {/* Members List Section */}
      <MembersList
        loading={loading}
        membersList={membersList}
        phoneData={phoneData}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        handleEditMember={handleEditMember}
        handleViewProfilePicture={handleViewProfilePicture}
      />

      {/* Profile Picture Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        size="3xl"
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Member Profile Picture
              </ModalHeader>
              <ModalBody className="p-0">
                <div className="flex justify-center items-center p-4">
                  {selectedImage && (
                    <img
                      src={selectedImage || "/placeholder.svg"}
                      alt="Profile"
                      className="max-h-96 max-w-full object-contain rounded-lg shadow-lg"
                    />
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  onPress={() => setIsImageModalOpen(false)}
                  color="primary"
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Phone Number Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        backdrop="blur"
        size="lg"
        placement="center"
        classNames={{
          body: "p-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-1 items-center">
                <div
                  className={`h-3 w-3 rounded-full bg-${getStatusColor(
                    selectedTab
                  )}`}
                ></div>
                {isEditMode && selectedTab === "hasPhone"
                  ? "Edit Phone Number"
                  : "Add Phone Number"}
              </ModalHeader>
              <ModalBody>
                {currentMember && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                      <Avatar
                        src={currentMember.profilePicture || ""}
                        className="w-20 h-20 text-large"
                        showFallback
                      />
                      <div className="space-y-2 text-center sm:text-left">
                        <h3 className="text-xl font-bold">
                          {currentMember.name}
                        </h3>
                        <p className="text-default-500">
                          AIMS: {currentMember.aimsNumber || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-default-50 p-4 rounded-xl">
                      <div className="flex flex-col gap-2 mb-4">
                        <p className="text-sm text-default-600">
                          Current Address
                        </p>
                        <p className="font-medium">
                          {currentMember.address || "Not provided"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-default-600">
                          Current Phone Number
                        </p>
                        <p className="font-medium">
                          {currentMember.phoneNumber ? (
                            <span className="text-success">
                              {currentMember.phoneNumber}
                            </span>
                          ) : (
                            <span className="text-danger italic">
                              Not provided
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <Input
                      label="Phone Number"
                      value={phoneNumberInput}
                      onChange={(e) => setPhoneNumberInput(e.target.value)}
                      variant="bordered"
                      color={selectedTab === "hasPhone" ? "primary" : "success"}
                      placeholder="Enter phone number"
                      size="lg"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">+</span>
                        </div>
                      }
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color={selectedTab === "hasPhone" ? "primary" : "success"}
                  onPress={savePhoneNumber}
                  isLoading={updateLoading}
                >
                  {updateLoading
                    ? "Saving..."
                    : isEditMode && selectedTab === "hasPhone"
                    ? "Update"
                    : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PhoneNumberStatusChart;
