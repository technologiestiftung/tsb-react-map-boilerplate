import React, { Fragment } from "react";
import { Layer, Feature } from "react-mapbox-gl";
import { useStoreActions, useStoreState } from "easy-peasy";
import idx from "idx";

import history from "../../../history";

const paintPropsDefault = {
  "circle-radius": 6,
  "circle-color": "#D4D4D4",
  "circle-stroke-color": "white",
  "circle-stroke-width": 4,
  "circle-opacity": 1,
};

const MarkerLayer = (p) => {
  const { data } = p;
  const setTooltipPos = useStoreActions((actions) => actions.setTooltipPos);
  const setTooltipData = useStoreActions((actions) => actions.setTooltipData);
  const setHighlightData = useStoreActions((a) => a.setHighlightData);
  const highlightData = useStoreState((a) => a.highlightData);
  const paintProps = getPaintProps(highlightData);
  // const legendType = c.about.legend.id;

  const handleMouseEnter = (evt, { properties = {} }) => {
    evt.map.getCanvas().style.cursor = "pointer";
    setTooltipData(properties);
  };

  function getPaintProps(highlightData) {
    const itemId = idx(highlightData, (_) => _.properties.autoid) || "";
    const activeExpr =
      ["case", ["==", ["string", ["get", "autoid"]], itemId], 12, 6] || "";
    // const markerColors = c.map.marker.color;

    return {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, activeExpr],
      "circle-color": ["get", "color"],
      "circle-stroke-width": [
        "case",
        ["==", ["string", ["get", "autoid"]], itemId],
        12,
        4,
      ],
      "circle-stroke-color": "white",
    };
  }

  const handleMouseLeave = (evt) => {
    evt.map.getCanvas().style.cursor = "";
    setTooltipData(null);
  };

  const handleClick = (evt, data) => {
    evt.originalEvent.preventDefault();
    evt.originalEvent.stopPropagation();

    setHighlightData(data);

    const nextLocation = `/liste/${data.properties.autoid}`;
    history.push(nextLocation);
  };

  const renderFeat = (feat, i) => {
    const feature = (
      <Feature
        coordinates={feat.geometry.coordinates}
        key={`feat-${i}`}
        onMouseEnter={(evt) => handleMouseEnter(evt, feat)}
        onMouseLeave={(evt) => handleMouseLeave(evt)}
        onClick={(evt) => handleClick(evt, feat)}
        properties={feat.properties}
      />
    );
    return feature;
  };

  const handleMouseMove = (evt) => {
    setTooltipPos([evt.lngLat.lng, evt.lngLat.lat]);
  };

  return (
    <Fragment>
      <Layer
        id="MarkerLayerData"
        type="circle"
        paint={paintPropsDefault}
        onMouseMove={(evt) => handleMouseMove(evt)}
      >
        {data.features.map((feat, i) => renderFeat(feat, i))}
        {/* {data.features.filter(d => !d.properties.filtered).map(feat => renderFeat(feat))} */}
      </Layer>
      <Layer
        id="MarkerLayer"
        type="circle"
        paint={paintProps}
        onMouseMove={(evt) => handleMouseMove(evt)}
      >
        {/* { data.features.map((feat, i) => renderFeat(feat, i)) } */}
        {data.features
          .filter((d) => !d.properties.filtered)
          .map((feat) => renderFeat(feat))}
      </Layer>
    </Fragment>
  );
};

export default MarkerLayer;
