import api from './api';

export interface Polygon {
    id: number;
    name: string;
    geometry: any;
    createdAt: string;
}

export interface CreatePolygonDto {
    name: string;
    geometry: any;
}

export const polygonService = {
    getAll: async (): Promise<Polygon[]> => {
        const res = await api.get('/polygons');
        return res.data;
    },

    create: async (data: CreatePolygonDto): Promise<Polygon> => {
        const res = await api.post('/polygons', data);
        return res.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/polygons/${id}`);
    }
};