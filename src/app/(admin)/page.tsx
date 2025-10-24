"use client";
import React, {useState} from "react";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import Button from "@/components/ui/button/Button";
import {
    PlusIcon
} from "../../icons/index";
import {useModal} from "@/hooks/useModal";
import {Modal} from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import {citizenService} from "@/services/citizenService";
import {Citizen} from "@/types/citizen";



export default function Ecommerce() {

    const { isOpen, openModal, closeModal } = useModal();
    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        fin: "",
        serialNo: "",
        birthDate: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await citizenService.create(formData);
            closeModal();
            const updated = await citizenService.getAll();
            setCitizens(updated);
        } catch (err) {
            console.error("Vətəndaş əlavə olunarkən xəta baş verdi:", err);
        }
    };
    return (
        <div>
            <div className="space-y-6">
                <ComponentCard title="Vətəndəşların siyahısı">
                    <div className={"flex items-center justify-end"}>
                        <Button size="md" variant="outline" onClick={openModal}>
                            <PlusIcon/>
                            Yarat
                        </Button>
                    </div>
                    <BasicTableOne citizens={citizens} setCitizens={setCitizens} />
                </ComponentCard>
            </div>

            <Modal
                isOpen={isOpen}
                onClose={closeModal}
                className="max-w-[584px] p-5 lg:p-10"
            >
                <form
                    className="p-1"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave(); // yeni vətəndaş göndərmək üçün
                    }}
                >
                    <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Yeni vətəndaş əlavə et
                    </h4>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                        <div className="col-span-1">
                            <Label>Ad</Label>
                            <Input
                                type="text"
                                name="name"
                                placeholder="Elvin"
                                defaultValue={formData.name}
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
                                defaultValue={formData.surname}
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
                                defaultValue={formData.fin}
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
                                defaultValue={formData.serialNo}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-span-1 sm:col-span-2">
                            <Label>Doğum tarixi</Label>
                            <Input
                                type="date"
                                name="birthDate"
                                defaultValue={formData.birthDate}
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
                            Yadda saxla
                        </Button>
                    </div>
                </form>

            </Modal>
        </div>

    );
}
