"use client"
import { motion } from "framer-motion"

interface CollageItem {
  id: number
  src: string
  initialX: number
  initialY: number
  size: number
  rotation: number
  speed: number
  direction: number
}

export default function AnimatedBackground() {
  // Create an array of collage items with random positions and properties
  const collageItems: CollageItem[] = [
    {
      id: 1,
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4POTDuJtGCbGZx9AumUSDLIiB7coIg.png", // Airplane with crocodile head
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 15 + Math.random() * 10,
      rotation: Math.random() * 20 - 10,
      speed: 0.5 + Math.random() * 0.5,
      direction: Math.random() > 0.5 ? 1 : -1,
    },
    {
      id: 2,
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eKEWkdIcQB6ca6JVcxbMjnHifUHFQZ.png", // Shark with sneakers
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 12 + Math.random() * 8,
      rotation: Math.random() * 20 - 10,
      speed: 0.3 + Math.random() * 0.4,
      direction: Math.random() > 0.5 ? 1 : -1,
    },
    {
      id: 3,
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-6DrkMIPfkZHQ7Pt4VVOkyMuhc8Z80A.png", // Ninja coffee cup
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 10 + Math.random() * 8,
      rotation: Math.random() * 20 - 10,
      speed: 0.4 + Math.random() * 0.5,
      direction: Math.random() > 0.5 ? 1 : -1,
    },
    // Additional items for the collage
    {
      id: 4,
      src: "/placeholder.svg?height=200&width=200&text=AI+Model+1",
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 8 + Math.random() * 6,
      rotation: Math.random() * 20 - 10,
      speed: 0.2 + Math.random() * 0.3,
      direction: Math.random() > 0.5 ? 1 : -1,
    },
    {
      id: 5,
      src: "/placeholder.svg?height=200&width=200&text=AI+Model+2",
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 9 + Math.random() * 7,
      rotation: Math.random() * 20 - 10,
      speed: 0.3 + Math.random() * 0.4,
      direction: Math.random() > 0.5 ? 1 : -1,
    },
    {
      id: 6,
      src: "/placeholder.svg?height=200&width=200&text=Vote",
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 7 + Math.random() * 5,
      rotation: Math.random() * 20 - 10,
      speed: 0.4 + Math.random() * 0.3,
      direction: Math.random() > 0.5 ? 1 : -1,
    },
    {
      id: 7,
      src: "/placeholder.svg?height=200&width=200&text=Italian+Brainrot",
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 10 + Math.random() * 8,
      rotation: Math.random() * 20 - 10,
      speed: 0.5 + Math.random() * 0.4,
      direction: Math.random() > 0.5 ? 1 : -1,
    },
    {
      id: 8,
      src: "/placeholder.svg?height=200&width=200&text=ELO+Rating",
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 8 + Math.random() * 6,
      rotation: Math.random() * 20 - 10,
      speed: 0.3 + Math.random() * 0.3,
      direction: Math.random() > 0.5 ? 1 : -1,
    },
    {
      id: 9,
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-4POTDuJtGCbGZx9AumUSDLIiB7coIg.png",
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 18 + Math.random() * 12,
      rotation: Math.random() * 20 - 10,
      speed: 0.6 + Math.random() * 0.5,
      direction: Math.random() > 0.5 ? 1 : -1,
    },
    {
      id: 10,
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-eKEWkdIcQB6ca6JVcxbMjnHifUHFQZ.png",
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 14 + Math.random() * 10,
      rotation: Math.random() * 20 - 10,
      speed: 0.4 + Math.random() * 0.5,
      direction: Math.random() > 0.5 ? 1 : -1,
    },
    {
      id: 11,
      src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-6DrkMIPfkZHQ7Pt4VVOkyMuhc8Z80A.png",
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 16 + Math.random() * 10,
      rotation: Math.random() * 20 - 10,
      speed: 0.5 + Math.random() * 0.6,
      direction: Math.random() > 0.5 ? 1 : -1,
    },
    {
      id: 12,
      src: "/placeholder.svg?height=200&width=200&text=Brainrot",
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 12 + Math.random() * 8,
      rotation: Math.random() * 20 - 10,
      speed: 0.3 + Math.random() * 0.4,
      direction: Math.random() > 0.5 ? 1 : -1,
    },
  ]

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Semi-transparent overlay to ensure content readability */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      {/* Animated collage items */}
      {collageItems.map((item) => (
        <motion.div
          key={item.id}
          className="absolute rounded-lg overflow-hidden shadow-lg opacity-60"
          style={{
            width: `${item.size}vw`,
            height: `${item.size}vw`,
            left: `${item.initialX}vw`,
            top: `${item.initialY}vh`,
            rotate: `${item.rotation}deg`,
          }}
          animate={{
            x: [0, item.direction * 100, 0],
            y: [0, item.direction * -50, 0],
            rotate: [item.rotation, item.rotation + item.direction * 10, item.rotation],
          }}
          transition={{
            duration: 20 / item.speed,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <img src={item.src || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
        </motion.div>
      ))}
    </div>
  )
}
