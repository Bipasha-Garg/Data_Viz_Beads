import * as d3 from "d3";

export const renderNormalView = ({
  g,
  subspaces,
  ringVisibility,
  maxRadius,
  ringLabels,
  pointsData,
  getSectorColor,
  renderPoints,
}) => {
    subspaces.forEach((key, index) => {
              if (!ringVisibility[key]) return;
              const innerRadius = (index / subspaces.length) * maxRadius;
              const outerRadius = ((index + 1) / subspaces.length) * maxRadius;
              const sectors = 2 ** (index + 1);
              const rotationOffset = Math.PI / 2;
      
              for (let i = 0; i < sectors; i++) {
                const startAngle = (2 * Math.PI * i) / sectors + rotationOffset;
                const endAngle = (2 * Math.PI * (i + 1)) / sectors + rotationOffset;
      
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
      
                g.append("text")
                  .attr("x", 0)
                  .attr("y", -outerRadius - 5)
                  .attr("text-anchor", "middle")
                  .attr("font-size", "16px")
                  .attr("fill", "red")
                  .attr("font-weight", "bold")
                  .text(ringLabels[index]);
              }
              renderPoints(index, innerRadius, outerRadius, sectors);
            });
          };
      