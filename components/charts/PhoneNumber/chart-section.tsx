"use client";

import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import Chart from "react-apexcharts";
import { PhoneDataState } from "./types";

interface ChartSectionProps {
  phoneData: PhoneDataState;
  loading: boolean;
  totalMembers: number;
}

export const ChartSection = ({
  phoneData,
  loading,
  totalMembers,
}: ChartSectionProps) => {
  // Chart options for grouped bar chart
  const groupedBarOptions = {
    chart: {
      id: "phone-distribution",
      type: "bar" as const,
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
      categories: ["Has Phone Number", "Missing Phone Number"],
      labels: {
        style: {
          colors: "hsl(var(--nextui-default-800))",
        },
      },
    },
    yaxis: {
      title: {
        text: "Number of Tajneed",
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
    colors: ["#17C964", "#F31260"],
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
        formatter: (value: any) => value + " members",
      },
    },
  };

  // Data for grouped bar chart
  const groupedBarSeries = [
    {
      name: "Phone Status",
      data: [phoneData.hasPhone, phoneData.noPhone],
    },
  ];

  // Pie chart options
  const pieOptions = {
    chart: {
      id: "phone-pie",
      foreColor: "hsl(var(--nextui-default-800))",
      toolbar: {
        show: false,
      },
    },
    labels: ["Has Phone Number", "Missing Phone Number"],
    colors: ["#17C964", "#F31260"],
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

  // Data for pie chart
  const pieSeries = [phoneData.hasPhone, phoneData.noPhone];

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-success-50 shadow-md rounded-xl">
          <CardBody>
            <div className="text-center">
              <h5 className="text-lg font-semibold">Has Phone Number</h5>
              <p className="text-3xl font-bold text-success">
                {phoneData.hasPhone}
              </p>
              <p className="text-sm text-success-600">
                {totalMembers > 0
                  ? ((phoneData.hasPhone / totalMembers) * 100).toFixed(1) + "%"
                  : "0%"}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-danger-50 shadow-md rounded-xl">
          <CardBody>
            <div className="text-center">
              <h5 className="text-lg font-semibold">Missing Phone Number</h5>
              <p className="text-3xl font-bold text-danger">
                {phoneData.noPhone}
              </p>
              <p className="text-sm text-danger-600">
                {totalMembers > 0
                  ? ((phoneData.noPhone / totalMembers) * 100).toFixed(1) + "%"
                  : "0%"}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-default-50 shadow-md rounded-xl">
          <CardBody>
            <div className="text-center">
              <h5 className="text-lg font-semibold">Total Tajneed</h5>
              <p className="text-3xl font-bold">{totalMembers}</p>
              <p className="text-sm text-default-600">
                {phoneData.hasPhone > 0 && totalMembers > 0
                  ? "Phone coverage: " +
                    ((phoneData.hasPhone / totalMembers) * 100).toFixed(1) +
                    "%"
                  : "No phone numbers recorded"}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grouped Bar Chart */}
        <Card className="bg-default-50 shadow-lg rounded-2xl">
          <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
            <h4 className="font-bold text-xl">
              Phone Number Status Distribution
            </h4>
            <p className="text-default-500">
              Breakdown of tajneed with and without phone numbers
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
            <h4 className="font-bold text-xl">Phone Number Status Breakdown</h4>
            <p className="text-default-500">
              Percentage distribution of phone number availability
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
    </>
  );
};
