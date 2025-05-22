import { IconType } from "react-icons";
import { FaUser, FaAddressCard, FaIdCard, FaCalendarAlt, FaImage } from "react-icons/fa";

export const columns = [
  {name: "NAME", uid: "name", sortable: true},
  {name: "FATHER'S NAME", uid: "fatherName", sortable: true},
  {name: "AIMS NUMBER", uid: "aimsNumber", sortable: true},
  {name: "ADDRESS", uid: "address", sortable: true},
  {name: "UNHCR ID", uid: "unhcrId", sortable: true},
  {name: "DATE OF BIRTH", uid: "dateOfBirth", sortable: true},
  {name: "PROFILE PICTURE", uid: "profilePicture"},
  {name: "ACTIONS", uid: "actions"},
];

export const statusOptions = [
  {name: "Active", uid: "active"},
  {name: "Inactive", uid: "inactive"},
];

export interface User {
  id: number;
  name: string;
  fatherName: string;
  aimsNumber: string;
  address: string;
  unhcrId: string;
  dateOfBirth: string;
  profilePicture: string;
  status: string;
}

// types.ts
export interface UserType {
  id: string;
  name: string;
  fatherName: string;
  aimsNumber: string;
  tanzeemStatus?: string;
  occupation?: string;
  address: string;
  unhcrId?: string;
  dateOfBirth: string;
  education: string;
  bloodGroup: string;
  maritalStatus: string;
  languages?: string[];
  profilePicture?: string;
  waqfeNauNumber?: string;
  [key: string]: any;
}

export const getIconForColumn = (columnUid: string): IconType => {
  switch (columnUid) {
    case "name":
    case "fatherName":
      return FaUser;
    case "address":
      return FaAddressCard;
    case "aimsNumber":
    case "unhcrId":
      return FaIdCard;
    case "dateOfBirth":
      return FaCalendarAlt;
    case "profilePicture":
      return FaImage;
    default:
      return FaUser;
  }
};