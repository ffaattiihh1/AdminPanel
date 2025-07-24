import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function PerformanceChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"],
        datasets: [
          {
            label: "Tamamlanan Anketler",
            data: [45, 52, 38, 71, 63, 89, 76],
            borderColor: "#0891b2",
            backgroundColor: "rgba(8, 145, 178, 0.1)",
            tension: 0.4,
            fill: true,
          },
          {
            label: "Yeni Katılımcılar",
            data: [28, 35, 42, 48, 55, 67, 72],
            borderColor: "#059669",
            backgroundColor: "rgba(5, 150, 105, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom" as const,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return <canvas ref={chartRef} className="w-full h-64" />;
}
