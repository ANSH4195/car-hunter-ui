import { Menu, SlidersHorizontal, X } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTitle,
} from "@/components/ui/sheet";
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
	onReset: () => void;
	mobileOpen: boolean;
	onMobileOpenChange: (open: boolean) => void;
	states: string[];
};

function FilterControls({
	filters,
	onChange,
	showLabels = false,
	states,
}: {
	filters: Filters;
	onChange: (f: Partial<Filters>) => void;
	showLabels?: boolean;
	states: string[];
}) {
	const tw = (fixed: string) => (showLabels ? "w-full" : `${fixed} shrink-0`);

	const wrap = (label: string, el: React.ReactNode) =>
		showLabels ? (
			<div className="flex flex-col gap-1.5">
				<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
					{label}
				</span>
				{el}
			</div>
		) : (
			el
		);

	return (
		<>
			{wrap(
				"Make",
				<Select
					value={filters.make ?? "all"}
					onValueChange={(v) =>
						onChange({ make: v === "all" ? null : v })
					}
				>
					<SelectTrigger className={tw("w-36")}>
						<SelectValue>{filters.make ?? "All Makes"}</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Makes</SelectItem>
						{MAKES.map((m) => (
							<SelectItem key={m} value={m}>
								{m}
							</SelectItem>
						))}
					</SelectContent>
				</Select>,
			)}

			{wrap(
				"State",
				<Select
					value={filters.state ?? "all"}
					onValueChange={(v) =>
						onChange({ state: v === "all" ? null : v })
					}
				>
					<SelectTrigger className={tw("w-36")}>
						<SelectValue>
							{filters.state ?? "All States"}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All States</SelectItem>
						{states.map((s) => (
							<SelectItem key={s} value={s}>
								{s}
							</SelectItem>
						))}
					</SelectContent>
				</Select>,
			)}

			{wrap(
				"Min Year",
				<Select
					value={filters.minYear?.toString() ?? "all"}
					onValueChange={(v) =>
						onChange({ minYear: v === "all" ? null : Number(v) })
					}
				>
					<SelectTrigger className={tw("w-28")}>
						<SelectValue>
							{filters.minYear
								? `${filters.minYear}+`
								: "Any Year"}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Any Year</SelectItem>
						{[2018, 2019, 2020, 2021, 2022, 2023, 2024].map((y) => (
							<SelectItem key={y} value={y.toString()}>
								{y}+
							</SelectItem>
						))}
					</SelectContent>
				</Select>,
			)}

			{wrap(
				"Max KMs",
				<Select
					value={filters.maxKms?.toString() ?? "all"}
					onValueChange={(v) =>
						onChange({ maxKms: v === "all" ? null : Number(v) })
					}
				>
					<SelectTrigger className={tw("w-36")}>
						<SelectValue>
							{filters.maxKms
								? `Under ${filters.maxKms / 1000}K`
								: "Any KMs"}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Any KMs</SelectItem>
						{[25000, 50000, 75000, 100000, 125000].map((k) => (
							<SelectItem key={k} value={k.toString()}>
								Under {k / 1000}K
							</SelectItem>
						))}
					</SelectContent>
				</Select>,
			)}

			{wrap(
				"Sort",
				<Select
					value={filters.sort}
					onValueChange={(v) =>
						onChange({ sort: v as Filters["sort"] })
					}
				>
					<SelectTrigger className={tw("w-44")}>
						<SelectValue>
							{
								SORT_OPTIONS.find(
									(o) => o.value === filters.sort,
								)?.label
							}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{SORT_OPTIONS.map((o) => (
							<SelectItem key={o.value} value={o.value}>
								{o.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>,
			)}
		</>
	);
}

export function MobileFilterButton({ onOpen }: { onOpen: () => void }) {
	return (
		<Button
			variant="ghost"
			size="icon-sm"
			onClick={onOpen}
			aria-label="Open filters"
			className="md:hidden"
		>
			<SlidersHorizontal />
		</Button>
	);
}

export function NavButton({ onOpen }: { onOpen: () => void }) {
	return (
		<Button
			variant="ghost"
			size="icon-sm"
			onClick={onOpen}
			aria-label="Open navigation"
			className="md:hidden"
		>
			<Menu />
		</Button>
	);
}

export function FilterBar({
	filters,
	onChange,
	onReset,
	mobileOpen,
	onMobileOpenChange,
	states,
}: Props) {
	return (
		<>
			{/* Desktop: horizontally scrollable pill bar */}
			<div className="hidden md:flex items-center gap-2 overflow-x-auto px-4 py-2 border-b scrollbar-none">
				<FilterControls
					filters={filters}
					onChange={onChange}
					states={states}
				/>
			</div>

			<Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
				<SheetContent
					side="right"
					showCloseButton={false}
					className="flex flex-col gap-0 px-0 pt-0"
				>
					<div className="flex items-center justify-between px-4 py-3">
						<SheetTitle>Filters</SheetTitle>
						<SheetClose
							render={
								<Button
									variant="ghost"
									size="icon-sm"
									aria-label="Close filters"
								/>
							}
						>
							<X />
						</SheetClose>
					</div>
					<hr className="border-border" />
					<div className="flex flex-col gap-4 px-4 pt-4 flex-1">
						<FilterControls
							filters={filters}
							onChange={onChange}
							showLabels
							states={states}
						/>
					</div>
					<div className="px-4 py-4 border-t mt-auto">
						<Button
							variant="outline"
							className="w-full"
							onClick={onReset}
						>
							Reset filters
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
