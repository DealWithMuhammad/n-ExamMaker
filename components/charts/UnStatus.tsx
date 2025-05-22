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
  Tooltip,
} from "@nextui-org/react";
import { db } from "@/app/api/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

// Interface definitions
interface UNHCRMember {
  name: string;
  unhcrId: string;
  id: string;
  unhcrStatus: string;
  hasValidId: boolean;
}

interface UNHCRDataState {
  card: number;
  letter: number;
  online: number;
  missing: number;
}

interface MembersListState {
  card: UNHCRMember[];
  letter: UNHCRMember[];
  online: UNHCRMember[];
  missing: UNHCRMember[];
}

export const UNHCRStatusChart = () => {
  const [unhcrData, setUNHCRData] = useState<UNHCRDataState>({
    card: 0,
    letter: 0,
    online: 0,
    missing: 0,
  });

  const [membersList, setMembersList] = useState<MembersListState>({
    card: [],
    letter: [],
    online: [],
    missing: [],
  });

  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("card");

  // Function to check if UNHCR ID is valid (starts with digits or RM)
  const isValidUNHCRId = (id: string): boolean => {
    if (!id) return false;

    const trimmedId = id.trim();

    // Return true if ID starts with digits or starts with "RM"
    return /^\d/.test(trimmedId) || trimmedId.startsWith("RM");
  };

  useEffect(() => {
    const fetchUNHCRData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "formSubmissions"));

        const results: UNHCRDataState = {
          card: 0,
          letter: 0,
          online: 0,
          missing: 0,
        };

        const members: MembersListState = {
          card: [],
          letter: [],
          online: [],
          missing: [],
        };

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const unhcrStatus = String(data.unhcrStatus || "")
            .trim()
            .toLowerCase();
          const unhcrId = String(data.unhcrId || "").trim();
          const memberName = data.name || "Unknown";

          // Check if UNHCR ID is valid
          const hasValidId = isValidUNHCRId(unhcrId);

          // Determine status based on the rules provided
          let category = "missing";

          if (unhcrStatus === "card") {
            category = "card";
          } else if (unhcrStatus === "letter") {
            category = "letter";
          } else if (
            unhcrStatus === "online registration" ||
            unhcrId.startsWith("RM-") ||
            unhcrStatus === "online"
          ) {
            category = "online";
          } else if (
            unhcrId === "" ||
            unhcrId.toLowerCase() === "no" ||
            unhcrId.toLowerCase() === "none" ||
            unhcrId.toLowerCase() === "null" ||
            unhcrId.toLowerCase() === "undefined" ||
            unhcrId === "0"
          ) {
            category = "missing";
          }

          // Increment the counter for the primary category
          results[category as keyof UNHCRDataState] += 1;

          // Add to the primary category members list
          members[category as keyof MembersListState].push({
            name: memberName,
            unhcrId: unhcrId,
            id: doc.id,
            unhcrStatus: unhcrStatus,
            hasValidId: hasValidId,
          });

          // If ID is not valid, also add to missing info category
          if (!hasValidId && category !== "missing") {
            // Don't increment the counter (to avoid double counting)
            // But add to the missing info list for reference
            members.missing.push({
              name: memberName,
              unhcrId: unhcrId,
              id: doc.id,
              unhcrStatus: unhcrStatus,
              hasValidId: false,
            });
          }
        });

        setUNHCRData(results);
        setMembersList(members);
      } catch (error) {
        console.error("Error fetching UNHCR data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUNHCRData();
  }, []);

  // Chart options for grouped bar chart
  const groupedBarOptions = {
    chart: {
      id: "unhcr-distribution",
      type: "bar" as "bar",
      foreColor: "hsl(var(--nextui-default-800))",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "65%",
        borderRadius: 6,
        endingShape: "rounded",
        distributed: true,
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Card Holders",
        "Letter Holders",
        "Online Registration",
        "Missing Info",
      ],
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
    colors: ["#17C964", "#0070F3", "#FFA500", "#F31260"],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontWeight: "bold",
      },
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: "hsl(var(--nextui-default-200))",
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: function (value: any) {
          return value + " members";
        },
      },
    },
  };

  // Data for grouped bar chart
  const groupedBarSeries = [
    {
      name: "UNHCR Status",
      data: [
        unhcrData.card,
        unhcrData.letter,
        unhcrData.online,
        unhcrData.missing,
      ],
    },
  ];

  // Pie chart options
  const pieOptions = {
    chart: {
      id: "unhcr-pie",
      foreColor: "hsl(var(--nextui-default-800))",
      toolbar: {
        show: false,
      },
    },
    labels: [
      "Card Holders",
      "Letter Holders",
      "Online Registration",
      "Missing Info",
    ],
    colors: ["#17C964", "#0070F3", "#FFA500", "#F31260"],
    legend: {
      position: "bottom" as "bottom",
      fontSize: "14px",
      labels: {
        colors: "hsl(var(--nextui-default-800))",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: any) {
        return val.toFixed(1) + "%";
      },
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
        formatter: function (value: any) {
          return value + " members";
        },
      },
    },
  };

  // Data for pie chart
  const pieSeries = [
    unhcrData.card,
    unhcrData.letter,
    unhcrData.online,
    unhcrData.missing,
  ];

  // Total counts for summary
  const totalMembers =
    unhcrData.card + unhcrData.letter + unhcrData.online + unhcrData.missing;

  const totalRegistered = unhcrData.card + unhcrData.letter + unhcrData.online;

  // Function to count members with invalid IDs in each category
  const getInvalidIdCount = (category: keyof MembersListState) => {
    return membersList[category].filter((member) => !member.hasValidId).length;
  };

  // Function to render the appropriate table based on the selected tab
  const renderMembersTable = () => {
    const members = membersList[selectedTab as keyof MembersListState];

    if (members.length === 0) {
      return (
        <TableRow key="no-members">
          <TableCell>No members found in this category</TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
        </TableRow>
      );
    }

    return members.map((member) => (
      <TableRow
        key={member.id}
        className={!member.hasValidId ? "bg-danger-50" : ""}
      >
        <TableCell>{member.name}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {member.unhcrId || "Not provided"}
            {!member.hasValidId && (
              <Tooltip content="Invalid or missing UNHCR ID format">
                <Chip size="sm" color="danger" variant="flat">
                  Invalid ID
                </Chip>
              </Tooltip>
            )}
          </div>
        </TableCell>
        <TableCell>{member.unhcrStatus || "Not specified"}</TableCell>
        <TableCell>
          {selectedTab === "missing" &&
            member.unhcrStatus &&
            member.unhcrStatus !== "missing" && (
              <Chip
                size="sm"
                color={
                  member.unhcrStatus === "card"
                    ? "success"
                    : member.unhcrStatus === "letter"
                    ? "primary"
                    : member.unhcrStatus === "online"
                    ? "warning"
                    : "default"
                }
              >
                {member.unhcrStatus}
              </Chip>
            )}
        </TableCell>
      </TableRow>
    ));
  };

  // Get status indicator color based on tab
  const getStatusColor = (status: string) => {
    switch (status) {
      case "card":
        return "success";
      case "letter":
        return "primary";
      case "online":
        return "warning";
      case "missing":
        return "danger";
      default:
        return "default";
    }
  };

  // Get the status display name
  const getStatusName = (status: string) => {
    switch (status) {
      case "card":
        return "Card Holders";
      case "letter":
        return "Letter Holders";
      case "online":
        return "Online Registration";
      case "missing":
        return "Missing Information";
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-success-50 shadow-md rounded-xl">
          <CardBody>
            <div className="text-center">
              <h5 className="text-lg font-semibold">Card Holders</h5>
              <p className="text-3xl font-bold text-success">
                {unhcrData.card}
              </p>
              <p className="text-sm text-success-600">
                {totalMembers > 0
                  ? ((unhcrData.card / totalMembers) * 100).toFixed(1) + "%"
                  : "0%"}
              </p>
              {getInvalidIdCount("card") > 0 && (
                <div className="mt-2">
                  <Chip size="sm" color="danger" variant="flat">
                    {getInvalidIdCount("card")} with invalid ID
                  </Chip>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-primary-50 shadow-md rounded-xl">
          <CardBody>
            <div className="text-center">
              <h5 className="text-lg font-semibold">Letter Holders</h5>
              <p className="text-3xl font-bold text-primary">
                {unhcrData.letter}
              </p>
              <p className="text-sm text-primary-600">
                {totalMembers > 0
                  ? ((unhcrData.letter / totalMembers) * 100).toFixed(1) + "%"
                  : "0%"}
              </p>
              {getInvalidIdCount("letter") > 0 && (
                <div className="mt-2">
                  <Chip size="sm" color="danger" variant="flat">
                    {getInvalidIdCount("letter")} with invalid ID
                  </Chip>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-warning-50 shadow-md rounded-xl">
          <CardBody>
            <div className="text-center">
              <h5 className="text-lg font-semibold">Online Registration</h5>
              <p className="text-3xl font-bold text-warning">
                {unhcrData.online}
              </p>
              <p className="text-sm text-warning-600">
                {totalMembers > 0
                  ? ((unhcrData.online / totalMembers) * 100).toFixed(1) + "%"
                  : "0%"}
              </p>
              {getInvalidIdCount("online") > 0 && (
                <div className="mt-2">
                  <Chip size="sm" color="danger" variant="flat">
                    {getInvalidIdCount("online")} with invalid ID
                  </Chip>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-danger-50 shadow-md rounded-xl">
          <CardBody>
            <div className="text-center">
              <h5 className="text-lg font-semibold">Missing Information</h5>
              <p className="text-3xl font-bold text-danger">
                {unhcrData.missing +
                  getInvalidIdCount("card") +
                  getInvalidIdCount("letter") +
                  getInvalidIdCount("online")}
              </p>
              <p className="text-sm text-danger-600">
                {totalMembers > 0
                  ? (
                      ((unhcrData.missing +
                        getInvalidIdCount("card") +
                        getInvalidIdCount("letter") +
                        getInvalidIdCount("online")) /
                        totalMembers) *
                      100
                    ).toFixed(1) + "%"
                  : "0%"}
              </p>
              <div className="mt-2">
                <Tooltip content="Total includes entries from other categories with invalid IDs">
                  <Chip size="sm" color="danger">
                    {membersList.missing.length} entries total
                  </Chip>
                </Tooltip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Stats Card */}
      <Card className="bg-default-50 shadow-md rounded-xl">
        <CardBody>
          <div className="flex flex-col md:flex-row justify-around items-center gap-6 p-4">
            <div className="text-center">
              <h5 className="text-xl font-semibold">Total Members</h5>
              <p className="text-4xl font-bold">{totalMembers}</p>
            </div>
            <div className="w-px h-16 bg-default-200 hidden md:block"></div>
            <div className="text-center">
              <h5 className="text-xl font-semibold">Registered with UNHCR</h5>
              <p className="text-4xl font-bold text-success">
                {totalRegistered}
              </p>
              <p className="text-sm text-success-600">
                {totalMembers > 0
                  ? ((totalRegistered / totalMembers) * 100).toFixed(1) + "%"
                  : "0%"}
              </p>
            </div>
            <div className="w-px h-16 bg-default-200 hidden md:block"></div>
            <div className="text-center">
              <h5 className="text-xl font-semibold">
                Invalid/Missing Information
              </h5>
              <p className="text-4xl font-bold text-danger">
                {unhcrData.missing +
                  getInvalidIdCount("card") +
                  getInvalidIdCount("letter") +
                  getInvalidIdCount("online")}
              </p>
              <p className="text-sm text-danger-600">
                {totalMembers > 0
                  ? (
                      ((unhcrData.missing +
                        getInvalidIdCount("card") +
                        getInvalidIdCount("letter") +
                        getInvalidIdCount("online")) /
                        totalMembers) *
                      100
                    ).toFixed(1) + "%"
                  : "0%"}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grouped Bar Chart */}
        <Card className="bg-default-50 shadow-lg rounded-2xl">
          <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
            <h4 className="font-bold text-xl">UNHCR Status Distribution</h4>
            <p className="text-default-500">
              Breakdown of tajneed by UNHCR registration status
            </p>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner color="primary" size="lg" />
              </div>
            ) : (
              <Chart
                options={groupedBarOptions}
                series={groupedBarSeries}
                type="bar"
                height={350}
              />
            )}
          </CardBody>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-default-50 shadow-lg rounded-2xl">
          <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
            <h4 className="font-bold text-xl">UNHCR Status Breakdown</h4>
            <p className="text-default-500">
              Percentage distribution of UNHCR registration status
            </p>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner color="primary" size="lg" />
              </div>
            ) : (
              <Chart
                options={pieOptions}
                series={pieSeries}
                type="pie"
                height={350}
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Members List Section with Tabs */}
      <Card className="shadow-lg rounded-2xl">
        <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
          <h4 className="font-bold text-xl">UNHCR Status Details</h4>
          <p className="text-default-500">
            Detailed information about members' UNHCR status
          </p>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="primary" size="lg" />
            </div>
          ) : (
            <div>
              <Tabs
                aria-label="UNHCR Status"
                color={getStatusColor(selectedTab) as any}
                variant="underlined"
                classNames={{
                  tab: "h-10",
                  tabList: "gap-2 w-full relative",
                  cursor: "w-full",
                  panel: "p-0 mt-4",
                }}
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key as string)}
              >
                <Tab
                  key="card"
                  title={
                    <div className="flex items-center space-x-2">
                      <span className="h-3 w-3 rounded-full bg-success"></span>
                      <span>Card Holders ({unhcrData.card})</span>
                      {getInvalidIdCount("card") > 0 && (
                        <Chip size="sm" color="danger" variant="flat">
                          {getInvalidIdCount("card")}
                        </Chip>
                      )}
                    </div>
                  }
                />
                <Tab
                  key="letter"
                  title={
                    <div className="flex items-center space-x-2">
                      <span className="h-3 w-3 rounded-full bg-primary"></span>
                      <span>Letter Holders ({unhcrData.letter})</span>
                      {getInvalidIdCount("letter") > 0 && (
                        <Chip size="sm" color="danger" variant="flat">
                          {getInvalidIdCount("letter")}
                        </Chip>
                      )}
                    </div>
                  }
                />
                <Tab
                  key="online"
                  title={
                    <div className="flex items-center space-x-2">
                      <span className="h-3 w-3 rounded-full bg-warning"></span>
                      <span>Online Registration ({unhcrData.online})</span>
                      {getInvalidIdCount("online") > 0 && (
                        <Chip size="sm" color="danger" variant="flat">
                          {getInvalidIdCount("online")}
                        </Chip>
                      )}
                    </div>
                  }
                />
                <Tab
                  key="missing"
                  title={
                    <div className="flex items-center space-x-2">
                      <span className="h-3 w-3 rounded-full bg-danger"></span>
                      <span>Missing Info ({membersList.missing.length})</span>
                    </div>
                  }
                />
              </Tabs>

              <div className="mt-4">
                <Card>
                  <CardHeader className="pb-0 pt-4 px-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg">
                        {getStatusName(selectedTab)}
                      </h4>
                      <p className="text-default-500">
                        {
                          membersList[selectedTab as keyof MembersListState]
                            .length
                        }{" "}
                        members
                      </p>
                      {selectedTab !== "missing" &&
                        getInvalidIdCount(
                          selectedTab as keyof MembersListState
                        ) > 0 && (
                          <p className="text-danger text-sm">
                            {getInvalidIdCount(
                              selectedTab as keyof MembersListState
                            )}{" "}
                            with invalid UNHCR ID
                          </p>
                        )}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full bg-${getStatusColor(
                        selectedTab
                      )}-100 text-${getStatusColor(
                        selectedTab
                      )}-500 text-sm font-medium`}
                    >
                      {getStatusName(selectedTab)}
                    </div>
                  </CardHeader>
                  <CardBody>
                    <Table
                      aria-label={`Members with ${getStatusName(selectedTab)}`}
                    >
                      <TableHeader>
                        <TableColumn>NAME</TableColumn>
                        <TableColumn>UNHCR ID</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>NOTES</TableColumn>
                      </TableHeader>
                      <TableBody>{renderMembersTable()}</TableBody>
                    </Table>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default UNHCRStatusChart;
