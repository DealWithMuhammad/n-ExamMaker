"use client";
import React, { useState, ChangeEvent } from "react";
import {
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Select,
  SelectItem,
  RadioGroup,
  Radio,
  Checkbox,
  Progress,
} from "@nextui-org/react";
import {
  FaUser,
  FaAddressCard,
  FaIdCard,
  FaCalendarAlt,
  FaImage,
  FaGraduationCap,
  FaBookOpen,
  FaBriefcase,
  FaClipboardList,
  FaBicycle,
  FaShieldAlt,
  FaHandsHelping,
  FaTint,
  FaRing,
  FaCamera,
  FaLanguage,
  FaCar,
  FaMoneyBillWave,
} from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/app/api/firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface FormData {
  name: string;
  fatherName: string;
  aimsNumber: string;
  phoneNumber: string;
  tanzeemStatus?: string;
  waqfeNauNumber?: string; // Added
  languages: string[]; // Changed to array
  occupation?: string;
  occupationMalaysia?: string; // Added
  jobStatus?: string; // Added
  dailyEarnings?: string; // Added
  address: string;
  unhcrId?: string;
  unhcrStatus?: string; // Added
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
  profilePicture: File | null;
}

type FormErrors = {
  [K in keyof FormData]?: string;
};

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const maritalStatuses = ["Unmarried", "Married", "Widowed", "Divorced"];
const yesNoOptions = ["Yes", "No"];
const languagesOptions = ["English", "Malay", "Urdu", "Panjabi", "Other"]; // Added Panjabi
const jobStatusOptions = ["Employed", "Jobless"];
const unhcrStatusOptions = ["Online Registration", "Letter", "Card"];
const tanzeemStatusOptions = ["Khuddam", "Atfal"];

const personalRideOptions = ["Cycle", "Bike", "Car", "None"];

export default function CollectionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    fatherName: "",
    aimsNumber: "",
    waqfeNauNumber: "", // Added
    languages: [], // Initialized as empty array
    occupation: "",
    occupationMalaysia: "", // Added
    jobStatus: "", // Added
    dailyEarnings: "", // Added
    address: "",
    unhcrId: "",
    unhcrStatus: "", // Added
    dateOfBirth: "",
    dateOfBait: "",
    phoneNumber: "",
    education: "",
    quranStudy: "",
    wasiatNumber: "",
    canRideBicycle: "",
    jamatKhidmat: "",
    bloodGroup: "",
    maritalStatus: "",
    personalRide: "", // Added
    profilePicture: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "profilePicture" && files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (language: string) => {
    setFormData((prev) => {
      if (prev.languages.includes(language)) {
        // Remove the language
        return {
          ...prev,
          languages: prev.languages.filter((lang) => lang !== language),
        };
      } else {
        // Add the language
        return {
          ...prev,
          languages: [...prev.languages, language],
        };
      }
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.entries(formData).forEach(([key, value]) => {
      if (
        key !== "profilePicture" &&
        key !== "languages" &&
        (!value || (Array.isArray(value) && value.length === 0))
      ) {
        newErrors[key as keyof FormData] = `${formatLabel(key)} is required`;
        isValid = false;
      }
    });

    // Specific validation for languages
    if (formData.languages.length === 0) {
      newErrors.languages = "At least one language must be selected";
      isValid = false;
    }

    if (!formData.profilePicture) {
      newErrors.profilePicture = "Profile picture is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const formatLabel = (key: string): string => {
    // Convert camelCase to regular labels
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setUploadProgress(0);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 500);

        let profilePictureUrl = null;
        if (formData.profilePicture) {
          const storage = getStorage();
          const storageRef = ref(
            storage,
            `profilePictures/${formData.profilePicture.name}`
          );
          const snapshot = await uploadBytes(
            storageRef,
            formData.profilePicture
          );
          profilePictureUrl = await getDownloadURL(snapshot.ref);
        }

        await addDoc(collection(db, "formSubmissions"), {
          ...formData,
          profilePictureUrl,
          profilePicture: null,
        });

        // Complete the progress bar
        clearInterval(progressInterval);
        setUploadProgress(100);

        toast.success("Form submitted successfully!");

        // Reset form after a brief delay to show complete progress
        setTimeout(() => {
          setFormData({
            name: "",
            fatherName: "",
            aimsNumber: "",
            phoneNumber: "",
            waqfeNauNumber: "",
            languages: [],
            occupation: "",
            occupationMalaysia: "",
            jobStatus: "",
            dailyEarnings: "",
            address: "",
            unhcrId: "",
            unhcrStatus: "",
            tanzeemStatus: "",
            dateOfBirth: "",
            dateOfBait: "",
            education: "",
            quranStudy: "",
            wasiatNumber: "",
            canRideBicycle: "",
            jamatKhidmat: "",
            bloodGroup: "",
            maritalStatus: "",
            personalRide: "",
            profilePicture: null,
          });
          setIsSubmitting(false);
          setUploadProgress(0);
        }, 1000);
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to submit form. Please try again.");
        setIsSubmitting(false);
        setUploadProgress(0);
      }
    }
  };

  const handleImageClick = (sourceType: "camera" | "gallery") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (sourceType === "camera") {
      input.capture = "environment";
    }

    input.onchange = (e: any) => {
      if (e.target.files && e.target.files[0]) {
        setFormData((prev) => ({
          ...prev,
          profilePicture: e.target.files[0],
        }));
      }
    };

    input.click();
  };

  return (
    <>
      <div className="mx-4 my-2">
        <Toaster position="top-right" />
        <Card className="w-full">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Tajneed Collection Form</p>
              <p className="text-small text-default-500">
                Please fill out all fields
              </p>
            </div>
          </CardHeader>
          <Divider />

          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Existing Fields */}
              <Input
                name="name"
                label="Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                startContent={<FaUser className="text-default-400" />}
              />
              <Input
                name="fatherName"
                label="Father's Name"
                placeholder="Enter your father's name"
                value={formData.fatherName}
                onChange={handleChange}
                isInvalid={!!errors.fatherName}
                errorMessage={errors.fatherName}
                startContent={<FaUser className="text-default-400" />}
              />
              <Input
                name="aimsNumber"
                label="AIMS Number"
                placeholder="Enter your AIMS number"
                value={formData.aimsNumber}
                onChange={handleChange}
                isInvalid={!!errors.aimsNumber}
                errorMessage={errors.aimsNumber}
                startContent={<FaIdCard className="text-default-400" />}
              />
              <Input
                name="address"
                label="Address"
                placeholder="Enter your full address"
                value={formData.address}
                onChange={handleChange}
                isInvalid={!!errors.address}
                errorMessage={errors.address}
                startContent={<FaAddressCard className="text-default-400" />}
              />
              <Input
                name="phoneNumber"
                label="Phone Number"
                placeholder="Enter your Phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
                isInvalid={!!errors.phoneNumber}
                errorMessage={errors.phoneNumber}
                startContent={<FaIdCard className="text-default-400" />}
              />
              <Select
                label="Tanzeem"
                placeholder="Select your Tanzeem "
                value={formData.tanzeemStatus}
                onChange={(e: any) =>
                  handleSelectChange("tanzeemStatus", e.target.value)
                }
                startContent={<FaShieldAlt className="text-default-400" />}
              >
                {tanzeemStatusOptions.map((tanzeem) => (
                  <SelectItem key={tanzeem} value={tanzeem}>
                    {tanzeem}
                  </SelectItem>
                ))}
              </Select>
              <Input
                name="unhcrId"
                label="UNHCR ID Number"
                placeholder="Enter your UNHCR ID number"
                value={formData.unhcrId}
                onChange={handleChange}
                isInvalid={!!errors.unhcrId}
                errorMessage={errors.unhcrId}
                startContent={<FaIdCard className="text-default-400" />}
              />

              {/* New Fields */}
              <Input
                name="waqfeNauNumber"
                label="Waqfe Nau Number"
                placeholder="Enter your Waqfe Nau number"
                value={formData.waqfeNauNumber}
                onChange={handleChange}
                isInvalid={!!errors.waqfeNauNumber}
                errorMessage={errors.waqfeNauNumber}
                startContent={<FaIdCard className="text-default-400" />}
              />

              {/* Replaced Select with Checkboxes for Languages */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  Select your languages
                </label>
                <div className="flex flex-col space-y-2">
                  {languagesOptions.map((lang) => (
                    <Checkbox
                      key={lang}
                      value={lang}
                      isSelected={formData.languages.includes(lang)}
                      onChange={() => handleCheckboxChange(lang)}
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Checkbox>
                  ))}
                </div>
                {errors.languages && (
                  <p className="text-sm text-danger">{errors.languages}</p>
                )}
              </div>

              <Input
                name="occupationMalaysia"
                label="Occupation in Malaysia"
                placeholder="Enter your occupation in Malaysia"
                value={formData.occupationMalaysia}
                onChange={handleChange}
                isInvalid={!!errors.occupationMalaysia}
                errorMessage={errors.occupationMalaysia}
                startContent={<FaBriefcase className="text-default-400" />}
              />
              <Select
                label="Job Status"
                placeholder="Select your job status"
                value={formData.jobStatus}
                onChange={(e: any) =>
                  handleSelectChange("jobStatus", e.target.value)
                }
                startContent={<FaBriefcase className="text-default-400" />}
              >
                {jobStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </Select>

              <Input
                name="dailyEarnings"
                label="Daily Earnings"
                placeholder="Enter your daily earnings"
                value={formData.dailyEarnings}
                onChange={handleChange}
                isInvalid={!!errors.dailyEarnings}
                errorMessage={errors.dailyEarnings}
                startContent={<FaMoneyBillWave className="text-default-400" />}
              />
              <Select
                label="UNHCR Status"
                placeholder="Select your UNHCR status"
                value={formData.unhcrStatus}
                onChange={(e: any) =>
                  handleSelectChange("unhcrStatus", e.target.value)
                }
                startContent={<FaShieldAlt className="text-default-400" />}
              >
                {unhcrStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Your Personal Ride"
                placeholder="Select your personal ride"
                value={formData.personalRide}
                onChange={(e: any) =>
                  handleSelectChange("personalRide", e.target.value)
                }
                startContent={<FaCar className="text-default-400" />}
              >
                {personalRideOptions.map((ride) => (
                  <SelectItem key={ride} value={ride}>
                    {ride}
                  </SelectItem>
                ))}
              </Select>

              {/* Existing Fields Continued */}
              <Input
                name="dateOfBait"
                label="Date of Bait"
                value={formData.dateOfBait}
                onChange={handleChange}
                isInvalid={!!errors.dateOfBait}
                errorMessage={errors.dateOfBait}
                startContent={<FaCalendarAlt className="text-default-400" />}
              />
              <Input
                name="education"
                label="Education"
                placeholder="Enter your education details"
                value={formData.education}
                onChange={handleChange}
                isInvalid={!!errors.education}
                errorMessage={errors.education}
                startContent={<FaGraduationCap className="text-default-400" />}
              />
              <Input
                name="quranStudy"
                label="Quran Study (Nazra/With Translation)"
                placeholder="Enter your Quran study details"
                value={formData.quranStudy}
                onChange={handleChange}
                isInvalid={!!errors.quranStudy}
                errorMessage={errors.quranStudy}
                startContent={<FaBookOpen className="text-default-400" />}
              />
              <Input
                name="occupation"
                label="Occupation"
                placeholder="Enter your occupation"
                value={formData.occupation}
                onChange={handleChange}
                isInvalid={!!errors.occupation}
                errorMessage={errors.occupation}
                startContent={<FaBriefcase className="text-default-400" />}
              />
              <Input
                name="wasiatNumber"
                label="Wasiat Number"
                placeholder="Enter your Wasiat number"
                value={formData.wasiatNumber}
                onChange={handleChange}
                isInvalid={!!errors.wasiatNumber}
                errorMessage={errors.wasiatNumber}
                startContent={<FaClipboardList className="text-default-400" />}
              />

              <Select
                label="Can Ride Bicycle?"
                placeholder="Select yes or no"
                value={formData.canRideBicycle}
                onChange={(e: any) =>
                  handleSelectChange("canRideBicycle", e.target.value)
                }
                startContent={<FaBicycle className="text-default-400" />}
              >
                {yesNoOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </Select>

              <Input
                name="jamatKhidmat"
                label="Jamat Khidmat Details"
                placeholder="Enter your Jamat Khidmat details"
                value={formData.jamatKhidmat}
                onChange={handleChange}
                isInvalid={!!errors.jamatKhidmat}
                errorMessage={errors.jamatKhidmat}
                startContent={<FaHandsHelping className="text-default-400" />}
              />

              <Select
                label="Blood Group"
                placeholder="Select your blood group"
                value={formData.bloodGroup}
                onChange={(e: any) =>
                  handleSelectChange("bloodGroup", e.target.value)
                }
                startContent={<FaTint className="text-default-400" />}
              >
                {bloodGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Marital Status"
                placeholder="Select your marital status"
                value={formData.maritalStatus}
                onChange={(e: any) =>
                  handleSelectChange("maritalStatus", e.target.value)
                }
                startContent={<FaRing className="text-default-400" />}
              >
                {maritalStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </Select>

              {/* Existing Date of Birth and Profile Picture Fields */}
              <Input
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                isInvalid={!!errors.dateOfBirth}
                errorMessage={errors.dateOfBirth}
                className="mb-10"
                startContent={<FaCalendarAlt className="text-default-400" />}
              />

              <div className="space-y-2">
                <p className="text-sm">Profile Picture</p>
                <div className="flex justify-center gap-2">
                  <Button
                    color="primary"
                    variant="flat"
                    onClick={() => handleImageClick("camera")}
                    startContent={<FaCamera className="text-default-400" />}
                  >
                    Take Photo
                  </Button>
                  <Button
                    color="primary"
                    variant="flat"
                    onClick={() => handleImageClick("gallery")}
                    startContent={<FaImage className="text-default-400" />}
                  >
                    Choose from Gallery
                  </Button>
                </div>
                {formData.profilePicture && (
                  <p className="text-sm text-default-400">
                    Selected: {formData.profilePicture.name}
                  </p>
                )}
                {errors.profilePicture && (
                  <p className="text-sm text-danger">{errors.profilePicture}</p>
                )}
              </div>
              {isSubmitting && (
                <div className="px-4 py-2">
                  <Progress
                    size="sm"
                    value={uploadProgress}
                    color="primary"
                    className="max-w-md"
                  />
                  <p className="text-small text-default-500 text-center mt-2">
                    Submitting form... {uploadProgress}%
                  </p>
                </div>
              )}
              <Button
                type="submit"
                color="primary"
                className="w-full"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
