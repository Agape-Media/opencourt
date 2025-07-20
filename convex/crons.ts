import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

crons.interval(
  "increment counter",
  { seconds: 1 },
  internal.waitlist.autoIncrementCount
)

export default crons
