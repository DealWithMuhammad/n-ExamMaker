import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { db } from "@/app/api/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export const TanzeemChart = () => {
  const [tanzeemData, setTanzeemData] = useState<{
    khuddam: number;
    atfal: number;
  }>({ khuddam: 0, atfal: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTanzeemData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "formSubmissions"));

        const results = {
          khuddam: 0,
          atfal: 0,
        };

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const tanzeemStatus = data.tanzeemStatus?.toLowerCase();

          if (tanzeemStatus === "khuddam") {
            results.khuddam += 1;
          } else if (tanzeemStatus === "atfal") {
            results.atfal += 1;
          }
        });

        setTanzeemData(results);
      } catch (error) {
        console.error("Error fetching tanzeem data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTanzeemData();
  }, []);

  // Chart options for pie chart
  const pieOptions = {
    chart: {
      id: "tanzeem-distribution",
      foreColor: "hsl(var(--nextui-default-800))",
      toolbar: {
        show: false,
      },
    },
    labels: ["Khuddam", "Atfal"],
    colors: ["#0070F3", "#F5A524"], // Primary blue for Khuddam, warning orange for Atfal
    legend: {
      position: "bottom" as "bottom",
      fontSize: "14px",
      labels: {
        colors: "hsl(var(--nextui-default-800))",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
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
        formatter: function (value: number) {
          return value + " members";
        },
      },
    },
  };

  // Chart options for bar chart
  const barOptions = {
    chart: {
      id: "tanzeem-bar",
      foreColor: "hsl(var(--nextui-default-800))",
      toolbar: {
        show: false,
      },
    },

    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: "40%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#0070F3", "#F5A524"],
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
    grid: {
      borderColor: "hsl(var(--nextui-default-200))",
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: function (value: number) {
          return value + " members";
        },
      },
    },
  };

  // Data for charts
  const pieSeries = [tanzeemData.khuddam, tanzeemData.atfal];
  const barSeries = [
    {
      name: "Members",
      data: [tanzeemData.khuddam, tanzeemData.atfal],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card className="bg-default-50 shadow-lg rounded-2xl">
        <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
          <h4 className="font-bold text-xl">Tanzeem Distribution</h4>
          <p className="text-default-500">
            Distribution between Khuddam and Atfal
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

      {/* Bar Chart */}
      <Card className="bg-default-50 shadow-lg rounded-2xl">
        <CardHeader className="pb-0 pt-4 px-6 flex-col items-start">
          <h4 className="font-bold text-xl">Tanzeem Comparison</h4>
          <p className="text-default-500">Number of members by tanzeem type</p>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="primary" size="lg" />
            </div>
          ) : (
            <Chart
              options={barOptions}
              series={barSeries}
              type="bar"
              height={300}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default TanzeemChart;
