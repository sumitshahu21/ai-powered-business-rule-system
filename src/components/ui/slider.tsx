import React from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider: React.FC<SliderProps> = ({ value, onChange, min = 0, max = 100, step = 1 }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <div className="flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="slider"
      />
      <span className="ml-2">{value}</span>
    </div>
  );
};

export default Slider;