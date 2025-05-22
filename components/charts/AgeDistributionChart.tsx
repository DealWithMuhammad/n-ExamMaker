import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { db } from "@/app/api/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

interface AgeData {
  [age: number]: {
    count: number;
    khuddam: number;
    atfal: number;
  };
}

export const AgeDistributionChart = () => {
  const [ageData, setAgeData] = useState<AgeData>({});
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"all" | "khuddam" | "atfal">(
    "all"
  );

  useEffect(() => {
    const fetchAgeData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "formSubmissions"));

        // Initialize the age data object
        const ages: AgeData = {};

        // Process each document
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const dob = data.dateOfBirth;
          const tanzeemStatus = data.tanzeemStatus?.toLowerCase();

          if (dob) {
            // Parse the date of birth (assuming it's stored as a string like "YYYY-MM-DD")
            let birthDate;
            try {
              // Handle different date formats
              if (typeof dob === "string") {
                birthDate = new Date(dob);
              } else if (dob.toDate) {
                // Handle Firestore Timestamp
                birthDate = dob.toDate();
              }

              if (birthDate && !isNaN(birthDate.getTime())) {
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                // Adjust age if birthday hasn't occurred yet this year
                if (
                  monthDiff < 0 ||
                  (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ) {
                  age--;
                }

                // Initialize the age count if it doesn't exist
                if (!ages[age]) {
                  ages[age] = { count: 0, khuddam: 0, atfal: 0 };
                }

                // Increment the total count
                ages[age].count++;

                // Increment the tanzeem-specific count
                if (tanzeemStatus === "khuddam") {
                  ages[age].khuddam++;
                } else if (tanzeemStatus === "atfal") {
                  ages[age].atfal++;
                }
              }
            } catch (error) {
              console.error("Error parsing date:", error);
            }
          }
        });

        setAgeData(ages);
      } catch (error) {
        console.error("Error fetching age data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgeData();
  }, []);

  // Prepare data for the chart
  const prepareChartData = () => {
    // Sort ages in ascending order
    const sortedAges = Object.keys(ageData)
      .map(Number)
      .sort((a, b) => a - b);

    // Map data based on the active view
    const categories = sortedAges;
    let seriesData;

    if (activeView === "all") {
      seriesData = [
        {
          name: "Khuddam",
          data: sortedAges.map((age) => ageData[age].khuddam),
          color: "#0070F3",
        },
        {
          name: "Atfal",
          data: sortedAges.map((age) => ageData[age].atfal),
          color: "#F5A524",
        },
      ];
    } else if (activeView === "khuddam") {
      seriesData = [
        {
          name: "Khuddam",
          data: sortedAges.map((age) => ageData[age].khuddam),
          color: "#0070F3",
        },
      ];
    } else {
      seriesData = [
        {
          name: "Atfal",
          data: sortedAges.map((age) => ageData[age].atfal),
          color: "#F5A524",
        },
      ];
    }

    return { categories, seriesData };
  };

  // If data has been loaded, prepare chart data
  const chartData = !loading
    ? prepareChartData()
    : { categories: [], seriesData: [] };

  // Chart options
  const chartOptions = {
    chart: {
      id: "age-distribution",
      stacked: true,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      fontFamily: "inherit",
      background: "transparent",
      foreColor: "hsl(var(--nextui-default-800))",
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "70%",
        distributed: false,
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: chartData.seriesData.map((series) => series.color),
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val > 0 ? val : "";
      },
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        colors: ["#fff"],
      },
      background: {
        enabled: true,
        foreColor: "#000",
        padding: 4,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: "#fff",
        opacity: 0.7,
      },
    },
    xaxis: {
      categories: chartData.categories,
      title: {
        text: "Age (years)",
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
    legend: {
      position: "top" as "top",
      horizontalAlign: "center" as "center",
      fontSize: "14px",
      markers: {
        width: 12,
        height: 12,
        radius: 6,
      },
      onItemClick: {
        toggleDataSeries: false,
      },
      labels: {
        colors: "hsl(var(--nextui-default-800))",
      },
    },
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      y: {
        formatter: function (value: number) {
          return value + " members";
        },
      },
    },
    grid: {
      borderColor: "hsl(var(--nextui-default-200))",
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 400,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  // Render selector buttons for filtering view
  const renderViewSelectors = () => (
    <div className="flex mb-4 gap-2">
      <button
        onClick={() => setActiveView("all")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeView === "all"
            ? "bg-default-200 text-default-800"
            : "bg-default-100 text-default-600 hover:bg-default-200"
        }`}
      >
        All
      </button>
      <button
        onClick={() => setActiveView("khuddam")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeView === "khuddam"
            ? "bg-primary text-white"
            : "bg-default-100 text-default-600 hover:bg-default-200"
        }`}
      >
        Khuddam Only
      </button>
      <button
        onClick={() => setActiveView("atfal")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeView === "atfal"
            ? "bg-warning text-white"
            : "bg-default-100 text-default-600 hover:bg-default-200"
        }`}
      >
        Atfal Only
      </button>
    </div>
  );

  // Calculate summary statistics
  const calculateStats = () => {
    if (loading || Object.keys(ageData).length === 0) return null;

    const ages = Object.keys(ageData).map(Number);
    const members = ages.map((age) => ageData[age].count);
    const totalMembers = members.reduce((sum, count) => sum + count, 0);

    // Calculate average age
    const sumOfAges = ages.reduce(
      (sum, age, index) => sum + age * members[index],
      0
    );
    const avgAge = totalMembers > 0 ? (sumOfAges / totalMembers).toFixed(1) : 0;

    // Get min and max ages
    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);

    // Calculate most common age (mode)
    let modeAge = ages[0];
    let maxCount = members[0];

    ages.forEach((age, index) => {
      if (members[index] > maxCount) {
        maxCount = members[index];
        modeAge = age;
      }
    });

    // Get counts based on active view
    let viewSpecificCount = 0;
    if (activeView === "all") {
      viewSpecificCount = totalMembers;
    } else if (activeView === "khuddam") {
      viewSpecificCount = ages.reduce(
        (sum, age) => sum + ageData[age].khuddam,
        0
      );
    } else {
      viewSpecificCount = ages.reduce(
        (sum, age) => sum + ageData[age].atfal,
        0
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-default-50 p-3 rounded-xl shadow-sm">
          <div className="text-default-500 text-sm">Average Age</div>
          <div className="text-2xl font-bold">{avgAge} years</div>
        </div>
        <div className="bg-default-50 p-3 rounded-xl shadow-sm">
          <div className="text-default-500 text-sm">Age Range</div>
          <div className="text-2xl font-bold">
            {minAge}-{maxAge} years
          </div>
        </div>
        <div className="bg-default-50 p-3 rounded-xl shadow-sm">
          <div className="text-default-500 text-sm">Most Common Age</div>
          <div className="text-2xl font-bold">{modeAge} years</div>
        </div>
        <div className="bg-default-50 p-3 rounded-xl shadow-sm">
          <div className="text-default-500 text-sm">Total Members</div>
          <div className="text-2xl font-bold">{viewSpecificCount}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="pb-0 pt-2 px-0 flex-col items-start">
        <h4 className="font-bold text-xl">Age Distribution</h4>
        <p className="text-default-500">
          Age breakdown of tajneed by{" "}
          {activeView === "all" ? "tanzeem" : activeView}
        </p>
      </div>

      {!loading && renderViewSelectors()}
      {!loading && calculateStats()}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner color="primary" size="lg" />
        </div>
      ) : Object.keys(ageData).length > 0 ? (
        <Chart
          options={chartOptions}
          series={chartData.seriesData}
          type="bar"
          height={350}
        />
      ) : (
        <div className="flex justify-center items-center h-64 text-default-500">
          No age data available. Please ensure date of birth is recorded.
        </div>
      )}
    </div>
  );
};

export default AgeDistributionChart;
