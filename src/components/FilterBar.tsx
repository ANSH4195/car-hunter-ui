import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { Filters } from "@/hooks/useFilters";

const MAKES = [
	"Audi",
	"BMW",
	"Ford",
	"Jeep",
	"Mercedes-Benz",
	"Mitsubishi",
	"Skoda",
	"Volkswagen",
	"Volvo",
];

const SORT_OPTIONS = [
	{ value: "first_seen_desc", label: "Newest first" },
	{ value: "price_asc", label: "Price: low to high" },
	{ value: "price_desc", label: "Price: high to low" },
	{ value: "year_desc", label: "Year: newest" },
	{ value: "kms_asc", label: "KMs: lowest" },
];

type Props = {
	filters: Filters;
	onChange: (f: Partial<Filters>) => void;
	mobileOpen: boolean;
	onMobileOpenChange: (open: boolean) => void;
};

function FilterControls({
	filters,
	onChange,
}: {
	filters: Filters;
	onChange: (f: Partial<Filters>) => void;
}) {
	return (
		<>
			<Select
				value={filters.make ?? "all"}
				onValueChange={(v) =>
					onChange({ make: v === "all" ? null : v })
				}
			>
				<SelectTrigger className="w-36 shrink-0">
					<SelectValue placeholder="All Makes" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Makes</SelectItem>
					{MAKES.map((m) => (
						<SelectItem key={m} value={m}>
							{m}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={filters.minYear?.toString() ?? "all"}
				onValueChange={(v) =>
					onChange({ minYear: v === "all" ? null : Number(v) })
				}
			>
				<SelectTrigger className="w-28 shrink-0">
					<SelectValue placeholder="Min Year" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">Any Year</SelectItem>
					{[2019, 2020, 2021, 2022, 2023, 2024].map((y) => (
						<SelectItem key={y} value={y.toString()}>
							{y}+
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={filters.maxKms?.toString() ?? "all"}
				onValueChange={(v) =>
					onChange({ maxKms: v === "all" ? null : Number(v) })
				}
			>
				<SelectTrigger className="w-32 shrink-0">
					<SelectValue placeholder="Max KMs" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">Any KMs</SelectItem>
					{[30000, 50000, 75000, 100000, 125000, 150000].map((k) => (
						<SelectItem key={k} value={k.toString()}>
							≤{(k / 1000).toFixed(0)}k km
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={filters.sort}
				onValueChange={(v) => onChange({ sort: v as Filters["sort"] })}
			>
				<SelectTrigger className="w-44 shrink-0">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{SORT_OPTIONS.map((o) => (
						<SelectItem key={o.value} value={o.value}>
							{o.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>
	);
}

export function FilterBar({
	filters,
	onChange,
	mobileOpen,
	onMobileOpenChange,
}: Props) {
	return (
		<>
			{/* Desktop: horizontally scrollable pill bar */}
			<div className="hidden md:flex items-center gap-2 overflow-x-auto px-4 py-2 border-b scrollbar-none">
				<FilterControls filters={filters} onChange={onChange} />
			</div>

			{/* Mobile: hamburger + Sheet */}
			<div className="flex md:hidden items-center justify-between px-4 py-2 border-b">
				<span className="text-sm text-muted-foreground">
					Tap to filter
				</span>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => onMobileOpenChange(true)}
					aria-label="Open filters"
				>
					<Menu />
				</Button>
			</div>

			<Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
				<SheetContent side="right" className="flex flex-col gap-4 pt-8">
					<SheetTitle>Filters</SheetTitle>
					<FilterControls filters={filters} onChange={onChange} />
				</SheetContent>
			</Sheet>
		</>
	);
}
