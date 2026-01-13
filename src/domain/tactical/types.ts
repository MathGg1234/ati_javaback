export type PositionDto = {
    id?: number;
    lng: number;
    lat: number;
    date?: string; // ISO
    idObjectInField?: number;
};

export type PointCarteDto = {
    id: number;
    nom: string;
    symboleOTAN: string;
    photo?: number[] | null; // byte[] côté Java
    type: string;
    position?: PositionDto | null;
};
