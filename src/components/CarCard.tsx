import { ChevronDown, ChevronUp, Droplet, EyeOff, Fuel, Gauge, MapPin, Settings2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
	const [expanded, setExpanded] = useState(false);

	const logoSlug = listing.make?.toLowerCase().replace(/\s+/g, "-");
	const logoUrl = logoSlug ? `/car-hunter-ui/logos/${logoSlug}.png` : null;

	const modelText = [listing.model, listing.variant].filter(Boolean).join(" ");

	const title = [listing.make, listing.model, listing.variant]
		.filter(Boolean)
		.join(" ");

	const lowestPrice =
		listing.price ??
		Math.min(...Object.values(listing.sources ?? {}).map((s) => s.price));

	const primaryUrl = Object.values(listing.sources ?? {})[0]?.url;

	const handleTileClick = () => {
		if (primaryUrl) window.open(primaryUrl, "_blank", "noreferrer");
	};

	return (
		<>
			<div className="border-b last:border-b-0">
				{/* Tile row — clicking goes to link */}
				<div
					role="link"
					tabIndex={0}
					onClick={handleTileClick}
					onKeyDown={(e) => e.key === "Enter" && handleTileClick()}
					className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
				>
					{!expanded && (
						listing.image_url ? (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setImageOpen(true);
								}}
								className="shrink-0 w-12 h-12 overflow-hidden rounded"
								aria-label="View full image"
							>
								<img
									src={listing.image_url}
									alt={title}
									className="h-full w-full object-contain"
								/>
							</button>
						) : (
							<div className="shrink-0 w-12 h-12 rounded bg-muted" />
						)
					)}

					<div className="flex-1 min-w-0 py-2 pr-2">
						<p className="flex items-center gap-1.5 text-sm font-medium leading-snug overflow-hidden">
							{listing.year && <span>{listing.year}</span>}
							{logoUrl && (
								<img
									src={logoUrl}
									alt={listing.make ?? ""}
									className="h-4 w-4 object-contain shrink-0"
									onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
								/>
							)}
							{modelText && <span className="truncate">{modelText}</span>}
						</p>
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold text-foreground">
								{formatPrice(lowestPrice)}
							</span>
							{listing.kms != null && (
								<span> · {formatKms(listing.kms)}</span>
							)}
						</p>
					</div>

					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							setExpanded((v) => !v);
						}}
						className="shrink-0 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors border-l"
						aria-label={expanded ? "Collapse" : "Expand"}
					>
						{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
					</button>
				</div>

				{/* Expanded details — clicks don't navigate */}
				{expanded && (
					<div
						className="px-3 pb-3 pt-1 bg-muted/30"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<div className="flex items-center gap-3 mb-2">
							{listing.image_url && (
								<button
									type="button"
									onClick={() => setImageOpen(true)}
									className="shrink-0 w-24 h-24 overflow-hidden rounded-lg bg-muted"
									aria-label="View full image"
								>
									<img
										src={listing.image_url}
										alt={title}
										className="h-full w-full object-cover"
									/>
								</button>
							)}
							<div className="flex flex-col justify-center gap-1 text-sm text-muted-foreground">
								{listing.fuel && (
									<span className="flex items-center gap-1.5"><Fuel size={13} />{listing.fuel}</span>
								)}
								{listing.kms != null && (
									<span className="flex items-center gap-1.5"><Gauge size={13} />{formatKms(listing.kms)}</span>
								)}
								{listing.transmission && (
									<span className="flex items-center gap-1.5"><Settings2 size={13} />{listing.transmission}</span>
								)}
								{listing.location && (
									<span className="flex items-center gap-1.5"><MapPin size={13} />{listing.location}</span>
								)}
								{listing.color && (
									<span className="flex items-center gap-1.5"><Droplet size={13} />{listing.color}</span>
								)}
							</div>
						</div>
						<div className="flex justify-center gap-[8px] mb-2">
							{Array.from({ length: 8 }).map((_, i) => (
								<div key={i} className="w-[4px] h-[4px] rounded-full bg-border" />
							))}
						</div>
						<div className="grid grid-cols-3 items-center">
							<div />
							<div className="flex justify-center gap-1">
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
							</div>

							{Object.keys(listing.sources ?? {}).length > 0 && (
								<div className="flex gap-1.5 justify-end">
									{Object.entries(listing.sources).map(([source, { url }]) => (
										<a
											key={source}
											href={url}
											target="_blank"
											rel="noreferrer"
											onClick={(e) => e.stopPropagation()}
											title={source}
										>
											<img
												src={`https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`}
												alt={source}
												className="w-5 h-5 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
											/>
										</a>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</div>

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
