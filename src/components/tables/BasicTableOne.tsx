"use client";
import React, {useEffect, useState} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Image from "next/image";
import Button from "@/components/ui/button/Button";
import {EyeIcon, PencilIcon, TrashBinIcon} from "@/icons";
import {citizenService} from "@/services/citizenService";
import {Citizen} from "@/types/citizen";
import {Modal} from "@/components/ui/modal";
import {useModal} from "@/hooks/useModal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";

interface TableProps{
    citizens: Citizen[]
    setCitizens: (citizens: Citizen[]) => void;
}


export default function BasicTableOne ({citizens, setCitizens}: TableProps) {
    const { isOpen, openModal, closeModal } = useModal();

    const [modalType, setModalType] = useState<"view" | "edit" | "delete" | null>(null);
    const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
    const [formData, setFormData] = useState<Omit<Citizen, 'id'>>({
        name: "",
        surname: "",
        fin: "",
        serialNo: "",
        birthDate: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const openModalWith = (type: "view" | "edit" | "delete", citizen: Citizen) => {
        setModalType(type);
        setSelectedCitizen(citizen);
        openModal();
    };


    const handleSave = async () => {
        try {
            const updatedCitizen = await citizenService.update(
                // @ts-expect-error
                selectedCitizen.id,
                // @ts-expect-error
                { ...formData, id: selectedCitizen.id }
            );
            // @ts-expect-error
            setCitizens((prev:Citizen[]) =>
                prev.map((c) => (c.id === updatedCitizen.id ? updatedCitizen : c))
            );
            closeModal();
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (modalType === "edit" && selectedCitizen) {
            setFormData({
                name: selectedCitizen.name,
                surname: selectedCitizen.surname,
                fin: selectedCitizen.fin,
                serialNo: selectedCitizen.serialNo,
                birthDate: selectedCitizen.birthDate.split('T')[0]
            });
        }
    }, [modalType, selectedCitizen]);
    useEffect(() => {
        citizenService.getAll().then(setCitizens).catch(console.error);

    }, []);

    return (
        <div
            className="w-full rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="overflow-x-auto scrollbar-none">
                <div className="min-w-[1072px]">
                    <Table>
                        {/* Table Header */}
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Ad
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Soyad
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Fin
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Ş.V.Seriya nömrəsi
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Doğum tarixi
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    {" "}
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {citizens.map((citizen) => (
                                <TableRow key={citizen.id}>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 overflow-hidden rounded-full">
                                                <Image
                                                    width={40}
                                                    height={40}
                                                    src={"/images/user/person.jpg"}
                                                    alt={citizen.name}
                                                />
                                            </div>
                                            <div>
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                     {citizen.name}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        {citizen.surname}
                                    </TableCell>
                                    <TableCell
                                        className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <div className="flex -space-x-2">
                                            {citizen.fin}
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                        <div className="flex -space-x-2">
                                            {citizen.serialNo}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                        {new Date(citizen.birthDate).toLocaleDateString("az-AZ")}
                                    </TableCell>
                                    <TableCell
                                        className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 flex gap-2 pt-6">
                                        <button onClick={() => openModalWith("view", citizen)}>
                                            <Badge variant={"light"} color={"success"}>
                                                <EyeIcon className={"cursor-pointer"}/>
                                            </Badge>
                                        </button>
                                        <button onClick={() => openModalWith("edit", citizen)}>
                                            <Badge variant={"light"} color={"primary"} >
                                                <PencilIcon className={"cursor-pointer"}/>
                                            </Badge>
                                        </button>
                                        <button onClick={() => openModalWith("delete", citizen)}>
                                            <Badge variant={"light"} color={"error"}>
                                                <TrashBinIcon className={"cursor-pointer"}/>
                                            </Badge>
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Modal
                isOpen={isOpen}
                onClose={closeModal}
                className="max-w-[600px] p-5 lg:p-10"
            >
                {modalType === "view" && selectedCitizen && (
                    <>
                        <div className="flex items-center gap-5 mb-6">
                            <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 dark:border-white/[0.1]">
                                <Image
                                    width={64}
                                    height={64}
                                    src="/images/user/person.jpg"
                                    alt={selectedCitizen.name}
                                    className="object-cover w-full h-full"
                                />
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-800 text-lg dark:text-white/90">
                                    {selectedCitizen.name} {selectedCitizen.surname}
                                </h4>
                                <p className="text-gray-500 text-sm dark:text-gray-400 mt-1">
                                    Vətəndaş Məlumatları
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                            <div>
                                <span className="block text-gray-400 dark:text-gray-500">Ad:</span>
                                <span className="font-medium">{selectedCitizen.name}</span>
                            </div>

                            <div>
                                <span className="block text-gray-400 dark:text-gray-500">Soyad:</span>
                                <span className="font-medium">{selectedCitizen.surname}</span>
                            </div>

                            <div>
                                <span className="block text-gray-400 dark:text-gray-500">FIN:</span>
                                <span className="font-medium">{selectedCitizen.fin}</span>
                            </div>

                            <div>
                                <span className="block text-gray-400 dark:text-gray-500">Seriya nömrəsi:</span>
                                <span className="font-medium">{selectedCitizen.serialNo}</span>
                            </div>

                            <div>
                                <span className="block text-gray-400 dark:text-gray-500">Doğum tarixi:</span>
                                <span className="font-medium">
                                    {new Date(selectedCitizen.birthDate).toLocaleDateString("az-AZ")}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end w-full gap-3 mt-8">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Bağla
                            </Button>
                        </div>
                    </>
                )}

                {modalType === "edit" && selectedCitizen && (
                    <form
                        className="p-1"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSave(); // mövcud vətəndaşı yeniləmək üçün
                        }}
                    >
                        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
                            Vətəndaş məlumatlarını redaktə et
                        </h4>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                            <div className="col-span-1">
                                <Label>Ad</Label>
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="Elvin"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-span-1">
                                <Label>Soyad</Label>
                                <Input
                                    type="text"
                                    name="surname"
                                    placeholder="Yekayev"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-span-1">
                                <Label>FIN kodu</Label>
                                <Input
                                    type="text"
                                    name="fin"
                                    placeholder="AZ12345"
                                    value={formData.fin}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-span-1">
                                <Label>Ş.V. Seriya nömrəsi</Label>
                                <Input
                                    type="text"
                                    name="serialNo"
                                    placeholder="AZE1234567"
                                    value={formData.serialNo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-span-1 sm:col-span-2">
                                <Label>Doğum tarixi</Label>
                                <Input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end w-full gap-3 mt-8">
                            <Button size="sm" variant="outline" onClick={closeModal}>
                                Bağla
                            </Button>
                            <Button size="sm" type="submit">
                                Dəyişiklikləri yadda saxla
                            </Button>
                        </div>
                    </form>
                )}

                {modalType === "delete" && selectedCitizen && (
                    <div className="text-center">

                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-title-sm">
                            Vətəndaşı silmək istədiyinizə əminsiniz?
                        </h4>
                        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                            <b>
                                {selectedCitizen.name} {selectedCitizen.surname}
                            </b>
                            {" "}
                             sistemdən silinəcək. Bu əməliyyatı geri qaytarmaq mümkün deyil.
                        </p>

                        <div className="flex items-center justify-center w-full gap-3 mt-7">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex justify-center w-full px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg shadow-theme-xs hover:bg-gray-200 sm:w-auto"
                            >
                                Ləğv et
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    await citizenService.delete(selectedCitizen.id);
                                    // @ts-ignore
                                    setCitizens(prev => prev.filter(c => c.id !== selectedCitizen.id));
                                    closeModal();
                                }}
                                className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
                            >
                                Bəli, Sil
                            </button>
                        </div>
                    </div>
                )}

            </Modal>
        </div>
    );
}
