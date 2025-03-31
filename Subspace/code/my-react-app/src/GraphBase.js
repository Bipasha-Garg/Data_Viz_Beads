import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { renderNormalView } from "./NormalView";
import { renderProportionalView } from "./ProportionalView";

const HierarchicalGraph = ({ jsonData, labelsData, setHoveredCoordinates, ringVisibility }) => {
    const graphRef = useRef(null);
    const [viewMode, setViewMode] = useState("normal");

    useEffect(() => {
        if (!jsonData || typeof jsonData !== "object" || Object.keys(jsonData).length === 0) {
            console.error("Invalid or empty jsonData:", jsonData);
            return;
        }
        if (!labelsData || typeof labelsData !== "object") {
            console.error("Invalid labelsData:", labelsData);
            return;
        }

        const svg = d3.select(graphRef.current);
        svg.selectAll("*").remove();

        const width = 800;
        const height = 800;
        const margin = 20;
        const maxRadius = Math.min(width, height) / 2 - margin;

        const g = svg
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "rgba(0, 0, 0, 0.7)")
            .style("color", "white")
            .style("padding", "5px")
            .style("border-radius", "4px")
            .style("font-size", "12px");


        const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(Object.keys(labelsData.labels || {}));
        const getLabelColor = (pointId) => {
            if (!labelsData || !labelsData.labels) return "gray";
            for (const label of Object.keys(labelsData.labels)) {
                const pointList = labelsData.labels[label];
                if (Array.isArray(pointList) && pointList.includes(Number(pointId))) {
                    return colorScale(label);
                }
            }
            return "gray";
        };

        const getRingColor = (index) => {
            const totalRings = Object.keys(jsonData).length;
            const colorScaleInd = d3.scaleSequential(d3.interpolatePlasma).domain([totalRings, 0]);
            return d3.color(colorScaleInd(index));
        };

        const getSectorColor = (index, sectorIndex) => {
            const baseColor = d3.hsl(getRingColor(index));
            const isPositive = sectorIndex % 2 === 0;
            return d3.hsl(baseColor.h, baseColor.s, isPositive ? 0.75 : 0.35).toString();
        };

        const subspaces = Object.keys(jsonData).sort((a, b) => a.length - b.length);
        const pointsData = subspaces.map((key) => ({
            key,
            points: jsonData[key] || [],
            dimensions: key.length,
            subspaceId: key,
        }));
        const ringLabels = subspaces.map((_, i) => String.fromCharCode(65 + i));
        const pointPositions = {};
        const renderPoints = (index, innerRadius, outerRadius, anglesOrSectors) => {
            const isProportional = viewMode === "proportional";
            const sectors = isProportional && anglesOrSectors ? anglesOrSectors.length : anglesOrSectors || 1; // Fallback to 1 if undefined
            const angles = isProportional && anglesOrSectors ? anglesOrSectors : Array(sectors).fill(2 * Math.PI / sectors);
            let currentAngle = Math.PI / 2;

            if (!pointsData[index] || !pointsData[index].points) {
                console.warn(`No points data for index ${index}, skipping rendering`);
                return;
            }

            pointsData[index].points.forEach((point, i) => {
                const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
                const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
                const bitVectorIndex = Math.min(parseInt(bitVector, 2), sectors - 1);

                const startAngle = isProportional
                    ? currentAngle + angles.slice(0, bitVectorIndex).reduce((a, b) => a + b, 0)
                    : (2 * Math.PI * bitVectorIndex) / sectors;
                const angleWidth = isProportional ? angles[bitVectorIndex] : (2 * Math.PI / sectors);
                const centerAngle = startAngle + angleWidth / 2;

                const overlapRadius =
                    innerRadius +
                    (0.9 * (outerRadius - innerRadius) * (i % pointsData[index].points.length)) /
                    pointsData[index].points.length;
                const x = overlapRadius * Math.cos(centerAngle);
                const y = overlapRadius * Math.sin(centerAngle);

                point.Point_ID.forEach((id) => {
                    if (!pointPositions[id]) pointPositions[id] = [];
                    pointPositions[id].push({ x, y, point, subspaceId: pointsData[index].key });
                });

                g.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", 3)
                    .attr("fill", "black")
                    .attr("stroke", "white")
                    .attr("stroke-width", 0.5)
                    .style("pointer-events", "visible")
                    .on("mouseover", (event) => {
                        const pointIds = point.Point_ID.join(", ");
                        const associatedLabels = Object.entries(labelsData.labels || {})
                            .filter(([_, pointList]) => point.Point_ID.some((id) => pointList.includes(Number(id))))
                            .map(([label]) => label);
                        const labelText = associatedLabels.length > 0 ? associatedLabels.join(", ") : "No Label";

                        tooltip
                            .style("visibility", "visible")
                            .html(
                                `Point_IDs: ${pointIds}<br>Coordinates: (${x.toFixed(2)}, ${y.toFixed(2)})<br>Subspace: ${pointsData[index].key}<br>Label: ${labelText}`
                            );
                        setHoveredCoordinates({ ...point, label: labelText });
                    })
                    .on("mousemove", (event) => {
                        tooltip.style("top", event.pageY + 10 + "px").style("left", event.pageX + 10 + "px");
                    })
                    .on("mouseout", () => {
                        tooltip.style("visibility", "hidden");
                        setHoveredCoordinates(null);
                    });
            });
        };
        if (viewMode === "normal") {
            renderNormalView({
                g,
                subspaces,
                ringVisibility,
                maxRadius,
                ringLabels,
                pointsData,
                getSectorColor,
                renderPoints,
            });
        } else {
            renderProportionalView({
                g,
                subspaces,
                ringVisibility,
                maxRadius,
                ringLabels,
                pointsData,
                getSectorColor,
                renderPoints,
            });
        }

        Object.entries(pointPositions).forEach(([pointId, positions]) => {
            if (positions.length > 1) {
                for (let i = 0; i < positions.length - 1; i++) {
                    g.append("line")
                        .attr("x1", positions[i].x)
                        .attr("y1", positions[i].y)
                        .attr("x2", positions[i + 1].x)
                        .attr("y2", positions[i + 1].y)
                        .attr("stroke", getLabelColor(pointId))
                        .attr("stroke-width", 1.5)
                        .attr("stroke-opacity", 0.9)
                        .style("cursor", "pointer")
                        .on("mouseover", () => tooltip.style("visibility", "visible").html(`Connection: Point_ID ${pointId}`))
                        .on("mousemove", (event) => tooltip.style("top", event.pageY + 10 + "px").style("left", event.pageX + 10 + "px"))
                        .on("mouseout", () => tooltip.style("visibility", "hidden"));
                }
            }
        });

        const zoom = d3.zoom().on("zoom", (event) => g.attr("transform", event.transform));
        svg.call(zoom);

        return () => tooltip.remove();
    }, [jsonData, labelsData, ringVisibility, setHoveredCoordinates, viewMode]);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <div style={{ marginBottom: "10px" }}>
                <button
                    onClick={() => setViewMode("normal")}
                    style={{
                        marginRight: "10px",
                        padding: "5px 10px",
                        backgroundColor: viewMode === "normal" ? "#4CAF50" : "#f0f0f0",
                        color: viewMode === "normal" ? "white" : "black",
                    }}
                >
                    Normal View
                </button>
                <button
                    onClick={() => setViewMode("proportional")}
                    style={{
                        padding: "5px 10px",
                        backgroundColor: viewMode === "proportional" ? "#4CAF50" : "#f0f0f0",
                        color: viewMode === "proportional" ? "white" : "black",
                    }}
                >
                    Proportional View
                </button>
            </div>
            <svg ref={graphRef} style={{ width: "100%", height: "800px" }}></svg>
        </div>
    );
};

export default HierarchicalGraph;