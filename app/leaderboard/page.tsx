"use client"

import Link from "next/link"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useModels } from "@/contexts/models-context"
import { calculateWinRate } from "@/lib/models"

export default function Leaderboard() {
  const { models } = useModels()

  // Sort models by ELO rating (highest first)
  const sortedModels = [...models].sort((a, b) => b.eloRating - a.eloRating)

  return (
    <main className="flex min-h-screen flex-col items-center">
      <header className="w-full border-b">
        <div className="container flex h-16 items-center justify-between">
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="font-medium transition-colors hover:text-primary">
              Voting
            </Link>
            <Link href="/leaderboard" className="font-medium transition-colors hover:text-primary">
              Leaderboard
            </Link>
            <Link href="/about" className="font-medium transition-colors hover:text-primary">
              About
            </Link>
          </nav>
        </div>
      </header>

      <div className="container py-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">BRAINROT BENCH</h1>
        <h2 className="text-2xl font-semibold mb-6 text-center">Leaderboard</h2>

        <Table>
          <TableCaption>Current standings based on user votes</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">ELO Score</TableHead>
              <TableHead className="text-right">Win Rate</TableHead>
              <TableHead className="text-right">Wins</TableHead>
              <TableHead className="text-right">Losses</TableHead>
              <TableHead className="text-right">Ties</TableHead>
              <TableHead className="text-right">Total Votes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedModels.map((model, index) => (
              <TableRow key={model.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{model.name}</TableCell>
                <TableCell className="text-right">{model.eloRating}</TableCell>
                <TableCell className="text-right">{calculateWinRate(model).toFixed(1)}%</TableCell>
                <TableCell className="text-right">{model.wins}</TableCell>
                <TableCell className="text-right">{model.losses}</TableCell>
                <TableCell className="text-right">{model.ties}</TableCell>
                <TableCell className="text-right">{model.totalVotes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
