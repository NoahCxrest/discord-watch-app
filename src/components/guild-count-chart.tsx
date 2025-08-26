"use client";

import React from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Calendar, ChevronDown } from "lucide-react";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type GuildData = {
  date: string;
  guildCount: number;
};

type TimePeriod = {
  value: string;
  label: string;
  limit: number;
  hours: number;
};

type GuildCountChartProps = {
  botId: string;
  initialData?: GuildData[];
  defaultPeriod?: string;
};

const TIME_PERIODS: TimePeriod[] = [
  { value: "1h", label: "Last Hour", limit: 12, hours: 1 },
  { value: "6h", label: "Last 6 Hours", limit: 24, hours: 6 },
  { value: "24h", label: "Last 24 Hours", limit: 48, hours: 24 },
  { value: "3d", label: "Last 3 Days", limit: 72, hours: 72 },
  { value: "7d", label: "Last 7 Days", limit: 168, hours: 168 },
  { value: "30d", label: "Last 30 Days", limit: 720, hours: 720 },
];

const DEFAULT_PERIOD = TIME_PERIODS[2]; // 24h

const CHART_CONFIG = {
  guildCount: {
    label: "Guild Count",
    color: "var(--chart-1)",
  },
};

const formatDate = (value: string, period: TimePeriod): string => {
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    
    // Show different formats based on time period
    if (period.hours <= 24) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } else if (period.hours <= 168) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        hour12: true,
      }).format(date);
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
    }
  } catch {
    return value;
  }
};

const formatTooltipDate = (value: string): string => {
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return value;
  }
};

const validateAndCleanData = (data: unknown): GuildData[] => {
  if (!Array.isArray(data)) return [];

  return data
    .filter((item): item is GuildData => {
      return (
        item &&
        typeof item === "object" &&
        typeof item.date === "string" &&
        typeof item.guildCount === "number" &&
        !isNaN(item.guildCount)
      );
    })
    .map((item) => ({
      date: item.date,
      guildCount: Math.max(0, item.guildCount),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const findTimePeriod = (value: string): TimePeriod => {
  const found = TIME_PERIODS.find(p => p.value === value);
  //@ts-ignore
  return found || DEFAULT_PERIOD;
};

const LoadingState = () => (
  <div className="min-h-[250px] flex items-center justify-center">
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      Loading chart data...
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="min-h-[250px] flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-500 font-medium mb-1">Failed to load data</div>
      <div className="text-sm text-muted-foreground">{message}</div>
    </div>
  </div>
);

const NoDataState = ({ 
  period, 
  rawData, 
  filteredData 
}: { 
  period: TimePeriod;
  rawData: unknown; 
  filteredData: GuildData[] 
}) => (
  <div className="min-h-[250px] flex flex-col items-center justify-center text-muted-foreground">
    <Calendar className="w-12 h-12 mb-3 opacity-50" />
    <div className="text-lg font-medium mb-1">No Data Available</div>
    <div className="text-sm text-center max-w-sm">
      No valid guild count data found for {period.label.toLowerCase()}.
    </div>
    {process.env.NODE_ENV === "development" && (
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer hover:text-foreground">Debug Info (Dev Only)</summary>
        <pre className="mt-2 p-3 bg-muted rounded-md whitespace-pre-wrap max-w-full overflow-auto text-left">
          {JSON.stringify({ rawData, filteredData, period }, null, 2)}
        </pre>
      </details>
    )}
  </div>
);

const ChartComponent = ({ data, period }: { data: GuildData[]; period: TimePeriod }) => (
  <div className="transition-all duration-300 ease-in-out">
    <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillGuildCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-guildCount)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-guildCount)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-30" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={period.hours <= 24 ? 20 : 32}
            tickFormatter={(value) => formatDate(value, period)}
            className="text-xs"
          />
          <YAxis
            domain={["dataMin", "dataMax"]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs"
          />
          <ChartTooltip
            cursor={{
              stroke: "var(--color-guildCount)",
              strokeWidth: 1,
              strokeDasharray: "3 3",
              opacity: 0.7,
            }}
            content={
              <ChartTooltipContent
                labelFormatter={formatTooltipDate}
                indicator="dot"
                className="border shadow-lg"
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
            className="transition-all duration-300"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  </div>
);

const TimeSelector = ({ 
  selectedPeriod, 
  onPeriodChange, 
  isLoading 
}: { 
  selectedPeriod: string; 
  onPeriodChange: (value: string) => void;
  isLoading: boolean;
}) => (
  <Select value={selectedPeriod} onValueChange={onPeriodChange} disabled={isLoading}>
    <SelectTrigger className="w-[160px] h-8 text-sm">
      <Calendar className="w-4 h-4 mr-2 opacity-70" />
      <SelectValue />
      <ChevronDown className="w-4 h-4 ml-auto opacity-50" />
    </SelectTrigger>
    <SelectContent align="end" className="min-w-[160px]">
      {TIME_PERIODS.map((period) => (
        <SelectItem 
          key={period.value} 
          value={period.value}
          className="text-sm"
        >
          {period.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

type StatsCalculation = {
  currentCount: number;
  previousCount: number;
  change: number;
  changePercent: number;
};

const calculateStats = (data: GuildData[]): StatsCalculation => {
  if (data.length === 0) {
    return { currentCount: 0, previousCount: 0, change: 0, changePercent: 0 };
  }

  const currentCount = data[data.length - 1]?.guildCount ?? 0;
  const previousCount = data.length > 1 ? (data[data.length - 2]?.guildCount ?? currentCount) : currentCount;
  const change = currentCount - previousCount;
  const changePercent = previousCount > 0 ? ((change / previousCount) * 100) : 0;

  return { currentCount, previousCount, change, changePercent };
};

export function GuildCountChart({ 
  botId, 
  initialData, 
  defaultPeriod = "24h" 
}: GuildCountChartProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState(defaultPeriod);
  
  const currentPeriod = findTimePeriod(selectedPeriod);
  
  const { data, isLoading, error, isFetching } = api.guildCount.history.useQuery(
    { botId, limit: currentPeriod.limit },
    { 
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000, // Refetch every minute for live updates
    }
  );

  const chartData = data; // Always use fresh data from tRPC
  const cleanedData = React.useMemo(() => validateAndCleanData(chartData), [chartData]);
  const stats = React.useMemo(() => calculateStats(cleanedData), [cleanedData]);

  const handlePeriodChange = React.useCallback((value: string) => {
    setSelectedPeriod(value);
  }, []);

  const renderContent = () => {
    if (error) {
      return <ErrorState message={error.message} />;
    }

    if (isLoading && !data) {
      return <LoadingState />;
    }

    if (cleanedData.length === 0) {
      return (
        <NoDataState 
          period={currentPeriod}
          rawData={data} 
          filteredData={cleanedData} 
        />
      );
    }

    return <ChartComponent data={cleanedData} period={currentPeriod} />;
  };

  const isDataLoading = isLoading || isFetching;

  return (
    <Card className="pt-0 transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-lg font-semibold">Guild Count</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span>Showing {currentPeriod.label.toLowerCase()}</span>
            {cleanedData.length > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="font-medium">{stats.currentCount.toLocaleString()} guilds</span>
                {stats.change !== 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    stats.change > 0 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {stats.change > 0 ? '+' : ''}{stats.change} ({stats.changePercent > 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%)
                  </span>
                )}
              </>
            )}
          </CardDescription>
        </div>
        <TimeSelector 
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          isLoading={isDataLoading}
        />
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="relative">
          {isFetching && data && (
            <div className="absolute top-2 right-2 z-10">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin opacity-70" />
            </div>
          )}
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
}