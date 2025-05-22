"use client";

import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Chip,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { db } from "@/app/api/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { FaChevronDown } from "react-icons/fa";
import { PiExportFill } from "react-icons/pi";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

interface MemberWithWaqfeNau {
  id: string;
  name: string;
  waqfeNauNumber: string;
  address: string;
  tanzeemStatus?: string;
}

interface AddressWaqfeNauData {
  [key: string]: {
    withWaqfeNau: MemberWithWaqfeNau[];
    withoutWaqfeNau: {
      id: string;
      name: string;
      address: string;
      tanzeemStatus?: string;
    }[];
  };
}

interface WaqfeNauSummary {
  [key: string]: {
    total: number;
    withWaqfeNau: number;
    withoutWaqfeNau: number;
    khuddamWithWaqfeNau: number;
    atfalWithWaqfeNau: number;
  };
}

interface WasiyatDataState {
  khuddam: { hasWaqfeNau: number; noWaqfeNau: number };
  atfal: { hasWaqfeNau: number; noWaqfeNau: number };
}

export const WaqfeNauByAddress = () => {
  const [addressWaqfeNauData, setAddressWaqfeNauData] =
    useState<AddressWaqfeNauData>({});
  const [waqfeNauSummary, setWaqfeNauSummary] = useState<WaqfeNauSummary>({});
  const [waqfeNauData, setWaqfeNauData] = useState<WasiyatDataState>({
    khuddam: { hasWaqfeNau: 0, noWaqfeNau: 0 },
    atfal: { hasWaqfeNau: 0, noWaqfeNau: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string>("all");
  const [tanzeemFilter, setTanzeemFilter] = useState<
    "all" | "khuddam" | "atfal"
  >("all");
  const [waqfeNauFilter, setWaqfeNauFilter] = useState<
    "all" | "with" | "without"
  >("with");

  useEffect(() => {
    const fetchWaqfeNauData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "formSubmissions"));

        const addressData: AddressWaqfeNauData = {
          A: { withWaqfeNau: [], withoutWaqfeNau: [] },
          B: { withWaqfeNau: [], withoutWaqfeNau: [] },
          C: { withWaqfeNau: [], withoutWaqfeNau: [] },
          D: { withWaqfeNau: [], withoutWaqfeNau: [] },
          F: { withWaqfeNau: [], withoutWaqfeNau: [] },
          H: { withWaqfeNau: [], withoutWaqfeNau: [] },
          other: { withWaqfeNau: [], withoutWaqfeNau: [] },
        };

        const summary: WaqfeNauSummary = {
          A: {
            total: 0,
            withWaqfeNau: 0,
            withoutWaqfeNau: 0,
            khuddamWithWaqfeNau: 0,
            atfalWithWaqfeNau: 0,
          },
          B: {
            total: 0,
            withWaqfeNau: 0,
            withoutWaqfeNau: 0,
            khuddamWithWaqfeNau: 0,
            atfalWithWaqfeNau: 0,
          },
          C: {
            total: 0,
            withWaqfeNau: 0,
            withoutWaqfeNau: 0,
            khuddamWithWaqfeNau: 0,
            atfalWithWaqfeNau: 0,
          },
          D: {
            total: 0,
            withWaqfeNau: 0,
            withoutWaqfeNau: 0,
            khuddamWithWaqfeNau: 0,
            atfalWithWaqfeNau: 0,
          },
          F: {
            total: 0,
            withWaqfeNau: 0,
            withoutWaqfeNau: 0,
            khuddamWithWaqfeNau: 0,
            atfalWithWaqfeNau: 0,
          },
          H: {
            total: 0,
            withWaqfeNau: 0,
            withoutWaqfeNau: 0,
            khuddamWithWaqfeNau: 0,
            atfalWithWaqfeNau: 0,
          },
          other: {
            total: 0,
            withWaqfeNau: 0,
            withoutWaqfeNau: 0,
            khuddamWithWaqfeNau: 0,
            atfalWithWaqfeNau: 0,
          },
          all: {
            total: 0,
            withWaqfeNau: 0,
            withoutWaqfeNau: 0,
            khuddamWithWaqfeNau: 0,
            atfalWithWaqfeNau: 0,
          },
        };

        // For original charts
        const originalData = {
          khuddam: { hasWaqfeNau: 0, noWaqfeNau: 0 },
          atfal: { hasWaqfeNau: 0, noWaqfeNau: 0 },
        };

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const tanzeemStatus = data.tanzeemStatus?.toLowerCase() || "";
          const waqfeNauNumber = String(data.waqfeNauNumber || "").trim();
          const memberName = data.name || "Unknown";
          const address = String(data.address || "").trim();
          const firstLetter = address.charAt(0).toUpperCase();

          // Determine address category
          const addressCategory = ["A", "B", "C", "D", "F", "H"].includes(
            firstLetter
          )
            ? firstLetter
            : "other";

          // Improved check for valid waqfeNau number
          const hasWaqfeNau =
            waqfeNauNumber !== "" &&
            waqfeNauNumber !== "000" &&
            waqfeNauNumber !== "00" &&
            waqfeNauNumber !== "No." &&
            waqfeNauNumber !== "None" &&
            waqfeNauNumber.toLowerCase() !== "no" &&
            waqfeNauNumber.toLowerCase() !== "null" &&
            waqfeNauNumber.toLowerCase() !== "undefined" &&
            waqfeNauNumber !== "0";

          // Update summary counts
          summary[addressCategory].total += 1;
          summary.all.total += 1;

          // Update original chart data
          if (tanzeemStatus === "khuddam") {
            if (hasWaqfeNau) {
              originalData.khuddam.hasWaqfeNau += 1;
            } else {
              originalData.khuddam.noWaqfeNau += 1;
            }
          } else if (tanzeemStatus === "atfal") {
            if (hasWaqfeNau) {
              originalData.atfal.hasWaqfeNau += 1;
            } else {
              originalData.atfal.noWaqfeNau += 1;
            }
          }

          if (hasWaqfeNau) {
            // Add to withWaqfeNau list
            addressData[addressCategory].withWaqfeNau.push({
              id: doc.id,
              name: memberName,
              waqfeNauNumber,
              address,
              tanzeemStatus,
            });

            // Update summary counts
            summary[addressCategory].withWaqfeNau += 1;
            summary.all.withWaqfeNau += 1;

            if (tanzeemStatus === "khuddam") {
              summary[addressCategory].khuddamWithWaqfeNau += 1;
              summary.all.khuddamWithWaqfeNau += 1;
            } else if (tanzeemStatus === "atfal") {
              summary[addressCategory].atfalWithWaqfeNau += 1;
              summary.all.atfalWithWaqfeNau += 1;
            }
          } else {
            // Add to withoutWaqfeNau list
            addressData[addressCategory].withoutWaqfeNau.push({
              id: doc.id,
              name: memberName,
              address,
              tanzeemStatus,
            });

            // Update summary counts
            summary[addressCategory].withoutWaqfeNau += 1;
            summary.all.withoutWaqfeNau += 1;
          }
        });

        setAddressWaqfeNauData(addressData);
        setWaqfeNauSummary(summary);
        setWaqfeNauData(originalData);
      } catch (error) {
        console.error("Error fetching Waqf-e-Nau data:", error);
        toast.error("Failed to load Waqf-e-Nau data");
      } finally {
        setLoading(false);
      }
    };

    fetchWaqfeNauData();
  }, []);

  // Get filtered members based on selected address, tanzeem filter, and waqfeNau filter
  const filteredMembers = React.useMemo(() => {
    // If no data is loaded yet, return empty arrays
    if (
      !addressWaqfeNauData[selectedAddress === "all" ? "A" : selectedAddress]
    ) {
      return { withWaqfeNau: [], withoutWaqfeNau: [] };
    }

    // Get all members if "all" is selected, otherwise get members from the selected address
    const result = {
      withWaqfeNau:
        selectedAddress === "all"
          ? Object.values(addressWaqfeNauData).flatMap(
              (data) => data.withWaqfeNau
            )
          : [...addressWaqfeNauData[selectedAddress].withWaqfeNau],
      withoutWaqfeNau:
        selectedAddress === "all"
          ? Object.values(addressWaqfeNauData).flatMap(
              (data) => data.withoutWaqfeNau
            )
          : [...addressWaqfeNauData[selectedAddress].withoutWaqfeNau],
    };

    // Apply tanzeem filter
    if (tanzeemFilter !== "all") {
      result.withWaqfeNau = result.withWaqfeNau.filter(
        (member) => member.tanzeemStatus?.toLowerCase() === tanzeemFilter
      );
      result.withoutWaqfeNau = result.withoutWaqfeNau.filter(
        (member) => member.tanzeemStatus?.toLowerCase() === tanzeemFilter
      );
    }

    return result;
  }, [addressWaqfeNauData, selectedAddress, tanzeemFilter]);

  // Chart options for grouped bar chart (original)
  const groupedBarOptions = {
    chart: {
      id: "wasiyat-distribution",
      type: "bar" as const,
      foreColor: "hsl(var(--nextui-default-800))",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
        endingShape: "rounded",
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["Khuddam", "Atfal"],
      labels: {
        style: {
          colors: "hsl(var(--nextui-default-800))",
        },
      },
    },
    yaxis: {
      title: {
        text: "Number of Members",
        style: {
          color: "hsl(var(--nextui-default-800))",
        },
      },
      labels: {
        style: {
          colors: "hsl(var(--nextui-default-800))",
        },
      },
    },
    colors: ["#0070F3", "#F31260"],
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom" as const,
      labels: {
        colors: "hsl(var(--nextui-default-800))",
      },
    },
    grid: {
      borderColor: "hsl(var(--nextui-default-200))",
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (value: any) => value + " members",
      },
    },
  };

  // Data for grouped bar chart (original)
  const groupedBarSeries = [
    {
      name: "Has Waqf-E-Nau",
      data: [waqfeNauData.khuddam.hasWaqfeNau, waqfeNauData.atfal.hasWaqfeNau],
    },
    {
      name: "No Waqf-E-Nau",
      data: [waqfeNauData.khuddam.noWaqfeNau, waqfeNauData.atfal.noWaqfeNau],
    },
  ];

  // Pie chart options (original)
  const pieOptions = {
    chart: {
      id: "wasiyat-pie",
      foreColor: "hsl(var(--nextui-default-800))",
      toolbar: {
        show: false,
      },
    },
    labels: [
      "Khuddam with Waqf-E-Nau",
      "Khuddam without Waqf-E-Nau",
      "Atfal with Waqf-E-Nau",
      "Atfal without Waqf-E-Nau",
    ],
    colors: ["#0070F3", "#7928CA", "#F5A524", "#F31260"],
    legend: {
      position: "bottom" as const,
      fontSize: "14px",
      labels: {
        colors: "hsl(var(--nextui-default-800))",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: any) => val.toFixed(1) + "%",
      style: {
        fontSize: "14px",
        fontWeight: "bold",
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    tooltip: {
      y: {
        formatter: (value: any) => value + " members",
      },
    },
  };

  // Data for pie chart (original)
  const pieSeries = [
    waqfeNauData.khuddam.hasWaqfeNau,
    waqfeNauData.khuddam.noWaqfeNau,
    waqfeNauData.atfal.hasWaqfeNau,
    waqfeNauData.atfal.noWaqfeNau,
  ];

  // Handle export to Excel
  const handleExport = () => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Prepare data for export
      const exportData = filteredMembers.withWaqfeNau.map((member) => ({
        Name: member.name,
        "Waqf-e-Nau Number": member.waqfeNauNumber,
        Address: member.address,
        "Tanzeem Status": member.tanzeemStatus || "N/A",
      }));

      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Add worksheet to workbook
      const blockName =
        selectedAddress === "all" ? "All_Blocks" : `Block_${selectedAddress}`;
      const tanzeemName =
        tanzeemFilter === "all"
          ? "All"
          : tanzeemFilter.charAt(0).toUpperCase() + tanzeemFilter.slice(1);
      XLSX.utils.book_append_sheet(
        wb,
        ws,
        `${blockName}_${tanzeemName}_WaqfeNau`
      );

      // Generate timestamp for filename
      const timestamp = new Date().toISOString().split("T")[0];

      // Save the file
      XLSX.writeFile(wb, `waqfenau_by_address_${timestamp}.xlsx`);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  // Get address options with counts
  const addressOptions = React.useMemo(() => {
    return [
      {
        key: "all",
        label: `All Blocks (${waqfeNauSummary.all?.withWaqfeNau || 0})`,
      },
      ...["A", "B", "C", "D", "F", "H", "other"].map((addr) => ({
        key: addr,
        label: `${addr === "other" ? "Other" : `Block ${addr}`} (${
          waqfeNauSummary[addr]?.withWaqfeNau || 0
        })`,
      })),
    ];
  }, [waqfeNauSummary]);

  // Render summary cards
  const renderSummaryCards = () => {
    const addressesToShow =
      selectedAddress === "all"
        ? ["A", "B", "C", "D", "F", "H"]
        : [selectedAddress];

    return addressesToShow.map((addr) => {
      const data = waqfeNauSummary[addr] || {
        total: 0,
        withWaqfeNau: 0,
        khuddamWithWaqfeNau: 0,
        atfalWithWaqfeNau: 0,
      };
      const percentage =
        data.total > 0
          ? ((data.withWaqfeNau * 100) / data.total).toFixed(0)
          : "0";

      return (
        <Card key={addr} className="bg-default-50 shadow-sm">
          <CardBody className="py-4 px-4">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="text-lg font-semibold">Block {addr}</h5>
                <p className="text-default-500 text-sm">{data.total} members</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex gap-2 mb-1">
                  <Chip size="sm" color="primary" variant="flat">
                    {data.khuddamWithWaqfeNau} Khuddam
                  </Chip>
                  <Chip size="sm" color="warning" variant="flat">
                    {data.atfalWithWaqfeNau} Atfal
                  </Chip>
                </div>
                <p className="text-xs text-default-500">
                  {percentage}% Waqf-e-Nau
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      );
    });
  };

  // Total counts for summary
  const totalWithWasiyat =
    waqfeNauData.khuddam.hasWaqfeNau + waqfeNauData.atfal.hasWaqfeNau;
  const totalWithoutWasiyat =
    waqfeNauData.khuddam.noWaqfeNau + waqfeNauData.atfal.noWaqfeNau;
  const grandTotal = totalWithWasiyat + totalWithoutWasiyat;

  return (
    <div className="flex flex-col gap-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner color="primary" size="lg" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary-50 shadow-md rounded-xl">
              <CardBody>
                <div className="text-center">
                  <h5 className="text-lg font-semibold">With Waqf-E-Nau</h5>
                  <p className="text-3xl font-bold text-primary">
                    {totalWithWasiyat}
                  </p>
                  <p className="text-sm text-primary-600">
                    {grandTotal > 0
                      ? ((totalWithWasiyat / grandTotal) * 100).toFixed(1) + "%"
                      : "0%"}
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-danger-50 shadow-md rounded-xl">
              <CardBody>
                <div className="text-center">
                  <h5 className="text-lg font-semibold">Without Waqf-E-Nau</h5>
                  <p className="text-3xl font-bold text-danger">
                    {totalWithoutWasiyat}
                  </p>
                  <p className="text-sm text-danger-600">
                    {grandTotal > 0
                      ? ((totalWithoutWasiyat / grandTotal) * 100).toFixed(1) +
                        "%"
                      : "0%"}
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-default-50 shadow-md rounded-xl">
              <CardBody>
                <div className="text-center">
                  <h5 className="text-lg font-semibold">Total Tajneed</h5>
                  <p className="text-3xl font-bold">{grandTotal}</p>
                  <p className="text-sm text-default-600">All Tajneed</p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Original Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grouped Bar Chart */}
            <Card className="bg-default-50 shadow-lg rounded-2xl">
              <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
                <h4 className="font-bold text-xl">Waqf-E-Nau Distribution</h4>
                <p className="text-default-500">
                  Comparison of tajneed with and without Waqf-E-Nau
                </p>
              </CardHeader>
              <CardBody>
                <Chart
                  options={groupedBarOptions}
                  series={groupedBarSeries}
                  type="bar"
                  height={300}
                />
              </CardBody>
            </Card>

            {/* Pie Chart */}
            <Card className="bg-default-50 shadow-lg rounded-2xl">
              <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
                <h4 className="font-bold text-xl">Waqf-E-Nau Breakdown</h4>
                <p className="text-default-500">
                  Detailed breakdown of Waqf-E-Nau status by Tanzeem
                </p>
              </CardHeader>
              <CardBody>
                <Chart
                  options={pieOptions}
                  series={pieSeries}
                  type="pie"
                  height={300}
                />
              </CardBody>
            </Card>
          </div>

          {/* Address Block Details */}
          <h4 className="font-bold text-lg mt-2">
            Waqf-e-Nau by Address Block
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderSummaryCards()}
          </div>

          {/* Members Table Section */}
          <Card className="shadow-lg rounded-2xl">
            <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
              <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h4 className="font-bold text-xl">
                    Waqf-e-Nau Members by Address
                  </h4>
                  <p className="text-default-500">
                    {filteredMembers.withWaqfeNau.length} members with
                    Waqf-e-Nau
                  </p>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button
                    color="primary"
                    variant="flat"
                    startContent={<PiExportFill />}
                    onPress={handleExport}
                  >
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="flat"
                      endContent={<FaChevronDown className="text-small" />}
                    >
                      {addressOptions.find((opt) => opt.key === selectedAddress)
                        ?.label || "All Blocks"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Address Blocks"
                    selectionMode="single"
                    selectedKeys={[selectedAddress]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0]?.toString() || "all";
                      setSelectedAddress(selected);
                    }}
                  >
                    {addressOptions.map((option) => (
                      <DropdownItem key={option.key}>
                        {option.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>

                <Tabs
                  aria-label="Tanzeem Filter"
                  selectedKey={tanzeemFilter}
                  onSelectionChange={(key) => {
                    setTanzeemFilter(key as "all" | "khuddam" | "atfal");
                  }}
                >
                  <Tab key="all" title="All" />
                  <Tab key="khuddam" title="Khuddam" />
                  <Tab key="atfal" title="Atfal" />
                </Tabs>

                <Tabs
                  aria-label="Waqf-e-Nau Filter"
                  selectedKey={waqfeNauFilter}
                  onSelectionChange={(key) => {
                    setWaqfeNauFilter(key as "all" | "with" | "without");
                  }}
                  className="ml-auto"
                >
                  <Tab key="with" title="With Waqf-e-Nau" />
                  <Tab key="without" title="Without Waqf-e-Nau" />
                  <Tab key="all" title="All" />
                </Tabs>
              </div>

              <Table aria-label="Waqf-e-Nau Members by Address">
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>ADDRESS</TableColumn>
                  <TableColumn>WAQF-E-NAU NUMBER</TableColumn>
                  <TableColumn>TANZEEM</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No members found">
                  {(() => {
                    // Filter members based on waqfeNauFilter
                    let displayMembers: {
                      id: string;
                      name: string;
                      address: string;
                      waqfeNauNumber: string;
                      tanzeemStatus?: string;
                    }[] = [];

                    if (waqfeNauFilter === "with" || waqfeNauFilter === "all") {
                      displayMembers = [
                        ...displayMembers,
                        ...filteredMembers.withWaqfeNau,
                      ];
                    }

                    if (
                      waqfeNauFilter === "without" ||
                      waqfeNauFilter === "all"
                    ) {
                      displayMembers = [
                        ...displayMembers,
                        ...filteredMembers.withoutWaqfeNau.map((member) => ({
                          ...member,
                          waqfeNauNumber: "—",
                        })),
                      ];
                    }

                    return displayMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.address}</TableCell>
                        <TableCell>{member.waqfeNauNumber}</TableCell>
                        <TableCell>
                          <Chip
                            color={
                              member.tanzeemStatus?.toLowerCase() === "khuddam"
                                ? "primary"
                                : "warning"
                            }
                            variant="flat"
                            size="sm"
                          >
                            {member.tanzeemStatus || "—"}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};

export default WaqfeNauByAddress;
