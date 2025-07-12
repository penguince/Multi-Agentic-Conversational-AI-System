import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch the dataset from the provided URL
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dataset-2Qr9RNz53lb9EaOetp0WpnjWOJOys6.csv",
    )
    const csvText = await response.text()

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",")
    const data = lines.slice(1).map((line) => {
      const values = line.split(",")
      const row: any = {}
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() || ""
      })
      return row
    })

    // Calculate statistics
    const totalRecords = data.length

    // Calculate total annual rent value
    let totalValue = 0
    let validRentCount = 0
    let totalRentPerSF = 0
    let validRentPerSFCount = 0
    const associateCounts: { [key: string]: number } = {}

    data.forEach((row) => {
      // Parse annual rent
      const annualRent = row["Annual Rent"]?.replace(/[$,]/g, "")
      if (annualRent && !isNaN(Number(annualRent))) {
        totalValue += Number(annualRent)
        validRentCount++
      }

      // Parse rent per SF
      const rentPerSF = row["Rent/SF/Year"]?.replace(/[$,]/g, "")
      if (rentPerSF && !isNaN(Number(rentPerSF))) {
        totalRentPerSF += Number(rentPerSF)
        validRentPerSFCount++
      }

      // Count associates
      for (let i = 1; i <= 4; i++) {
        const associate = row[`Associate ${i}`]
        if (associate && associate.trim()) {
          associateCounts[associate] = (associateCounts[associate] || 0) + 1
        }
      }
    })

    // Find top associate
    const topAssociate = Object.entries(associateCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"

    const stats = {
      totalRecords,
      totalValue: `$${(totalValue / 1000000).toFixed(1)}M`,
      avgRentPerSF: `$${(totalRentPerSF / validRentPerSFCount).toFixed(2)}`,
      topAssociate,
      lastUpdated: new Date().toLocaleDateString(),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dataset stats:", error)
    return NextResponse.json({ error: "Failed to fetch dataset statistics" }, { status: 500 })
  }
}
