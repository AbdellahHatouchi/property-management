import { Text, View } from '@react-pdf/renderer'
import { tw } from './document-pdf'
export default function Feiled({ label, value }: {
  label: string,
  value: string
}) {
  return (
    <View style={tw('flex flex-row gap-2')}>
      <Text style={tw('text-sm mb-2 font-semibold')}>{label}</Text>
      <Text style={tw('text-sm')}>{value}</Text>
    </View>
  )
}
