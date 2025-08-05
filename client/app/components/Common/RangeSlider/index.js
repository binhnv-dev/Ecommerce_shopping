/**
 *
 *  Range Slider
 *
 */

import React, { useState } from 'react';
import Slider, { SliderTooltip } from 'rc-slider';

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);
const { Handle } = Slider;

const handleChange = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <SliderTooltip
      prefixCls="rc-slider-tooltip"
      overlay={`$${value}`}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </SliderTooltip>
  );
};
const RangeSlider = ({ type = 'range', marks, step, defaultValue }) => {
  const [sliderValue, setSliderValue] = useState(defaultValue || 100);
  const [rangeValue, setRangeValue] = useState(defaultValue || [1, 500]);

  const handleSliderChange = (value) => {
    setSliderValue(value);
  };

  const handleRangeChange = (value) => {
    setRangeValue(value);
  };
  const handleAfterChange = (value) => {
    onChange?.(value);
  };
  return (
    <>
      {type === 'slider' ? (
        <Slider
          className="slider"
          dots
          min={20}
          max={100}
          step={step}
          defaultValue={defaultValue}
          marks={marks}
          value={sliderValue}
          onChange={handleSliderChange}
          onAfterChange={handleAfterChange}
        />
      ) : (
        <Range
          className="slider"
          pushable={100}
          min={1}
          max={500}
          marks={marks}
          handle={handleChange}
          tipFormatter={(value) => `$${value}`}
          defaultValue={defaultValue}
          value={rangeValue}
          onChange={handleRangeChange}
          onAfterChange={handleAfterChange}
        />
      )}
    </>
  );
};

export default RangeSlider;
