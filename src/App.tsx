import { useState } from "react";
import { CarCard } from "./components/CarCard";
import { FilterBar, MobileFilterButton, NavButton } from "./components/FilterBar";
import { useFilters } from "./hooks/useFilters";
import { useHiddenListings, useListings } from "./hooks/useListings";
import { Sheet, SheetContent, SheetTitle } from "./components/ui/sheet";
import { Button } from "./components/ui/button";
import { EyeOff, List } from "lucide-react";

type View = "active" | "hidden";

function NavDrawer({
	open,
	onOpenChange,
	currentView,
	onViewChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentView: View;
	onViewChange: (view: View) => void;
}) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="left" className="w-64 px-0 pt-0">
				<div className="px-4 py-3 border-b">
					<SheetTitle>Car Hunter</SheetTitle>
				</div>
				<nav className="flex flex-col py-2">
					<Button
						variant="ghost"
						className={`justify-start gap-3 rounded-none px-4 h-11${currentView === "active" ? " bg-muted" : ""}`}
						onClick={() => { onViewChange("active"); onOpenChange(false); }}
					>
						<List size={16} />
						Active Listings
					</Button>
					<Button
						variant="ghost"
						className={`justify-start gap-3 rounded-none px-4 h-11${currentView === "hidden" ? " bg-muted" : ""}`}
						onClick={() => { onViewChange("hidden"); onOpenChange(false); }}
					>
						<EyeOff size={16} />
						Uninterested
					</Button>
				</nav>
			</SheetContent>
		</Sheet>
	);
}

function HiddenView() {
	const { listings, loading, error, restore } = useHiddenListings();

	return (
		<main className="p-4">
			{loading && <p className="text-muted-foreground">Loading…</p>}
			{error && <p className="text-destructive">Error: {error}</p>}
			{!loading && !error && listings.length === 0 && (
				<p className="text-muted-foreground">No uninterested listings.</p>
			)}
			{!loading && !error && listings.length > 0 && (
				<div className="overflow-hidden">
					{listings.map((listing) => (
						<CarCard
							key={listing.id}
							listing={listing}
							onRestore={restore}
						/>
					))}
				</div>
			)}
		</main>
	);
}

function App() {
	const { listings, loading, error, hide, remove } = useListings();
	const { filters, filtered, update, reset } = useFilters(listings);
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
	const [navOpen, setNavOpen] = useState(false);
	const [view, setView] = useState<View>("active");

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<NavButton onOpen={() => setNavOpen(true)} />
					<h1 className="text-lg font-semibold">Car Hunter</h1>
				</div>
				<div className="flex items-center gap-2">
					{view === "active" && !loading && !error && (
						<span className="text-sm text-muted-foreground">
							{filtered.length} listing
							{filtered.length !== 1 ? "s" : ""}
						</span>
					)}
					{view === "active" && (
						<MobileFilterButton
							onOpen={() => setMobileFiltersOpen(true)}
						/>
					)}
				</div>
			</header>

			<NavDrawer
				open={navOpen}
				onOpenChange={setNavOpen}
				currentView={view}
				onViewChange={setView}
			/>

			{view === "active" && (
				<>
					<FilterBar
						filters={filters}
						onChange={update}
						onReset={reset}
						mobileOpen={mobileFiltersOpen}
						onMobileOpenChange={setMobileFiltersOpen}
						states={[...new Set(listings.map((l) => l.state).filter(Boolean) as string[])].sort()}
					/>

					<main className="p-4">
						{loading && (
							<p className="text-muted-foreground">Loading listings…</p>
						)}
						{error && <p className="text-destructive">Error: {error}</p>}
						{!loading && !error && filtered.length === 0 && (
							<p className="text-muted-foreground">
								No listings match your filters.
							</p>
						)}
						{!loading && !error && filtered.length > 0 && (
							<div className="overflow-hidden">
								{filtered.map((listing) => (
									<CarCard
										key={listing.id}
										listing={listing}
										onHide={hide}
										onRemove={remove}
									/>
								))}
							</div>
						)}
					</main>
				</>
			)}

			{view === "hidden" && <HiddenView />}
		</div>
	);
}

export default App;
