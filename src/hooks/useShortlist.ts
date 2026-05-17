import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useShortlist() {
	const [ids, setIds] = useState<Set<string>>(new Set());
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		supabase
			.from("shortlist")
			.select("listing_id")
			.then(({ data }) => {
				if (data) setIds(new Set(data.map((r) => r.listing_id)));
				setIsLoaded(true);
			});
	}, []);

	const toggle = async (id: string) => {
		const prev = new Set(ids);
		const isIn = ids.has(id);
		setIds((curr) => {
			const next = new Set(curr);
			if (isIn) next.delete(id);
			else next.add(id);
			return next;
		});
		const { error } = isIn
			? await supabase.from("shortlist").delete().eq("listing_id", id)
			: await supabase.from("shortlist").insert({ listing_id: id });
		if (error) setIds(prev);
	};

	const removeFromShortlist = async (id: string) => {
		if (!ids.has(id)) return;
		const prev = new Set(ids);
		setIds((curr) => {
			const next = new Set(curr);
			next.delete(id);
			return next;
		});
		const { error } = await supabase
			.from("shortlist")
			.delete()
			.eq("listing_id", id);
		if (error) setIds(prev);
	};

	return { shortlistedIds: ids, isLoaded, toggle, removeFromShortlist };
}
