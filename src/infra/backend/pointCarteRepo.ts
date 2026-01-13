import { http } from "./httpClient";

export type PointCarteDto = {
  id: number;
  nom: string;
  type: string;
  symboleOTAN: string;
  position: { lng: number; lat: number };
};

export interface PointCarteRepo {
  fetchPointCartes(token: string): Promise<PointCarteDto[]>;
  createTacticalPoint(params: {
    token: string;
    nom: string;
    symboleOTAN: string;
    type: string;
    lng: number;
    lat: number;
  }): Promise<PointCarteDto>;
}

export class PointCarteRepoImpl implements PointCarteRepo {
  async fetchPointCartes(token: string) {
    return http<PointCarteDto[]>({
      path: "/backend/api/v1/tacticalPoint",
      method: "GET",
      token,
    });
  }

  async createTacticalPoint({ token, nom, symboleOTAN, type, lng, lat }: { token: string; nom: string; symboleOTAN: string; type: string; lng: number; lat: number }) {
    // IMPORTANT: httpClient.stringify déjà le body -> on lui passe un objet
    return http<PointCarteDto>({
      path: "/backend/api/v1/tacticalPoint",
      method: "POST",
      token,
      body: {
        nom,
        symboleOTAN,
        type,
        position: { lng, lat },
      },
    });
  }
}
