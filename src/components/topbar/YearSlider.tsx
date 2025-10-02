import { YEARS, type Year } from '../../types/models'

interface YearSliderProps {
  value: Year
  onChange: (year: Year) => void
}

export function YearSlider({ value, onChange }: YearSliderProps) {
  const min = YEARS[0]
  const max = YEARS[YEARS.length - 1]

  return (
    <div className="year-slider">
      <label htmlFor="year-slider-input">Année {value}</label>
      <input
        id="year-slider-input"
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value) as Year)}
      />
      <div className="year-slider__ticks">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
