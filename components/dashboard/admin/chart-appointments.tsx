"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Spinner } from "@/components/ui/spinner";

const chartConfig = {
  appointments: {
    label: "Appointments",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
  cancelled: {
    label: "Cancelled",
    color: "hsl(var(--destructive))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--warning))",
  },
} satisfies ChartConfig;

interface Appointment {
  id: string;
  appointmentDate: string;
  status: string;
}

interface ChartDataPoint {
  date: string;
  completed: number;
  cancelled: number;
  pending: number;
}

export function ChartAppointments() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Fetch appointments data
  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/appointments?role=admin");
        if (!response.ok) throw new Error("Failed to fetch appointments");

        const data = await response.json();
        const appointments: Appointment[] = data.appointments || [];

        // Process appointments into daily counts
        const dataMap = new Map<
          string,
          { completed: number; cancelled: number; pending: number }
        >();

        appointments.forEach((appointment) => {
          const date = new Date(appointment.appointmentDate)
            .toISOString()
            .split("T")[0];

          if (!dataMap.has(date)) {
            dataMap.set(date, { completed: 0, cancelled: 0, pending: 0 });
          }

          const counts = dataMap.get(date)!;

          if (appointment.status === "COMPLETED") {
            counts.completed++;
          } else if (appointment.status === "CANCELLED") {
            counts.cancelled++;
          } else if (
            appointment.status === "PENDING" ||
            appointment.status === "CONFIRMED"
          ) {
            counts.pending++;
          }
        });

        // Convert map to array and sort by date
        const chartDataPoints: ChartDataPoint[] = Array.from(dataMap.entries())
          .map(([date, counts]) => ({
            date,
            ...counts,
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        setChartData(chartDataPoints);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        // Set empty data on error
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredData = React.useMemo(() => {
    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return chartData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate && date <= now;
    });
  }, [chartData, timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Appointment Analytics</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Completed and cancelled appointments for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex h-[250px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Spinner className="size-6" />
              <p className="text-sm text-muted-foreground">
                Loading chart data...
              </p>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No appointment data available
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-completed)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-completed)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillCancelled" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-cancelled)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-cancelled)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="cancelled"
                type="natural"
                fill="url(#fillCancelled)"
                stroke="var(--color-cancelled)"
                stackId="a"
              />
              <Area
                dataKey="completed"
                type="natural"
                fill="url(#fillCompleted)"
                stroke="var(--color-completed)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
