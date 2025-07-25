"use client";

import { useRef, useEffect, useState } from "react";
import { Toolbar } from "@/components/Toolbar";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { getShapes, drawExistingShapes, handelMouseDown, handelMouseMove, handelMouseUp, handelCanvasClick, handleEraserClick } from "@/lib/actions";

export type Shape = {
    id?: string,
    type: "Rectangle" | "Circle" | "Line" | "Arrow" | "Rhombus" | "Pencil" | "Eraser" | "Text",
    startX: number,
    startY: number,
    width: number,
    height: number,
    text?: string,
    fontSize?: number,
}

export function Canvas({ roomId, sendShape, incomingShapes, clearIncomingShapes, deletedShapeIds, clearDeletedShapeIds }: {
    roomId: string;
    sendShape: any;
    deletedShapeIds: any;
    incomingShapes: Shape[];
    clearIncomingShapes: () => void;
    clearDeletedShapeIds: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [activeTool, setActiveTool] = useState(1);
    const [selectedTool, setSelectedTool] = useState<"Rectangle" | "Circle" | "Line" | "Arrow" | "Rhombus" | "Pencil" | "Eraser" | "Text" | null>("Rectangle")
    const [existingShapes, setExistingShapes] = useState<Shape[]>([])
    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null)
    const [isTextMode, setIsTextMode] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [textPosition, setTextPosition] = useState<{ x: number, y: number } | null>(null);

    const initializeCanvas = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
            const messages = response.data.messages;
            const shapes = messages.map((msg: any) => {
                const shapeData = JSON.parse(msg.message);
                return {
                    ...shapeData,
                    id: msg.shapeId || `shape_${msg.id}`
                };
            });

            setExistingShapes(shapes);

            if (canvasRef.current) {
                drawExistingShapes(shapes, canvasRef.current);
            }
        } catch (error) {
            console.error("Error fetching shapes:", error);
        }
    };

    // Redraw canvas whenever existingShapes changes or canvas dimensions change
    const redrawCanvas = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                drawExistingShapes(existingShapes, canvasRef.current);
            }
        }
    };

    useEffect(() => {
        if (deletedShapeIds.length > 0) {
            setExistingShapes((prev: Shape[]) =>
                prev.filter(shape => !deletedShapeIds.includes(shape.id || ''))
            );
            clearDeletedShapeIds();
        }
    }, [deletedShapeIds, clearDeletedShapeIds]);

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Redraw when dimensions change
    useEffect(() => {
        if (canvasRef.current && dimensions.width > 0 && dimensions.height > 0) {
            setTimeout(() => {
                redrawCanvas();
            }, 10); // Small delay to ensure canvas is resized
        }
    }, [dimensions, existingShapes]);

    useEffect(() => {
        initializeCanvas()
    }, [roomId])

    useEffect(() => {
        if (canvasRef.current && incomingShapes.length > 0) {
            drawExistingShapes(incomingShapes, canvasRef.current);
            setExistingShapes((prev) => [...prev, ...incomingShapes]);
            clearIncomingShapes();
        }
    }, [incomingShapes, clearIncomingShapes])

    const handleTextSubmit = () => {
        if (textInput.trim() && textPosition) {
            const textShape: Shape = {
                type: "Text",
                startX: textPosition.x,
                startY: textPosition.y,
                width: 0,
                height: 0,
                text: textInput.trim(),
                fontSize: 16
            };

            setExistingShapes((prev: any) => [...prev, textShape]);
            sendShape({
                type: "chat",
                msg: JSON.stringify(textShape),
                roomId: roomId,
            });

            setIsTextMode(false);
            setTextInput("");
            setTextPosition(null);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleTextSubmit();
        } else if (e.key === 'Escape') {
            setIsTextMode(false);
            setTextInput("");
            setTextPosition(null);
        }
    };

    return (
        <div className="relative w-full h-full">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Toolbar
                    activeToolIndex={activeTool}
                    onToolSelect={setActiveTool}
                    onShapeChange={(value: string) => {
                        setSelectedTool(value as any);
                        if (value === "Text") {
                            setIsTextMode(false);
                        }
                    }}
                />
            </div>

            {isTextMode && textPosition && (
                <div
                    className="absolute z-20 bg-white border border-gray-300 rounded shadow-lg p-2"
                    style={{
                        left: textPosition.x,
                        top: textPosition.y,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleTextSubmit}
                        autoFocus
                        placeholder="Enter text..."
                        className="px-2 py-1 border border-gray-200 rounded text-sm outline-none"
                        style={{ minWidth: '150px' }}
                    />
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="block w-full h-full"
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={(event) => {
                    if (selectedTool === "Text") {
                        handelCanvasClick(event.nativeEvent, canvasRef.current, setTextPosition, setIsTextMode);
                    } else if (selectedTool === "Eraser") {
                        handleEraserClick(
                            event.nativeEvent,
                            canvasRef.current,
                            existingShapes,
                            setExistingShapes, 
                            roomId,
                            sendShape
                        );
                    } else {
                        handelMouseDown(event.nativeEvent, setStartPoint, canvasRef.current);
                    }
                }}
                onMouseMove={(event) => {
                    if (selectedTool !== "Text") {
                        handelMouseMove(event.nativeEvent, startPoint, existingShapes, canvasRef.current, selectedTool);
                    }
                }}
                onMouseUp={(event) => {
                    if (selectedTool !== "Text") {
                        handelMouseUp(event.nativeEvent, startPoint, setExistingShapes, canvasRef.current, setStartPoint, roomId, sendShape, selectedTool);
                    }
                }}
            />
        </div>
    );
}