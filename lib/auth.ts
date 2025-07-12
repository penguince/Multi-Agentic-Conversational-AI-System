export async function getCurrentUser() {
  // In a real app, this would validate a JWT token or session
  // For demo purposes, we'll simulate checking localStorage on the server
  return {
    id: "1",
    name: "John Smith",
    email: "john.smith@okada.co",
    role: "admin",
  }
}
