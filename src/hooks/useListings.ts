import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type Listing = {
	id: string;
	make: string;
	model: string;
	variant: string | null;
	year: number | null;
	kms: number | null;
	fuel: string | null;
	transmission: string | null;
	color: string | null;
	location: string | null;
	state: string | null;
	price: number | null;
	image_url: string | null;
	sources: Record<string, { url: string; price: number }>;
	first_seen: string;
	is_active: boolean;
};

export function useListings() {
	const [listings, setListings] = useState<Listing[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		supabase
			.from("listings")
			.select("*")
			.eq("is_active", true)
			.order("first_seen", { ascending: false })
			.then(({ data, error }) => {
				if (error) setError(error.message);
				else setListings(data ?? []);
				setLoading(false);
			});
	}, []);

	const hide = async (id: string) => {
		const prev = listings;
		setListings((l) => l.filter((x) => x.id !== id));
		const { error } = await supabase
			.from("listings")
			.update({ is_active: false })
			.eq("id", id);
		if (error) setListings(prev);
	};

	const remove = async (id: string) => {
		const prev = listings;
		setListings((l) => l.filter((x) => x.id !== id));
		const { error } = await supabase.from("listings").delete().eq("id", id);
		if (error) setListings(prev);
	};

	return { listings, loading, error, hide, remove };
}

export function useHiddenListings() {
	const [listings, setListings] = useState<Listing[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		supabase
			.from("listings")
			.select("*")
			.eq("is_active", false)
			.order("first_seen", { ascending: false })
			.then(({ data, error }) => {
				if (error) setError(error.message);
				else setListings(data ?? []);
				setLoading(false);
			});
	}, []);

	const restore = async (id: string) => {
		const prev = listings;
		setListings((l) => l.filter((x) => x.id !== id));
		const { error } = await supabase
			.from("listings")
			.update({ is_active: true })
			.eq("id", id);
		if (error) setListings(prev);
	};

	return { listings, loading, error, restore };
}
