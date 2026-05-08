import { EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Listing } from "@/hooks/useListings";

type Props = {
	listing: Listing;
	onHide: (id: string) => Promise<void>;
	onRemove: (id: string) => Promise<void>;
};

function formatPrice(price: number | null) {
	if (price == null) return "—";
	if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
	return `₹${price.toLocaleString("en-IN")}`;
}

function formatKms(kms: number | null) {
	if (kms == null) return "—";
	return `${kms.toLocaleString("en-IN")} km`;
}

export function CarCard({ listing, onHide, onRemove }: Props) {
	const [imageOpen, setImageOpen] = useState(false);

	const title = [listing.make, listing.model, listing.variant]
		.filter(Boolean)
		.join(" ");

	const lowestPrice =
		listing.price ??
		Math.min(...Object.values(listing.sources ?? {}).map((s) => s.price));

	return (
		<>
			<Card className="flex flex-col">
				{listing.image_url && (
					<button
						type="button"
						onClick={() => setImageOpen(true)}
						className="w-full overflow-hidden rounded-t-xl"
						aria-label="View full image"
					>
						<img
							src={listing.image_url}
							alt={title}
							className="h-48 w-full object-cover transition-transform hover:scale-105"
						/>
					</button>
				)}

				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<p className="text-2xl font-bold text-foreground">
						{formatPrice(lowestPrice)}
					</p>
				</CardHeader>

				<CardContent className="flex flex-col gap-2">
					<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
						{listing.year && <span>Year: {listing.year}</span>}
						{listing.kms != null && (
							<span>KMs: {formatKms(listing.kms)}</span>
						)}
						{listing.color && <span>Colour: {listing.color}</span>}
						{listing.transmission && (
							<span>{listing.transmission}</span>
						)}
						{listing.location && <span>{listing.location}</span>}
						{listing.fuel && <span>{listing.fuel}</span>}
					</div>

					{Object.keys(listing.sources ?? {}).length > 0 && (
						<div className="flex flex-wrap gap-1.5 mt-1">
							{Object.entries(listing.sources).map(
								([source, { url }]) => (
									<a
										key={source}
										href={url}
										target="_blank"
										rel="noreferrer"
									>
										<Badge
											variant="outline"
											className="capitalize cursor-pointer hover:bg-muted"
										>
											{source}
										</Badge>
									</a>
								),
							)}
						</div>
					)}
				</CardContent>

				<CardFooter className="mt-auto justify-end gap-2">
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => onHide(listing.id)}
						aria-label="Hide listing"
						className="text-muted-foreground hover:text-foreground"
					>
						<EyeOff />
					</Button>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => onRemove(listing.id)}
						aria-label="Delete listing"
						className="text-muted-foreground hover:text-destructive"
					>
						<Trash2 />
					</Button>
				</CardFooter>
			</Card>

			{listing.image_url && (
				<Dialog open={imageOpen} onOpenChange={setImageOpen}>
					<DialogContent className="max-w-3xl p-0">
						<DialogTitle className="sr-only">{title}</DialogTitle>
						<img
							src={listing.image_url}
							alt={title}
							className="w-full rounded-lg object-contain max-h-[80vh]"
						/>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
