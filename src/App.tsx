import { CarCard } from "./components/CarCard";
import { useListings } from "./hooks/useListings";

function App() {
	const { listings, loading, error, hide, remove } = useListings();

	if (loading)
		return <p className="p-4 text-muted-foreground">Loading listings…</p>;
	if (error) return <p className="p-4 text-destructive">Error: {error}</p>;

	return (
		<main className="p-4">
			<h1 className="text-2xl font-bold mb-4">Car Hunter</h1>
			{listings.length === 0 ? (
				<p className="text-muted-foreground">No active listings.</p>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{listings.map((listing) => (
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
	);
}

export default App;
