"use client";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../../../components/ui/chart";
import React from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";


// Accept initialData as a prop
type GuildCountChartProps = {
  botId: string;
  initialData?: Array<{ date: string; guildCount: number }>;
};

export function GuildCountChart({ botId, initialData }: GuildCountChartProps) {
  // If initialData is provided, skip fetching by default
  const shouldFetch = !initialData;
  const { data, isLoading, error } = api.guildCount.history.useQuery(
    { botId, limit: 24 },
    { enabled: shouldFetch }
  );

  // Chart config
  const chartConfig = {
    guildCount: {
      label: "Guild Count",
      color: "var(--chart-1)",
    },
  };

  // More robust data filtering and validation
  // Use initialData if provided, otherwise use fetched data
  const chartRawData = initialData ?? data;

  const safeData = React.useMemo(() => {
    if (!chartRawData || !Array.isArray(chartRawData)) {
      return [];
    }

    return chartRawData
      .filter((item) => {
        // More thorough validation
        if (!item || typeof item !== "object") return false;
        if (!item.date || !item.guildCount) return false;
        if (typeof item.date !== "string") return false;
        if (typeof item.guildCount !== "number" || isNaN(item.guildCount)) return false;
        return true;
      })
      .map((item) => ({
        // Ensure consistent data structure
        date: item.date,
        guildCount: Math.max(0, item.guildCount), // Ensure non-negative values
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
  }, [chartRawData]);

  // Error handling
  if (error) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Guild Count - Area Chart</CardTitle>
            <CardDescription>Error loading data</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="min-h-[200px] flex items-center justify-center text-red-500">
            Failed to load guild count data: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Guild Count - Area Chart</CardTitle>
          <CardDescription>
            Showing total guilds for the last 24 hours
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
  {isLoading && !initialData ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="animate-pulse">Loading chart data...</div>
          </div>
        ) : safeData.length === 0 ? (
          <div className="min-h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <div className="text-lg mb-2">No Data Available</div>
            <div className="text-sm">No valid guild count data found for the selected period.</div>
            {/* Remove debug JSON in production */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-xs">
                <summary>Debug Info (Dev Only)</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded whitespace-pre-wrap max-w-full overflow-auto">
                  {JSON.stringify({ rawData: data, filteredData: safeData }, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={safeData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillGuildCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-guildCount)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-guildCount)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    try {
                      const date = new Date(value);
                      if (isNaN(date.getTime())) return value;
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    } catch (e) {
                      return value;
                    }
                  }}
                />
                <YAxis 
                  domain={['dataMin', 'dataMax']}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={{ stroke: 'var(--color-guildCount)', strokeWidth: 1, strokeDasharray: '3 3' }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        try {
                          const date = new Date(value);
                          if (isNaN(date.getTime())) return value;
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        } catch (e) {
                          return value;
                        }
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="guildCount"
                  type="monotone"
                  fill="url(#fillGuildCount)"
                  stroke="var(--color-guildCount)"
                  strokeWidth={2}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}