import assert from "node:assert/strict"
import { isPublishableRealJob } from "@/lib/jobs"

const validJob = {
  title: "Skladnik v Nemecku",
  company: "Real Agency s.r.o.",
  description: "Overena pracovna ponuka s jasnou mzdou, nastupom, ubytovanim a kontaktom pre uchadzacov.",
  contactInfo: "jobs@real-agency.sk",
}

assert.equal(isPublishableRealJob(validJob), true)
assert.equal(isPublishableRealJob({ ...validJob, contactInfo: "jobs@westwerk.example" }), false)
assert.equal(isPublishableRealJob({ ...validJob, contactInfo: "jobs@example.com" }), false)
assert.equal(isPublishableRealJob({ ...validJob, contactInfo: "+43 000 000 000" }), false)
assert.equal(isPublishableRealJob({ ...validJob, contactInfo: undefined }), false)
