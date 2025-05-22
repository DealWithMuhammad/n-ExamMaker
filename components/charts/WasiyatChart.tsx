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
} from "@nextui-org/react";
import { db } from "@/app/api/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

interface MemberWithWasiyat {
  name: string;
  wasiatNumber: string;
  id: string;
}

interface MemberWithoutWasiyat {
  name: string;
  id: string;
}

interface WasiyatDataState {
  khuddam: { hasWasiyat: number; noWasiyat: number };
  atfal: { hasWasiyat: number; noWasiyat: number };
}

interface MembersListState {
  khuddam: {
    withWasiyat: MemberWithWasiyat[];
    withoutWasiyat: MemberWithoutWasiyat[];
  };
  atfal: {
    withWasiyat: MemberWithWasiyat[];
    withoutWasiyat: MemberWithoutWasiyat[];
  };
}

export const WasiyatChart = () => {
  const [wasiyatData, setWasiyatData] = useState<WasiyatDataState>({
    khuddam: { hasWasiyat: 0, noWasiyat: 0 },
    atfal: { hasWasiyat: 0, noWasiyat: 0 },
  });
  const [membersList, setMembersList] = useState<MembersListState>({
    khuddam: { withWasiyat: [], withoutWasiyat: [] },
    atfal: { withWasiyat: [], withoutWasiyat: [] },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWasiyatData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "formSubmissions"));

        const results = {
          khuddam: { hasWasiyat: 0, noWasiyat: 0 },
          atfal: { hasWasiyat: 0, noWasiyat: 0 },
        };

        const members: MembersListState = {
          khuddam: { withWasiyat: [], withoutWasiyat: [] },
          atfal: { withWasiyat: [], withoutWasiyat: [] },
        };

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const tanzeemStatus = data.tanzeemStatus?.toLowerCase() || "";
          const wasiatNumber = String(data.wasiatNumber || "").trim();
          const memberName = data.name || "Unknown";

          // Improved check for valid wasiyat number
          const hasWasiyat =
            wasiatNumber !== "" &&
            wasiatNumber !== "000" &&
            wasiatNumber !== "00" &&
            wasiatNumber !== "No." &&
            wasiatNumber !== "None" &&
            wasiatNumber.toLowerCase() !== "no" &&
            wasiatNumber.toLowerCase() !== "null" &&
            wasiatNumber.toLowerCase() !== "undefined" &&
            wasiatNumber !== "0";

          if (tanzeemStatus === "khuddam") {
            if (hasWasiyat) {
              results.khuddam.hasWasiyat += 1;
              members.khuddam.withWasiyat.push({
                name: memberName,
                wasiatNumber,
                id: doc.id,
              });
            } else {
              results.khuddam.noWasiyat += 1;
              members.khuddam.withoutWasiyat.push({
                name: memberName,
                id: doc.id,
              });
            }
          } else if (tanzeemStatus === "atfal") {
            if (hasWasiyat) {
              results.atfal.hasWasiyat += 1;
              members.atfal.withWasiyat.push({
                name: memberName,
                wasiatNumber,
                id: doc.id,
              });
            } else {
              results.atfal.noWasiyat += 1;
              members.atfal.withoutWasiyat.push({
                name: memberName,
                id: doc.id,
              });
            }
          }
        });

        setWasiyatData(results);
        setMembersList(members);
      } catch (error) {
        console.error("Error fetching wasiyat data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWasiyatData();
  }, []);

  // Chart options for grouped bar chart
  const groupedBarOptions = {
    chart: {
      id: "wasiyat-distribution",
      type: "bar" as "bar",
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
      position: "bottom" as "bottom",
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
        formatter: function (value: any) {
          return value + " members";
        },
      },
    },
  };

  // Data for grouped bar chart
  const groupedBarSeries = [
    {
      name: "Has Wasiyat",
      data: [wasiyatData.khuddam.hasWasiyat, wasiyatData.atfal.hasWasiyat],
    },
    {
      name: "No Wasiyat",
      data: [wasiyatData.khuddam.noWasiyat, wasiyatData.atfal.noWasiyat],
    },
  ];

  // Pie chart options
  const pieOptions = {
    chart: {
      id: "wasiyat-pie",
      foreColor: "hsl(var(--nextui-default-800))",
      toolbar: {
        show: false,
      },
    },
    labels: [
      "Khuddam with Wasiyat",
      "Khuddam without Wasiyat",
      "Atfal with Wasiyat",
      "Atfal without Wasiyat",
    ],
    colors: ["#0070F3", "#7928CA", "#F5A524", "#F31260"],
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
    wasiyatData.khuddam.hasWasiyat,
    wasiyatData.khuddam.noWasiyat,
    wasiyatData.atfal.hasWasiyat,
    wasiyatData.atfal.noWasiyat,
  ];

  // Total counts for summary
  const totalWithWasiyat =
    wasiyatData.khuddam.hasWasiyat + wasiyatData.atfal.hasWasiyat;
  const totalWithoutWasiyat =
    wasiyatData.khuddam.noWasiyat + wasiyatData.atfal.noWasiyat;
  const grandTotal = totalWithWasiyat + totalWithoutWasiyat;

  // Render functions for table content
  const renderAtfalWithWasiyat = () => {
    if (membersList.atfal.withWasiyat.length === 0) {
      return (
        <TableRow key="no-atfal">
          <TableCell>No Atfal with Wasiyat found</TableCell>
          <TableCell>-</TableCell>
        </TableRow>
      );
    }

    return membersList.atfal.withWasiyat.map((member) => (
      <TableRow key={member.id}>
        <TableCell>{member.name}</TableCell>
        <TableCell>{member.wasiatNumber}</TableCell>
      </TableRow>
    ));
  };

  const renderKhuddamWithWasiyat = () => {
    if (membersList.khuddam.withWasiyat.length === 0) {
      return (
        <TableRow key="no-khuddam">
          <TableCell>No Khuddam with Wasiyat found</TableCell>
          <TableCell>-</TableCell>
        </TableRow>
      );
    }

    return membersList.khuddam.withWasiyat.map((member) => (
      <TableRow key={member.id}>
        <TableCell>{member.name}</TableCell>
        <TableCell>{member.wasiatNumber}</TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary-50 shadow-md rounded-xl">
          <CardBody>
            <div className="text-center">
              <h5 className="text-lg font-semibold">With Wasiyat</h5>
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
              <h5 className="text-lg font-semibold">Without Wasiyat</h5>
              <p className="text-3xl font-bold text-danger">
                {totalWithoutWasiyat}
              </p>
              <p className="text-sm text-danger-600">
                {grandTotal > 0
                  ? ((totalWithoutWasiyat / grandTotal) * 100).toFixed(1) + "%"
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grouped Bar Chart */}
        <Card className="bg-default-50 shadow-lg rounded-2xl">
          <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
            <h4 className="font-bold text-xl">Wasiyat Distribution</h4>
            <p className="text-default-500">
              Comparison of tajneed with and without Wasiyat
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
                height={300}
              />
            )}
          </CardBody>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-default-50 shadow-lg rounded-2xl">
          <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
            <h4 className="font-bold text-xl">Wasiyat Breakdown</h4>
            <p className="text-default-500">
              Detailed breakdown of Wasiyat status by Tanzeem
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
                height={300}
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Members List Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atfal with Wasiyat */}
        <Card className=" shadow-lg rounded-2xl">
          <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
            <h4 className="font-bold text-xl">Atfal with Wasiyat</h4>
            <p className="text-default-500">
              {membersList.atfal.withWasiyat.length} members
            </p>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner color="primary" size="lg" />
              </div>
            ) : (
              <Table aria-label="Atfal with Wasiyat">
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>WASIYAT NUMBER</TableColumn>
                </TableHeader>
                <TableBody>{renderAtfalWithWasiyat()}</TableBody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Khuddam with Wasiyat */}
        <Card className=" shadow-lg rounded-2xl">
          <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
            <h4 className="font-bold text-xl">Khuddam with Wasiyat</h4>
            <p className="text-default-500">
              {membersList.khuddam.withWasiyat.length} members
            </p>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner color="primary" size="lg" />
              </div>
            ) : (
              <Table aria-label="Khuddam with Wasiyat">
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>WASIYAT NUMBER</TableColumn>
                </TableHeader>
                <TableBody>{renderKhuddamWithWasiyat()}</TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default WasiyatChart;
