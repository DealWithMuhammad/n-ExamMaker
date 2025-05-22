// Interface definitions
export interface Member {
  name: string;
  phoneNumber: string;
  id: string;
  address: string;
  aimsNumber: string;
  profilePicture?: string;
}

export interface PhoneDataState {
  hasPhone: number;
  noPhone: number;
}

export interface MembersListState {
  hasPhone: Member[];
  noPhone: Member[];
}

// Helper function to check if phone number exists and is valid
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  const trimmedPhone = phone.trim();
  return (
    trimmedPhone !== "" &&
    trimmedPhone.toLowerCase() !== "no" &&
    trimmedPhone.toLowerCase() !== "none" &&
    trimmedPhone !== "0"
  );
};

// Function to get status indicator color based on tab
export const getStatusColor = (status: string) => {
  switch (status) {
    case "hasPhone":
      return "success";
    case "noPhone":
      return "danger";
    default:
      return "default";
  }
};

// Function to get the status display name
export const getStatusName = (status: string) => {
  switch (status) {
    case "hasPhone":
      return "Has Phone Number";
    case "noPhone":
      return "Missing Phone Number";
    default:
      return status;
  }
};
