import { Input, Link, Navbar, NavbarContent } from "@nextui-org/react";
import React from "react";
// import { FeedbackIcon } from "../icons/navbar/feedback-icon";
// import { GithubIcon } from "../icons/navbar/github-icon";
// import { SupportIcon } from "../icons/navbar/support-icon";
// import { SearchIcon } from "../icons/searchicon";
import { BurguerButton } from "./burguer-button";
import { NotificationsDropdown } from "./notifications-dropdown";
import { UserDropdown } from "./user-dropdown";

interface Props {
  children: React.ReactNode;
}

export const NavbarWrapper = ({ children }: Props) => {
  return (
    <div className="relative flex flex-col flex-1 overflow-y-hidden overflow-x-hidden">
      <Navbar
        isBordered
        className="w-full"
        classNames={{
          wrapper: "w-full max-w-full",
        }}
      >
        <NavbarContent className="md:hidden">
          <BurguerButton />
        </NavbarContent>
        <h1 className=" font-bold text-base text-center md:text-2xl text-black dark:text-gray-300">
          ELS IGCSE ICT Online EXAM
        </h1>
        <NavbarContent className="w-full max-md:hidden"></NavbarContent>
        <NavbarContent
          justify="end"
          className="w-fit data-[justify=end]:flex-grow-0"
        >
          <NavbarContent>
            <UserDropdown />
          </NavbarContent>
        </NavbarContent>
      </Navbar>
      {children}
    </div>
  );
};
