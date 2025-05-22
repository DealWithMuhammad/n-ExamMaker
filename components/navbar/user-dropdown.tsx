import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  Button,
  NavbarItem,
} from "@nextui-org/react";
import React, { useCallback, useState } from "react";
import DarkModeSwitch from "./darkmodeswitch";
import { useRouter } from "next/navigation";
import { deleteAuthCookie } from "@/actions/auth.action";
import { IoIosMenu } from "react-icons/io";
import { SettingsIcon } from "../icons/sidebar/settings-icon";
import { User } from "lucide-react";
import UserProfile from "../profile/UserProfile";

export const UserDropdown = () => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await deleteAuthCookie();
    router.replace("/login");
  }, [router]);

  return (
    <>
      <Dropdown closeOnSelect={false}>
        <NavbarItem>
          <DropdownTrigger>
            <Button isIconOnly variant="light">
              <SettingsIcon />
            </Button>
          </DropdownTrigger>
        </NavbarItem>
        <DropdownMenu
          aria-label="User menu actions"
          onAction={(actionKey) => {
            if (actionKey === "profile") {
              setIsProfileOpen(true);
            }
          }}
        >
          <DropdownItem key="profile" startContent={<User size={16} />}>
            My Profile
          </DropdownItem>
          <DropdownItem
            key="logout"
            color="danger"
            className="text-danger"
            onPress={handleLogout}
          >
            Log Out
          </DropdownItem>
          <DropdownItem key="switch">
            <DarkModeSwitch />
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* User Profile Modal */}
      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
};
