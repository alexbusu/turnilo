/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Dataset, Datum } from "plywood";
import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { formatValue } from "../../../common/utils/formatter/formatter";
import { Scroller } from "../../components/scroller/scroller";
import { SPLIT } from "../../config/constants";
import { formatSegment } from "../table/table";
import "./heat-map.scss";
import { HeatmapLabels } from "./heatmap-labels";
import { HeatMapRectangles, RectangleData } from "./heatmap-rectangles";

interface LabelledHeatmapProps {
  essence: Essence;
  dataset: Datum[];
  onHover?(data: RectangleData): void;
  onHoverStop?(): void;
}

interface LabelledHeatmapState {
  hoveredRectangle: RectangleData | null;
  maxLabelWidth: number;
}

export class LabelledHeatmap extends React.PureComponent<LabelledHeatmapProps, LabelledHeatmapState> {
  state: LabelledHeatmapState = {
    hoveredRectangle: null,
    maxLabelWidth: 200
  };

  handleHover = (data: RectangleData) => {
    if (!this.state.hoveredRectangle || this.state.hoveredRectangle.datum !== data.datum) {
      this.setState({ hoveredRectangle: data });
    }
    const { onHover = () => {} } = this.props;
    onHover(data);
  }

  handleHoverStop = () => {
    this.setState({ hoveredRectangle: null });
    const { onHoverStop = () => {} } = this.props;
    onHoverStop();
  }

  handleMaxLabelWidth = (maxLabelWidth: number) => {
    this.setState({ maxLabelWidth: Math.min(maxLabelWidth, 200) });
  }

  render() {
    const { dataset } = this.props;
    const { hoveredRectangle, maxLabelWidth } = this.state;

    const measure = this.props.essence.getEffectiveSelectedMeasures().first();
    const [firstSplit, secondSplit] = this.props.essence.splits.splits.slice(0, 2).toArray();

    const leftLabels = dataset.map(datum => formatSegment(
      datum[firstSplit.reference],
      this.props.essence.timezone
    ));
    const topLabels = (dataset[0][SPLIT] as Dataset).data.map(datum => formatSegment(
      datum[secondSplit.reference],
      this.props.essence.timezone
    ));

    return (
      <Scroller
        layout={{
          bodyHeight: leftLabels.length * 25,
          bodyWidth: topLabels.length * 25,
          top: 120,
          right: 0,
          bottom: 0,
          left: maxLabelWidth
        }}
        topGutter={<HeatmapLabels orientation="top" labels={topLabels} hoveredLabel={hoveredRectangle ? hoveredRectangle.row : -1} />}
        leftGutter={<HeatmapLabels orientation="left" labels={leftLabels} hoveredLabel={hoveredRectangle ? hoveredRectangle.column : -1} onMaxLabelSize={this.handleMaxLabelWidth} />}
        topLeftCorner={<div className="top-left-corner-mask" />}
        body={[
          <HeatMapRectangles
            key="heatmap"
            onHover={this.handleHover}
            onHoverStop={this.handleHoverStop}
            dataset={dataset}
            measureName={measure.name}
            hoveredRectangle={this.state.hoveredRectangle}
            leftLabelName={firstSplit.reference}
            topLabelName={secondSplit.reference}
          />
        ]}
      />
    );
  }
}
