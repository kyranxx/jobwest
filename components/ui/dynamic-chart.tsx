"use client"

"use client"

import dynamic from 'next/dynamic'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle } from './chart'

const Chart = dynamic(() => import('./chart').then(mod => mod.ChartContainer), {
  ssr: false,
  loading: () => <p>Loading chart...</p>,
})

export default Chart
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle }
