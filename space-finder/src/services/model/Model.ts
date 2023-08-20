

export interface ToolsItemEntry {
    id: string,
    seqNo?:number;
    name: string,
    photoUrl?: string,
    videoUrl?: string,
    url?:string;
    ItemListIcon?: string;
    description?: string;
    longDescription?: string;
    category?: string;
    promo?: boolean;
    weight?: string;
    size?: string;
    maxPrice?: string;
    maxDiscountPercent?: string;
    wareHouseId?: string;
}