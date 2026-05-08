import { useState } from "react";
import { CarCard } from "./components/CarCard";
import { FilterBar, MobileFilterButton } from "./components/FilterBar";
import { useFilters } from "./hooks/useFilters";
import { useListings } from "./hooks/useListings";

function App() {
	const { listings, loading, error, hide, remove } = useListings();
	const { filters, filtered, update } = useFilters(listings);
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
				<h1 className="text-lg font-semibold">Car Hunter</h1>
				<div className="flex items-center gap-2">
					{!loading && !error && (
						<span className="text-sm text-muted-foreground">
							{filtered.length} listing
							{filtered.length !== 1 ? "s" : ""}
						</span>
					)}
					<MobileFilterButton
						onOpen={() => setMobileFiltersOpen(true)}
					/>
				</div>
			</header>

			<FilterBar
				filters={filters}
				onChange={update}
				mobileOpen={mobileFiltersOpen}
				onMobileOpenChange={setMobileFiltersOpen}
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
					<div className="rounded-lg border overflow-hidden">
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
		</div>
	);
}

export default App;
