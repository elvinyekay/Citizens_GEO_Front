import api from "./api";
import {Citizen} from "@/types/citizen";

export const citizenService = {
    getAll: async (): Promise<Citizen[]> => {
        const res = await api.get("/citizens");
        return res.data;
    },

    getById: async (id: number): Promise<Citizen> => {
        const res = await api.get(`/citizens/${id}`);
        return res.data;
    },

    create: async (data: Omit<Citizen, "id">) : Promise<Citizen> => {
        const res = await api.post("/citizens", data);
        return res.data;
    },

    update: async (id: number, data: Citizen): Promise<Citizen> => {
        const res = await api.put(`/citizens/${id}`, data);
        return res.data;
    },

    delete: async (id: number) : Promise<void> => {
        await api.delete(`/citizens/${id}`);
    },
};
