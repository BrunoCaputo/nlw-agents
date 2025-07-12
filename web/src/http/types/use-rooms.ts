import { useQuery } from "@tanstack/react-query"
import type { GetRoomsResponse } from "./get-rooms-response"

export function useRooms() {
  return useQuery({
    queryKey: ['get-rooms'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3333/rooms')
      const resultData: GetRoomsResponse = await response.json()

      return resultData
    },
  })
}