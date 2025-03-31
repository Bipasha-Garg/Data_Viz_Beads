import * as d3 from "d3";

const calculateProportionalAngles = (pointsData) => {
    if (!pointsData || pointsData.length === 0) {
        console.warn("pointsData is empty or invalid, returning empty angles");
        return [];
    }

    const lastRing = pointsData[pointsData.length - 1];
    const lastRingPoints = lastRing.points || [];
    const sectorsCount = Math.max(1, 2 ** pointsData.dimensions);

    if (lastRingPoints.length === 0 || !Number.isFinite(sectorsCount)) {
        console.warn("Last ring has no points or invalid sectors, using fallback angles");
        return pointsData.map((_, i) =>
            Array(Math.max(1, 2 ** (i + 1))).fill(2 * Math.PI / Math.max(1, 2 ** (i + 1)))
        );
    }

    const pointCounts = new Array(sectorsCount).fill(0);
    lastRingPoints.forEach((point) => {
        const pointData = Object.entries(point).filter(([key]) => key !== "Point_ID");
        const bitVector = pointData.map(([_, coord]) => (coord >= 0 ? 1 : 0)).join("");
        const sectorIndex = parseInt(bitVector, 2);
        if (sectorIndex >= 0 && sectorIndex < sectorsCount) pointCounts[sectorIndex]++;
    });

    const minAngle = Math.PI / 180;
    const totalAngle = 2 * Math.PI;
    const totalNonEmptyPoints = Math.max(1, pointCounts.reduce((sum, count) => sum + count, 0));
    const remainingAngle = totalAngle - sectorsCount * minAngle;

    const sectorAngles = pointCounts.map((count) =>
        count > 0 ? minAngle + (count / totalNonEmptyPoints) * remainingAngle : minAngle
    );

    const ringAngles = [sectorAngles];
    for (let i = pointsData.length - 2; i >= 0; i--) {
        const prevAngles = ringAngles[0];
        const sectorCount = Math.max(1, 2 ** (i + 1));
        const currAngles = new Array(sectorCount).fill(0).map((_, j) => (prevAngles[j * 2] || 0) + (prevAngles[j * 2 + 1] || 0));
        ringAngles.unshift(currAngles);
    }

    return ringAngles;
};

export const renderProportionalView = ({
    g,
    subspaces,
    ringVisibility,
    maxRadius,
    ringLabels,
    pointsData,
    getSectorColor,
    renderPoints,
}) => {
    const ringAngles = calculateProportionalAngles(pointsData);
    if (!ringAngles || ringAngles.length !== pointsData.length) {
        console.error("Invalid ring angles, falling back to default rendering:", ringAngles);
        return; // Optionally, call a fallback render like renderNormalView here
    }

    subspaces.forEach((key, index) => {
        if (!ringVisibility[key]) return;
        const innerRadius = (index / subspaces.length) * maxRadius;
        const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
        let currentAngle = Math.PI / 2;

        // Defensive check for ringAngles[index]
        const angles = ringAngles[index] || [];
        if (angles.length === 0) {
            console.warn(`No angles for ring ${index}, skipping rendering`);
            return;
        }

        angles.forEach((angle, i) => {
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            g.append("path")
                .attr("d", d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius)
                    .startAngle(startAngle)
                    .endAngle(endAngle)
                )
                .attr("fill", getSectorColor(index, i))
                .attr("fill-opacity", 0.3)
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .style("cursor", "pointer");

            currentAngle = endAngle;
        });

        g.append("text")
            .attr("x", 0)
            .attr("y", -outerRadius - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("fill", "red")
            .attr("font-weight", "bold")
            .text(ringLabels[index]);

        renderPoints(index, innerRadius, outerRadius, angles);
    });
};