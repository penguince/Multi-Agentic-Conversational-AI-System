export async function getStats() {
  // Simulate API call to get dashboard stats
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    conversations: 1247,
    users: 89,
    documents: 156,
    successRate: 94.2,
  }
}
