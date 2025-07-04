"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RotateCcw } from "lucide-react"

interface MoreFiltersProps {
  isAccommodationProvided: boolean
  setIsAccommodationProvided: (isProvided: boolean) => void
  isAccommodationPaid: boolean
  setIsAccommodationPaid: (isPaid: boolean) => void
  resetFilters: () => void
}

export function MoreFilters({
  isAccommodationProvided,
  setIsAccommodationProvided,
  isAccommodationPaid,
  setIsAccommodationPaid,
  resetFilters,
}: MoreFiltersProps) {
  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Ubytovanie</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="accommodation-provided-more"
              checked={isAccommodationProvided}
              onCheckedChange={(checked) => setIsAccommodationProvided(Boolean(checked))}
              className="h-5 w-5"
            />
            <Label htmlFor="accommodation-provided-more" className="text-base font-normal">
              Zabezpečené
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="accommodation-paid-more"
              checked={isAccommodationPaid}
              onCheckedChange={(checked) => setIsAccommodationPaid(Boolean(checked))}
              className="h-5 w-5"
            />
            <Label htmlFor="accommodation-paid-more" className="text-base font-normal">
              Hradené
            </Label>
          </div>
        </div>
      </div>
      <div className="pt-4 space-y-3">
        <Button
          variant="outline"
          size="lg"
          className="w-full text-base"
          onClick={resetFilters}
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Resetovať všetky filtre
        </Button>
      </div>
    </div>
  )
}
