import { STATIONS, type StationId } from '../../api/kitchen/stations'
import { SelectMenu } from './SelectMenu'

interface Props {
  value: StationId
  counts: Record<StationId, number>
  onChange: (station: StationId) => void
}

export function StationMenu({ value, counts, onChange }: Props) {
  return (
    <SelectMenu
      value={value}
      onChange={onChange}
      buttonLabel="Lọc theo trạm bếp"
      listLabel="Trạm bếp"
      options={STATIONS.map((station) => ({
        value: station.id,
        label: station.label,
        count: counts[station.id],
      }))}
    />
  )
}
