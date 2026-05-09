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
	state: string | null;
	sort: SortKey;
};

const DEFAULT_FILTERS: Filters = {
	make: null,
	minYear: null,
	maxKms: null,
	state: null,
	sort: "first_seen_desc",
};

function readFromUrl(): Filters {
	const p = new URLSearchParams(window.location.search);
	const sort = p.get("sort") as SortKey | null;
	return {
		make: p.get("make"),
		minYear: p.get("year") ? Number(p.get("year")) : null,
		maxKms: p.get("kms") ? Number(p.get("kms")) : null,
		state: p.get("state"),
		sort: sort ?? "first_seen_desc",
	};
}

function writeToUrl(f: Filters) {
	const p = new URLSearchParams();
	if (f.make) p.set("make", f.make);
	if (f.minYear) p.set("year", String(f.minYear));
	if (f.maxKms) p.set("kms", String(f.maxKms));
	if (f.state) p.set("state", f.state);
	if (f.sort !== "first_seen_desc") p.set("sort", f.sort);
	const qs = p.toString();
	history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

export function useFilters(listings: Listing[]) {
	const [filters, setFilters] = useState<Filters>(() => readFromUrl());

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
		if (filters.state) {
			const state = filters.state;
			result = result.filter(
				(l) => l.state?.toLowerCase() === state.toLowerCase(),
			);
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
		setFilters((prev) => {
			const next = { ...prev, ...partial };
			writeToUrl(next);
			return next;
		});

	const reset = () => {
		setFilters(DEFAULT_FILTERS);
		writeToUrl(DEFAULT_FILTERS);
	};

	return { filters, filtered, update, reset };
}
