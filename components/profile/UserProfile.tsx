"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Avatar,
  Card,
  CardBody,
  Divider,
  Chip,
  Spinner,
  ScrollShadow,
} from "@nextui-org/react";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/app/api/firebaseConfig";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  BookOpen,
  Map,
  Award,
  Activity,
  UserCheck,
  Target,
} from "lucide-react";

interface UserData {
  uid: string;
  email: string;
  name: string;
  aimsNumber: string;
  phoneNumber: string;
  jamatKhidmat?: string;
  role: string;
}

interface FormSubmissionData {
  name: string;
  fatherName: string;
  aimsNumber: string;
  phoneNumber: string;
  tanzeemStatus?: string;
  waqfeNauNumber?: string;
  languages: string[];
  occupation?: string;
  occupationMalaysia?: string;
  jobStatus?: string;
  dailyEarnings?: string;
  address: string;
  unhcrId?: string;
  unhcrStatus?: string;
  dateOfBirth: string;
  dateOfBait?: string;
  education: string;
  quranStudy?: string;
  wasiatNumber?: string;
  canRideBicycle: string;
  jamatKhidmat?: string;
  bloodGroup: string;
  maritalStatus: string;
  personalRide?: string;
  profilePicture?: string;
}

// Combined user profile data type
interface UserProfileData
  extends Partial<FormSubmissionData>,
    Partial<UserData> {}

export default function UserProfile({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          throw new Error("No user is currently logged in");
        }

        // First get basic user data from users collection
        const userRef = doc(db, "users", currentUser.uid);
        const userDocSnapshot = await getDoc(userRef);

        if (!userDocSnapshot.exists()) {
          throw new Error("User data not found");
        }

        const basicUserData = userDocSnapshot.data() as UserData;

        // Try to find detailed form submission data using AIMS number
        let detailedData: FormSubmissionData | null = null;

        if (basicUserData.aimsNumber) {
          const formSubmissionsQuery = query(
            collection(db, "formSubmissions"),
            where("aimsNumber", "==", basicUserData.aimsNumber)
          );

          const querySnapshot = await getDocs(formSubmissionsQuery);

          if (!querySnapshot.empty) {
            detailedData = querySnapshot.docs[0].data() as FormSubmissionData;
          }
        }

        // Merge the data, with form submission data taking precedence for overlapping fields
        const mergedData: UserProfileData = {
          ...basicUserData,
          ...detailedData,
          // Ensure these fields from users collection are preserved
          uid: basicUserData.uid,
          email: basicUserData.email,
          role: basicUserData.role,
        };

        setUserData(mergedData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load user data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isOpen]);

  // Helper function for field display
  const FieldItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string | string[];
  }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    return (
      <div className="flex items-start gap-2 py-2">
        <div className="text-primary mt-0.5">{icon}</div>
        <div>
          <p className="text-xs text-default-500">{label}</p>
          <p className="text-sm font-medium">
            {Array.isArray(value) ? value.join(", ") : value}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex items-center gap-2">
              <User className="text-primary" size={20} />
              <span>My Profile</span>
            </ModalHeader>
            <Divider />
            <ModalBody>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner color="primary" size="lg" className="mb-4" />
                  <p className="text-default-500">Loading profile...</p>
                </div>
              ) : error ? (
                <div className="py-8 text-center text-danger">
                  <p>{error}</p>
                </div>
              ) : userData ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <Avatar
                      src={userData.profilePicture || ""}
                      showFallback
                      name={userData.name?.substring(0, 2) || "?"}
                      className="w-20 h-20 text-large"
                    />
                    <div className="text-center md:text-left">
                      <h2 className="text-xl font-bold">{userData.name}</h2>
                      <p className="text-default-500">{userData.aimsNumber}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                        <Chip
                          color={
                            userData.role === "admin"
                              ? "danger"
                              : userData.role === "editor"
                              ? "warning"
                              : "success"
                          }
                          variant="flat"
                          size="sm"
                        >
                          {userData.role || "Member"}
                        </Chip>
                        {userData.jamatKhidmat && (
                          <Chip color="primary" variant="flat" size="sm">
                            {userData.jamatKhidmat}
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* Account Information */}
                  <Card>
                    <CardBody>
                      <h3 className="text-md font-semibold mb-3">
                        Account Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldItem
                          icon={<Mail size={16} />}
                          label="Email"
                          value={userData.email}
                        />
                        <FieldItem
                          icon={<User size={16} />}
                          label="AIMS Number"
                          value={userData.aimsNumber}
                        />
                      </div>
                    </CardBody>
                  </Card>

                  {/* Basic Information - Only show if we have detailed data */}
                  {userData.fatherName && (
                    <Card>
                      <CardBody>
                        <h3 className="text-md font-semibold mb-3">
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FieldItem
                            icon={<User size={16} />}
                            label="Father's Name"
                            value={userData.fatherName}
                          />
                          <FieldItem
                            icon={<Phone size={16} />}
                            label="Phone Number"
                            value={userData.phoneNumber}
                          />
                          <FieldItem
                            icon={<Calendar size={16} />}
                            label="Date of Birth"
                            value={userData.dateOfBirth}
                          />
                          <FieldItem
                            icon={<Map size={16} />}
                            label="Address"
                            value={userData.address}
                          />
                          <FieldItem
                            icon={<Activity size={16} />}
                            label="Blood Group"
                            value={userData.bloodGroup}
                          />
                          <FieldItem
                            icon={<UserCheck size={16} />}
                            label="Marital Status"
                            value={userData.maritalStatus}
                          />
                          <FieldItem
                            icon={<Award size={16} />}
                            label="Education"
                            value={userData.education}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  {/* Jamaat Information - Only show if we have detailed data */}
                  {(userData.dateOfBait ||
                    userData.tanzeemStatus ||
                    userData.jamatKhidmat) && (
                    <Card>
                      <CardBody>
                        <h3 className="text-md font-semibold mb-3">
                          Jamaat Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FieldItem
                            icon={<Calendar size={16} />}
                            label="Date of Bai'at"
                            value={userData.dateOfBait}
                          />
                          <FieldItem
                            icon={<Target size={16} />}
                            label="Tanzeem Status"
                            value={userData.tanzeemStatus}
                          />
                          <FieldItem
                            icon={<Briefcase size={16} />}
                            label="Jamati Khidmat"
                            value={userData.jamatKhidmat}
                          />
                          <FieldItem
                            icon={<BookOpen size={16} />}
                            label="Quran Study"
                            value={userData.quranStudy}
                          />
                          <FieldItem
                            icon={<Award size={16} />}
                            label="Waqf-e-Nau Number"
                            value={userData.waqfeNauNumber}
                          />
                          <FieldItem
                            icon={<Award size={16} />}
                            label="Wasiat Number"
                            value={userData.wasiatNumber}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  {/* Additional Information - Only show if we have any of these fields */}
                  {(userData.occupation ||
                    userData.languages ||
                    userData.unhcrId) && (
                    <Card>
                      <CardBody>
                        <h3 className="text-md font-semibold mb-3">
                          Additional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FieldItem
                            icon={<Briefcase size={16} />}
                            label="Occupation"
                            value={userData.occupation}
                          />
                          <FieldItem
                            icon={<Briefcase size={16} />}
                            label="Occupation in Malaysia"
                            value={userData.occupationMalaysia}
                          />
                          <FieldItem
                            icon={<Award size={16} />}
                            label="Job Status"
                            value={userData.jobStatus}
                          />
                          <FieldItem
                            icon={<Award size={16} />}
                            label="Daily Earnings"
                            value={userData.dailyEarnings}
                          />
                          <FieldItem
                            icon={<Award size={16} />}
                            label="Languages"
                            value={userData.languages}
                          />
                          <FieldItem
                            icon={<Award size={16} />}
                            label="UNHCR ID"
                            value={userData.unhcrId}
                          />
                          <FieldItem
                            icon={<Award size={16} />}
                            label="UNHCR Status"
                            value={userData.unhcrStatus}
                          />
                          <FieldItem
                            icon={<Award size={16} />}
                            label="Can Ride Bicycle"
                            value={userData.canRideBicycle}
                          />
                          <FieldItem
                            icon={<Award size={16} />}
                            label="Personal Ride"
                            value={userData.personalRide}
                          />
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  {/* Show message if no detailed data is available */}
                  {!userData.fatherName && !userData.dateOfBirth && (
                    <Card>
                      <CardBody className="text-center py-8">
                        <p className="text-default-500">
                          Basic profile information is available. Detailed
                          profile data was not found.
                        </p>
                      </CardBody>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-danger">
                  <p>No user data available</p>
                </div>
              )}
            </ModalBody>
            <Divider />
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
