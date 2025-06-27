"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

interface ProductCarouselProps {
  images: { image_url: string; is_primary?: boolean }[]
  productName: string
  className?: string
}

export function ProductCarousel({ images, productName, className }: ProductCarouselProps) {
  const [api, setApi] = React.useState<any>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const scrollTo = (index: number) => {
    api?.scrollTo(index)
  }

  if (!images || images.length === 0) {
    return (
      <div className={cn("aspect-square relative bg-gray-900", className)}>
        <Image
          src="/placeholder.svg"
          alt={productName}
          fill
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="aspect-square relative bg-black">
                <Image
                  src={image.image_url}
                  alt={`${productName} - Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                current === index
                  ? "bg-white scale-110"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
} 