import { useListings } from "./hooks/useListings";

function App() {
	const { listings, loading, error } = useListings();

	if (loading)
		return <p className="p-4 text-muted-foreground">Loading listings…</p>;
	if (error) return <p className="p-4 text-destructive">Error: {error}</p>;

	return (
		<main className="p-4">
			<h1 className="text-2xl font-bold mb-2">Car Hunter</h1>
			<p className="text-muted-foreground">
				{listings.length} active listings
			</p>
		</main>
	);
}

export default App;
