/*
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

import * as React from "react";
import { ArithmeticExpression, ArithmeticOperation } from "../../../common/models/expression/concreteArithmeticOperation";
import { ExpressionSeriesOperation } from "../../../common/models/expression/expression";
import { Measure } from "../../../common/models/measure/measure";
import { Measures } from "../../../common/models/measure/measures";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { SeriesFormat } from "../../../common/models/series/series-format";
import { Binary } from "../../../common/utils/functional/functional";
import { isTruthy } from "../../../common/utils/general/general";
import { Dropdown } from "../dropdown/dropdown";
import { FormatPicker } from "./format-picker";

interface ArithmeticOperationSeriesMenuProps {
  measure: Measure;
  measures: Measures;
  seriesList: SeriesList;
  series: ExpressionSeries;
  onChange: Binary<ExpressionSeries, boolean, void>;
}

interface Operation {
  id: ArithmeticOperation;
  label: string;
}

const OPERATIONS: Operation[] = [{
  id: ExpressionSeriesOperation.ADD, label: "Add"
}, {
  id: ExpressionSeriesOperation.SUBTRACT, label: "Subtract"
}, {
  id: ExpressionSeriesOperation.MULTIPLY, label: "Multiply"
}, {
  id: ExpressionSeriesOperation.DIVIDE, label: "Divide"
}];

const renderOperation = (op: Operation): string => op.label;

const renderMeasure = (m: Measure): string => m.title;
const renderSelectedMeasure = (m: Measure): string => m ? m.title : "Select measure";

export const ArithmeticSeriesMenu: React.SFC<ArithmeticOperationSeriesMenuProps> = props => {
  const { measure, measures, series, seriesList, onChange } = props;

  function isSeriesValid(series: ExpressionSeries): boolean {
    return series.expression instanceof ArithmeticExpression
      && isTruthy(series.expression.reference)
      && !seriesList.hasSeriesWithKey(series.key());
  }

  function onSeriesChange(series: ExpressionSeries) {
    onChange(series, isSeriesValid(series));
  }

  function onFormatChange(format: SeriesFormat) {
    onSeriesChange(series.set("format", format));
  }

  function onOperationSelect({ id }: Operation) {
    onSeriesChange(series.setIn(["expression", "operation"], id));
  }

  function onOperandSelect({ name }: Measure) {
    onSeriesChange(series.setIn(["expression", "reference"], name));
  }

  const isValid = isSeriesValid(series);
  const expression = series.expression as ArithmeticExpression;
  const operation = OPERATIONS.find(op => op.id === expression.operation);
  const operand = measures.getMeasureByName(expression.reference);

  return <React.Fragment>
    <Dropdown<Operation>
      className="operation-select"
      items={OPERATIONS}
      renderItem={renderOperation}
      equal={(a, b) => a.id === b.id}
      selectedItem={operation}
      onSelect={onOperationSelect}
    />
    <Dropdown<Measure>
      className="operand-select"
      items={measures.filterMeasures(m => !m.equals(measure))}
      renderItem={renderMeasure}
      renderSelectedItem={renderSelectedMeasure}
      equal={(a, b) => a.equals(b)}
      selectedItem={operand}
      onSelect={onOperandSelect}
    />
    {!isValid && "Invalid selection"}
    <FormatPicker
      measure={measure}
      format={series.format}
      formatChange={onFormatChange}
    />
  </React.Fragment>;
};