import { useMemo, useState } from "react";
import type { Listing } from "./useListings";

export type SortKey =
	| "first_seen_desc"
	| "price_asc"
	| "price_desc"
	| "year_desc"
	| "kms_asc";

export type Filters = {
	make: string | null;
	minYear: number | null;
	maxKms: number | null;
	sort: SortKey;
};

const DEFAULT_FILTERS: Filters = {
	make: null,
	minYear: null,
	maxKms: null,
	sort: "first_seen_desc",
};

export function useFilters(listings: Listing[]) {
	const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

	const filtered = useMemo(() => {
		let result = listings;

		if (filters.make) {
			const make = filters.make;
			result = result.filter(
				(l) => l.make.toLowerCase() === make.toLowerCase(),
			);
		}
		if (filters.minYear) {
			const minYear = filters.minYear;
			result = result.filter((l) => (l.year ?? 0) >= minYear);
		}
		if (filters.maxKms) {
			const maxKms = filters.maxKms;
			result = result.filter((l) => (l.kms ?? Infinity) <= maxKms);
		}

		return [...result].sort((a, b) => {
			switch (filters.sort) {
				case "price_asc":
					return (a.price ?? Infinity) - (b.price ?? Infinity);
				case "price_desc":
					return (b.price ?? 0) - (a.price ?? 0);
				case "year_desc":
					return (b.year ?? 0) - (a.year ?? 0);
				case "kms_asc":
					return (a.kms ?? Infinity) - (b.kms ?? Infinity);
				default:
					return (
						new Date(b.first_seen).getTime() -
						new Date(a.first_seen).getTime()
					);
			}
		});
	}, [listings, filters]);

	const update = (partial: Partial<Filters>) =>
		setFilters((prev) => ({ ...prev, ...partial }));

	return { filters, filtered, update };
}
