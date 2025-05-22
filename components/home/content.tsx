"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Tabs,
  Tab,
  Card,
  Spinner,
  Skeleton,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { ChevronDown } from "lucide-react";
// Import icons from React Icons
import {
  FaUsers,
  FaAddressCard,
  FaScroll,
  FaPrayingHands,
  FaIdCard,
  FaPhoneAlt,
} from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";

// Dynamically import charts to support SSR
const TanzeemChart = dynamic(() => import("../charts/steam"), {
  ssr: false,
  loading: () => <ChartSkeleton title="Tanzeem Chart" />,
});

const AgeDistributionChart = dynamic(
  () => import("../charts/AgeDistributionChart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton title="Age Distribution Chart" />,
  }
);

const AddressChart = dynamic(() => import("../charts/AddressChart"), {
  ssr: false,
  loading: () => <ChartSkeleton title="Address Chart" />,
});

const WasiyatChart = dynamic(() => import("../charts/WasiyatChart"), {
  ssr: false,
  loading: () => <ChartSkeleton title="Wasiyat Chart" />,
});

const WaqfeNau = dynamic(() => import("../charts/Waqf-e-Nau"), {
  ssr: false,
  loading: () => <ChartSkeleton title="Waqf-E-Nau Chart" />,
});

const PhoneNumberStatusChart = dynamic(
  () => import("../charts/PhoneNumber/phone-number-status-chart"),
  {
    ssr: false,
    loading: () => <ChartSkeleton title="Phone Number Status Chart" />,
  }
);

const UNHCRStatusChart = dynamic(() => import("../charts/UnStatus"), {
  ssr: false,
  loading: () => <ChartSkeleton title="UNHCR Status Chart" />,
});

const MemberAgeTable = dynamic(() => import("../charts/MemberAgeTable"), {
  ssr: false,
  loading: () => <ChartSkeleton title="Member Age Table" isTable />,
});

// Reusable Chart Skeleton component
const ChartSkeleton = ({
  title,
  isTable = false,
}: {
  title: string;
  isTable?: boolean;
}) => (
  <div className="w-full h-64 flex flex-col items-center justify-center p-4">
    <div className="flex items-center gap-2 mb-4">
      <Spinner size="sm" color="primary" />
      <p className="text-sm text-default-500">Loading {title}...</p>
    </div>

    {isTable ? (
      // Table skeleton
      <div className="w-full">
        <Skeleton className="h-8 w-full rounded-lg mb-2" />
        <Skeleton className="h-6 w-full rounded-lg mb-1" />
        <Skeleton className="h-6 w-full rounded-lg mb-1" />
        <Skeleton className="h-6 w-full rounded-lg mb-1" />
        <Skeleton className="h-6 w-full rounded-lg mb-1" />
        <Skeleton className="h-6 w-full rounded-lg" />
      </div>
    ) : (
      // Chart skeleton
      <div className="w-full flex flex-col gap-3">
        <div className="flex justify-between items-center mb-1">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="flex justify-center gap-2 mt-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-12 rounded-lg" />
          ))}
        </div>
      </div>
    )}
  </div>
);
export const Content = () => {
  const [activeTab, setActiveTab] = useState("tanzeem");

  const tabItems = [
    {
      key: "tanzeem",
      title: "Tanzeem",
      icon: <BsBarChartFill className="w-4 h-4" />,
    },
    {
      key: "address",
      title: "Address",
      icon: <FaAddressCard className="w-4 h-4" />,
    },
    {
      key: "wasiyat",
      title: "Wasiyat",
      icon: <FaScroll className="w-4 h-4" />,
    },
    {
      key: "waqf-e-nau",
      title: "Waqf-E-Nau",
      icon: <FaPrayingHands className="w-4 h-4" />,
    },
    {
      key: "un-card",
      title: "UNHCR Status",
      icon: <FaIdCard className="w-4 h-4" />,
    },
    {
      key: "phoneNumber",
      title: "Phone Number",
      icon: <FaPhoneAlt className="w-4 h-4" />,
    },
  ];

  // Get the active tab object for mobile dropdown display
  const activeTabObject = tabItems.find((tab) => tab.key === activeTab);

  return (
    <div className="h-full flex flex-col gap-2 p-6 pb-0">
      {/* Mobile dropdown for small screens */}
      <div className="md:hidden w-full mb-2">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="flat"
              className="w-full justify-between bg-default-100 rounded-lg py-3"
              endContent={
                <ChevronDown className="text-default-500" size={20} />
              }
            >
              <div className="flex items-center gap-2">
                {activeTabObject?.icon}
                <span>{activeTabObject?.title}</span>
              </div>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Mobile navigation"
            selectedKeys={[activeTab]}
            selectionMode="single"
            onSelectionChange={(key) => {
              if (
                key &&
                typeof key === "object" &&
                key.has(activeTab) === false
              ) {
                setActiveTab(Array.from(key)[0] as string);
              }
            }}
          >
            {tabItems.map((item) => (
              <DropdownItem key={item.key} startContent={item.icon}>
                {item.title}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Desktop tabs for larger screens */}
      <div className="hidden md:block">
        <Tabs
          aria-label="Statistics Tabs"
          size="md"
          color="primary"
          variant="underlined"
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          classNames={{
            base: "w-full",
            tabList: "w-full relative gap-1 flex-wrap",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-3 py-2 data-[selected=true]:text-primary rounded-t-lg data-[hover=true]:bg-default-100 transition-all",
            tabContent: "group-data-[selected=true]:font-semibold",
          }}
        >
          {tabItems.map((item) => (
            <Tab
              key={item.key}
              title={
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              }
            />
          ))}
        </Tabs>
      </div>

      {/* Tab Content - stays the same regardless of screen size */}
      {activeTab === "tanzeem" && (
        <>
          <Card className="w-full bg-default-50 shadow-lg rounded-2xl p-6 mt-4">
            <TanzeemChart />
          </Card>
          <Card className="w-full bg-default-50 shadow-lg rounded-2xl p-6 mt-4">
            <AgeDistributionChart />
          </Card>
          <Card className="w-full bg-default-50 shadow-lg rounded-2xl p-6 mt-4">
            <MemberAgeTable />
          </Card>
        </>
      )}
      {activeTab === "address" && (
        <Card className="w-full bg-default-50 shadow-lg rounded-2xl p-6 mt-4">
          <AddressChart />
        </Card>
      )}
      {activeTab === "wasiyat" && (
        <Card className="w-full bg-default-50 shadow-lg rounded-2xl p-6 mt-4">
          <WasiyatChart />
        </Card>
      )}
      {activeTab === "waqf-e-nau" && (
        <Card className="w-full bg-default-50 shadow-lg rounded-2xl p-6 mt-4">
          <WaqfeNau />
        </Card>
      )}
      {activeTab === "un-card" && (
        <Card className="w-full bg-default-50 shadow-lg rounded-2xl p-6 mt-4">
          <UNHCRStatusChart />
        </Card>
      )}
      {activeTab === "phoneNumber" && (
        <Card className="w-full bg-default-50 shadow-lg rounded-2xl p-6 mt-4">
          <PhoneNumberStatusChart />
        </Card>
      )}
    </div>
  );
};

export default Content;
