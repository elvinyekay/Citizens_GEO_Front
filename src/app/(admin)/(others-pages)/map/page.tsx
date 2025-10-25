"use client";

import React, {useCallback, useEffect, useRef, useState} from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Polygon as OLPolygon } from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON';
import 'ol/ol.css';
import { polygonService, Polygon, CreatePolygonDto } from '@/services/polygonService';
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Checkbox from "@/components/form/input/Checkbox";
import Alert from "@/components/ui/alert/Alert";
import {TrashBinIcon} from "@/icons";

export default function MapPage() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<Map | null>(null);
    const vectorSource = useRef<VectorSource>(new VectorSource());
    const drawInteraction = useRef<Draw | null>(null);
    const currentFeature = useRef<Feature | null>(null);

    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [checkedPolygons, setCheckedPolygons] = useState<Set<number>>(new Set());
    const [isDrawing, setIsDrawing] = useState(false);
    const [polygonName, setPolygonName] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const [alert, setAlert] = useState<{
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
        isVisible: boolean;
    }>({
        type: 'success',
        title: '',
        message: '',
        isVisible: false
    });

    const [confirmDialog, setConfirmDialog] = useState<{
        isVisible: boolean;
        title: string;
        message: string;
        polygonId: number | null;
    }>({
        isVisible: false,
        title: '',
        message: '',
        polygonId: null
    });

    const showAlert = (
        type: 'success' | 'error' | 'warning' | 'info',
        title: string,
        message: string
    ) => {
        setAlert({ type, title, message, isVisible: true });
        setTimeout(() => {
            setAlert(prev => ({ ...prev, isVisible: false }));
        }, 5000);
    };

    const loadPolygons = useCallback(async () => {
        try {
            const data = await polygonService.getAll();
            setPolygons(data);
        } catch (error) {
            console.error('Error loading polygons:', error);
            showAlert('error', 'Xəta', 'Polygon-lar yüklənərkən xəta baş verdi');
        }
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        const vectorLayer = new VectorLayer({
            source: vectorSource.current,
            style: {
                'fill-color': 'rgba(255, 0, 0, 0.2)',
                'stroke-color': '#ff0000',
                'stroke-width': 2,
            },
        });

        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                vectorLayer,
            ],
            view: new View({
                center: fromLonLat([49.8671, 40.4093]),
                zoom: 12,
            }),
        });

        mapInstance.current = map;
        loadPolygons();

        return () => {
            map.setTarget(undefined);
            mapInstance.current = null; // ƏLAVƏ: null et
        };
    }, [loadPolygons]);


    const startDrawing = () => {
        if (!mapInstance.current) return;

        const draw = new Draw({
            source: vectorSource.current,
            type: 'Polygon',
            freehand: false,
        });

        draw.on('drawend', (event) => {
            currentFeature.current = event.feature;
            setShowSaveDialog(true);
            stopDrawing();
        });

        mapInstance.current.addInteraction(draw);
        drawInteraction.current = draw;
        setIsDrawing(true);
    };

    const stopDrawing = () => {
        if (drawInteraction.current && mapInstance.current) {
            mapInstance.current.removeInteraction(drawInteraction.current);
            drawInteraction.current = null;
            setIsDrawing(false);
        }
    };

    const savePolygon = async () => {
        if (!currentFeature.current || !polygonName.trim()) {
            showAlert('warning', 'Məlumat Əksikdir', 'Zəhmət olmasa polygon adı daxil edin');
            return;
        }

        try {
            const geometry = currentFeature.current.getGeometry() as OLPolygon;
            const format = new GeoJSON();
            const geoJson = format.writeGeometryObject(geometry, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857',
            });

            const dto: CreatePolygonDto = {
                name: polygonName,
                geometry: geoJson,
            };

            const newPolygon = await polygonService.create(dto);

            setCheckedPolygons(prev => new Set(prev).add(newPolygon.id));

            if (currentFeature.current) {
                currentFeature.current.set('polygonId', newPolygon.id);
            }

            setPolygonName('');
            setShowSaveDialog(false);
            currentFeature.current = null;

            loadPolygons();

            showAlert('success', 'Uğurlu Əməliyyat', `"${newPolygon.name}" polygon-u uğurla yadda saxlanıldı və xəritədə görünür`);
        } catch (error) {
            console.error('Error saving polygon:', error);
            showAlert('error', 'Xəta Baş Verdi', 'Polygon yadda saxlanarkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin');
        }
    };

    const togglePolygon = (polygon: Polygon, checked: boolean) => {
        if (checked) {
            setCheckedPolygons(prev => new Set(prev).add(polygon.id));

            const format = new GeoJSON();
            const feature = format.readFeature(polygon.geometry, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857',
            });

            if (feature instanceof Feature) {
                feature.set('polygonId', polygon.id);
                vectorSource.current.addFeature(feature);
            }
        } else {
            setCheckedPolygons(prev => {
                const newSet = new Set(prev);
                newSet.delete(polygon.id);
                return newSet;
            });

            const features = vectorSource.current.getFeatures();
            const featureToRemove = features.find(
                (f) => f.get('polygonId') === polygon.id
            );
            if (featureToRemove) {
                vectorSource.current.removeFeature(featureToRemove);
            }
        }
    };

    const confirmDeletePolygon = (id: number) => {
        const polygon = polygons.find(p => p.id === id);
        if (!polygon) return;

        setConfirmDialog({
            isVisible: true,
            title: 'Polygon Silinəcək',
            message: `"${polygon.name}" polygon-unu silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.`,
            polygonId: id
        });
    };

    const deletePolygon = async () => {
        const id = confirmDialog.polygonId;
        if (!id) return;

        const polygon = polygons.find(p => p.id === id);
        if (!polygon) return;

        setConfirmDialog({
            isVisible: false,
            title: '',
            message: '',
            polygonId: null
        });

        try {
            await polygonService.delete(id);

            const features = vectorSource.current.getFeatures();
            const featureToRemove = features.find(
                (f) => f.get('polygonId') === id
            );
            if (featureToRemove) {
                vectorSource.current.removeFeature(featureToRemove);
            }

            setCheckedPolygons(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });

            setPolygons((prev) => prev.filter((p) => p.id !== id));

            showAlert('success', 'Silindi', `"${polygon.name}" polygon-u uğurla silindi`);
        } catch (error) {
            console.error('Error deleting polygon:', error);
            showAlert('error', 'Xəta', 'Polygon silinərkən xəta baş verdi');
        }
    };

    return (
        <div className="relative h-screen">
            <div ref={mapRef} className="absolute inset-0 w-full h-full" />

            {alert.isVisible && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in slide-in-from-top-2">
                    <Alert
                        variant={alert.type}
                        title={alert.title}
                        message={alert.message}
                    />
                </div>
            )}

            {confirmDialog.isVisible && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-6">
                            <Alert
                                variant="warning"
                                title={confirmDialog.title}
                                message={confirmDialog.message}
                            />
                        </div>

                        <div className="flex items-center gap-3 px-6 pb-6">
                            <Button
                                onClick={() => setConfirmDialog({
                                    isVisible: false,
                                    title: '',
                                    message: '',
                                    polygonId: null
                                })}
                                variant="outline"
                                className="flex-1"
                            >
                                Ləğv et
                            </Button>
                            <Button
                                onClick={deletePolygon}
                                variant="destructive"
                                className="flex-1"
                            >
                                Sil
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {!isDrawing ? (
                    <>
                        <Button onClick={startDrawing}>
                            Polygon Çək
                        </Button>
                        <div className="mt-2 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg text-xs text-gray-600 dark:text-gray-300 shadow-lg">
                            <p className="font-semibold mb-1">💡 Məsləhət:</p>
                            <p>• Xəritəni sürüşdürmək: Sol düyməni basıb sürüşdür</p>
                            <p>• Zoom: Mouse təkəri və ya +/- düymələri</p>
                        </div>
                    </>
                ) : (
                    <>
                        <Button onClick={stopDrawing} variant="destructive">
                            Ləğv et
                        </Button>
                        <div className="mt-2 p-3 bg-yellow-50/90 dark:bg-yellow-900/30 backdrop-blur-md rounded-lg text-xs text-yellow-800 dark:text-yellow-200 shadow-lg border border-yellow-200 dark:border-yellow-700">
                            <p className="font-semibold mb-1">✏️ Polygon Çəkilir:</p>
                            <p>• Klikləyərək nöqtələr əlavə edin</p>
                            <p>• İlk nöqtəyə klikləyərək tamamlayın</p>
                        </div>
                    </>
                )}
            </div>

            {showSaveDialog && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Polygon Yadda Saxla</h3>
                        <Input
                            placeholder="Polygon adı"
                            value={polygonName}
                            onChange={(e) => setPolygonName(e.target.value)}
                            className="mb-4"
                        />
                        <div className="flex gap-2">
                            <Button onClick={savePolygon} className="flex-1">
                                Saxla
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowSaveDialog(false);
                                    setPolygonName('');
                                    if (currentFeature.current) {
                                        vectorSource.current.removeFeature(currentFeature.current);
                                        currentFeature.current = null;
                                    }
                                }}
                                variant="outline"
                                className="flex-1"
                            >
                                Ləğv et
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute top-0 right-0 h-full w-80 backdrop-blur-lg bg-white/80 dark:bg-gray-900/85 border-l border-white/20 dark:border-gray-700/30 p-4 overflow-y-auto shadow-2xl z-10">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Polygon-lar</h2>

                {polygons.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">Heç bir polygon yoxdur</p>
                ) : (
                    <div className="space-y-3">
                        {polygons.map((polygon) => (
                            <div
                                key={polygon.id}
                                className="px-2 py-1 border border-white/30 dark:border-gray-700/50 rounded-lg backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all shadow-md"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={checkedPolygons.has(polygon.id)}
                                            onChange={(checked) =>
                                                togglePolygon(polygon, checked)
                                            }
                                        />
                                        <span className="font-medium text-gray-900 dark:text-white">{polygon.name}</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => confirmDeletePolygon(polygon.id)}
                                    >
                                        <TrashBinIcon color={"red"}/>
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(polygon.createdAt).toLocaleDateString('az-AZ')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}